#!/usr/bin/env python3
"""
AWS Batch Job Handler — Python drop-in replacement for the TS worker.

Runs inside a Docker container on AWS Batch (Fargate) for projects whose
uncompressed size ≥ 5 MB (too large for Lambda's 15-min timeout).

Environment variables (passed by batch-trigger via container overrides):
  JOB_ID, USER_ID, S3_BUCKET, INPUT_S3_KEY,
  SOURCE_LANGUAGE, TARGET_LANGUAGE,
  CONVERSION_JOB_TABLE, USAGE_RECORD_TABLE,
  ANTHROPIC_API_KEY
"""

from __future__ import annotations

import io
import json
import logging
import re
import sys
import time
import zipfile
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone

import anthropic

from config import load_config
from languages import should_ignore_path, is_source_file, is_manifest_file
from splitter import split_file, reassemble_chunks
from prompts import SourceFile, build_system_instruction
from converter import (
    ConvertedFile,
    split_into_batches,
    convert_batch,
)
from verifier import repair_file
from quality import compute_quality_metrics
from aws_helpers import (
    download_from_s3,
    upload_to_s3,
    list_s3_objects,
    update_job_status,
    increment_usage,
)

# ── Logging ──────────────────────────────────────────────────────────────────

logging.basicConfig(
    format='{"timestamp":"%(asctime)s","level":"%(levelname)s","message":"%(message)s"}',
    datefmt="%Y-%m-%dT%H:%M:%S",
    level=logging.INFO,
)
logger = logging.getLogger("worker")

# ── Constants ────────────────────────────────────────────────────────────────

MAX_SINGLE_FILE_BYTES = 10 * 1024 * 1024  # 10 MB
SPLIT_THRESHOLD_BYTES = 50 * 1024          # 50 KB — files above this are split into chunks
SPLIT_CHUNK_TARGET_BYTES = 40 * 1024       # 40 KB — target size per chunk (≈10K tokens)
DOWNLOAD_CONCURRENCY = 25
UPLOAD_CONCURRENCY = 25


# ── Main ─────────────────────────────────────────────────────────────────────

def main() -> None:
    start_time = time.monotonic()

    # ── 1. Configuration ────────────────────────────────────────────────────
    cfg, missing = load_config()
    if missing:
        error_msg = f"Missing required environment variables: {', '.join(missing)}"
        logger.error(error_msg)
        if cfg.job_id and cfg.conversion_job_table:
            try:
                update_job_status(cfg, "FAILED", {
                    "statusMessage": "Conversion failed due to a configuration error. Please contact support.",
                    "errorDetails": error_msg,
                    "taskStatus": "BATCH_CONFIG_ERROR",
                })
            except Exception as e:
                logger.error("Failed to update job status: %s", e)
        sys.exit(1)

    logger.info(
        "Batch job started — input=%s src=%s tgt=%s",
        cfg.input_s3_key, cfg.source_language, cfg.target_language,
    )

    # Anthropic client
    client = anthropic.Anthropic(api_key=cfg.anthropic_api_key)

    try:
        # ── 2. Mark CONVERTING ──────────────────────────────────────────────
        update_job_status(cfg, "CONVERTING", {
            "statusMessage": "Processing large project...",
            "progress": 10,
            "taskStatus": "BATCH_RUNNING",
        })

        # ── 3. Download & filter source files ───────────────────────────────
        logger.info("Downloading input files from S3")
        source_files: list[SourceFile] = []
        manifest_files: list[dict] = []
        total_lines = 0

        is_zip = cfg.input_s3_key.lower().endswith(".zip")

        if is_zip:
            zip_bytes = download_from_s3(cfg, cfg.input_s3_key)
            with zipfile.ZipFile(io.BytesIO(zip_bytes)) as zf:
                entries = [n for n in zf.namelist() if not n.endswith("/")]
                logger.info("ZIP contains %d entries", len(entries))

                for rel_path in entries:
                    if should_ignore_path(rel_path):
                        continue
                    content = zf.read(rel_path).decode("utf-8", errors="replace")

                    if is_source_file(rel_path, cfg.source_language):
                        if len(content) > MAX_SINGLE_FILE_BYTES:
                            logger.warning("Skipping %s — exceeds 10 MB", rel_path)
                            continue
                        if len(content) > SPLIT_THRESHOLD_BYTES:
                            result = split_file(content, target_size_bytes=SPLIT_CHUNK_TARGET_BYTES)
                            for chunk in result.chunks:
                                chunk_path = f"{rel_path} (part {chunk.index + 1}/{chunk.total})"
                                chunk_content = result.context_header + chunk.content
                                total_lines += chunk_content.count("\n") + 1
                                source_files.append(SourceFile(
                                    path=chunk_path,
                                    content=chunk_content,
                                    size=len(chunk_content),
                                ))
                            logger.info("Split %s into %d chunks", rel_path, len(result.chunks))
                        else:
                            total_lines += content.count("\n") + 1
                            source_files.append(SourceFile(path=rel_path, content=content, size=len(content)))
                    elif is_manifest_file(rel_path):
                        manifest_files.append({"path": rel_path, "content": content})
        else:
            # Prefix-based (GitHub repos)
            logger.info("Listing input files from S3")
            object_keys = list_s3_objects(cfg, cfg.input_s3_key)

            keys_to_download: list[dict] = []
            for key in object_keys:
                rel = key[len(cfg.input_s3_key):]
                if should_ignore_path(rel):
                    continue
                if is_source_file(rel, cfg.source_language):
                    keys_to_download.append({"key": key, "rel": rel, "type": "source"})
                elif is_manifest_file(rel):
                    keys_to_download.append({"key": key, "rel": rel, "type": "manifest"})

            logger.info("Filtered %d S3 objects → %d to download", len(object_keys), len(keys_to_download))

            def _download_one(item: dict) -> None:
                nonlocal total_lines
                content = download_from_s3(cfg, item["key"]).decode("utf-8", errors="replace")
                rel = item["rel"]
                if item["type"] == "source":
                    if len(content) > MAX_SINGLE_FILE_BYTES:
                        logger.warning("Skipping %s — exceeds 10 MB", rel)
                        return
                    if len(content) > SPLIT_THRESHOLD_BYTES:
                        result = split_file(content, target_size_bytes=SPLIT_CHUNK_TARGET_BYTES)
                        for chunk in result.chunks:
                            chunk_path = f"{rel} (part {chunk.index + 1}/{chunk.total})"
                            chunk_content = result.context_header + chunk.content
                            total_lines += chunk_content.count("\n") + 1
                            source_files.append(SourceFile(
                                path=chunk_path,
                                content=chunk_content,
                                size=len(chunk_content),
                            ))
                        logger.info("Split %s into %d chunks", rel, len(result.chunks))
                    else:
                        total_lines += content.count("\n") + 1
                        source_files.append(SourceFile(path=rel, content=content, size=len(content)))
                else:
                    manifest_files.append({"path": rel, "content": content})

            # Download in parallel batches
            for i in range(0, len(keys_to_download), DOWNLOAD_CONCURRENCY):
                batch = keys_to_download[i:i + DOWNLOAD_CONCURRENCY]
                with ThreadPoolExecutor(max_workers=DOWNLOAD_CONCURRENCY) as pool:
                    futures = [pool.submit(_download_one, item) for item in batch]
                    for fut in as_completed(futures):
                        fut.result()  # propagate exceptions

        logger.info(
            "Extracted %d source files, %d manifests (%d total lines)",
            len(source_files), len(manifest_files), total_lines,
        )

        if not source_files:
            update_job_status(cfg, "FAILED", {
                "statusMessage": f"No {cfg.source_language} files found in the uploaded project",
                "errorDetails": "No source files matching the selected language were found",
            })
            return

        update_job_status(cfg, "CONVERTING", {
            "totalFiles": len(source_files),
            "linesOfCode": total_lines,
            "progress": 20,
        })

        # ── 4. Batch & convert ──────────────────────────────────────────────
        batches = split_into_batches(source_files)
        logger.info("Created %d batches for conversion", len(batches))

        system_instruction = build_system_instruction(
            source_files, manifest_files,
            cfg.source_language, cfg.target_language,
        )

        all_converted: list[ConvertedFile] = []
        total_tokens_used = 0

        for i, batch in enumerate(batches):
            progress = 20 + int((i / len(batches)) * 60)
            update_job_status(cfg, "CONVERTING", {
                "statusMessage": f"Converting batch {i + 1} of {len(batches)}...",
                "progress": progress,
                "completedFiles": sum(1 for f in all_converted if f.success),
            })

            result = convert_batch(
                cfg, client, batch, i, len(batches), system_instruction,
            )
            all_converted.extend(result.files)
            total_tokens_used += result.tokens_used

            if i < len(batches) - 1:
                time.sleep(0.3)

        # ── 5. Verify & repair ──────────────────────────────────────────────
        logger.info("Running verification & repair loop")
        for idx, conv in enumerate(all_converted):
            repair_result = repair_file(cfg, client, conv, cfg.target_language)
            all_converted[idx] = repair_result.file
            total_tokens_used += repair_result.tokens_used

        # ── 6. Reassemble split chunks ──────────────────────────────────────
        grouped: dict[str, dict] = {}
        non_split: list[ConvertedFile] = []
        part_re = re.compile(r"(.+) \(part (\d+)/(\d+)\)$")

        for f in all_converted:
            m = part_re.match(f.original_path)
            if m:
                orig, idx_str, total_str = m.group(1), m.group(2), m.group(3)
                idx_val = int(idx_str) - 1
                total_val = int(total_str)
                if orig not in grouped:
                    grouped[orig] = {"chunks": [None] * total_val, "total": total_val}
                grouped[orig]["chunks"][idx_val] = f
            else:
                non_split.append(f)

        reassembled: list[ConvertedFile] = list(non_split)

        for orig_path, data in grouped.items():
            chunks: list[ConvertedFile | None] = data["chunks"]
            total = data["total"]
            all_ok = all(c is not None and c.success and c.content for c in chunks)

            if all_ok:
                contents = [c.content for c in chunks]  # type: ignore[union-attr]
                stitched = reassemble_chunks(contents)
                first = chunks[0]  # type: ignore[index]
                reassembled.append(ConvertedFile(
                    original_path=orig_path,
                    converted_path=first.converted_path,
                    content=stitched,
                    success=True,
                    notes=first.notes,
                    syntax_correctness=round(
                        sum((c.syntax_correctness or 0) for c in chunks if c) / total  # type: ignore
                    ),
                    semantic_accuracy=round(
                        sum((c.semantic_accuracy or 0) for c in chunks if c) / total  # type: ignore
                    ),
                    code_style_score=round(
                        sum((c.code_style_score or 0) for c in chunks if c) / total  # type: ignore
                    ),
                    test_coverage=round(
                        sum((c.test_coverage or 0) for c in chunks if c) / total  # type: ignore
                    ),
                ))
            else:
                failed_chunk = next((c for c in chunks if c and not c.success), None)
                reassembled.append(ConvertedFile(
                    original_path=orig_path,
                    converted_path=None,
                    content=None,
                    success=False,
                    error=failed_chunk.error if failed_chunk else "One or more parts failed",
                ))

        # ── 7. Upload results to S3 ─────────────────────────────────────────
        logger.info("Uploading converted files to S3")
        storage_identity_id = cfg.storage_identity_id
        output_prefix = f"outputs/{storage_identity_id}/{cfg.job_id}"

        success_files = [f for f in reassembled if f.success and f.content and f.converted_path]
        failed_files = [f for f in reassembled if not f.success]

        # Upload individual files in parallel batches
        def _upload_one(f: ConvertedFile) -> None:
            upload_to_s3(cfg, f"{output_prefix}/{f.converted_path}", f.content)  # type: ignore[arg-type]

        for i in range(0, len(success_files), UPLOAD_CONCURRENCY):
            batch = success_files[i:i + UPLOAD_CONCURRENCY]
            with ThreadPoolExecutor(max_workers=UPLOAD_CONCURRENCY) as pool:
                futures = [pool.submit(_upload_one, f) for f in batch]
                for fut in as_completed(futures):
                    fut.result()

        # Create output ZIP
        output_zip_key: str | None = None
        if success_files:
            buf = io.BytesIO()
            with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
                for f in success_files:
                    zf.writestr(f.converted_path, f.content)  # type: ignore[arg-type]
            zip_bytes = buf.getvalue()
            output_zip_key = f"{output_prefix}/converted.zip"
            upload_to_s3(cfg, output_zip_key, zip_bytes, "application/zip")
            logger.info("Output ZIP uploaded: %s (%.1f KB)", output_zip_key, len(zip_bytes) / 1024)

        # ── 8. Quality report ───────────────────────────────────────────────
        elapsed_ms = int((time.monotonic() - start_time) * 1000)
        report_key: str | None = None
        try:
            report = {
                "jobId": cfg.job_id,
                "sourceLanguage": cfg.source_language,
                "targetLanguage": cfg.target_language,
                "totalFiles": len(reassembled),
                "successCount": len(success_files),
                "failedCount": len(failed_files),
                "tokensUsed": total_tokens_used,
                "linesOfCode": total_lines,
                "processingTimeMs": elapsed_ms,
                "convertedAt": datetime.now(timezone.utc).isoformat(),
                "files": [
                    {
                        "originalPath": f.original_path,
                        "convertedPath": f.converted_path,
                        "success": f.success,
                        **({"error": f.error} if f.error else {}),
                        **({"notes": f.notes} if f.notes else {}),
                        "syntaxCorrectness": f.syntax_correctness,
                        "semanticAccuracy": f.semantic_accuracy,
                        "codeStyleScore": f.code_style_score,
                        "testCoverage": f.test_coverage,
                    }
                    for f in reassembled
                ],
                "failedFiles": [
                    {"path": f.original_path, "error": f.error}
                    for f in failed_files
                ],
            }
            report_key = f"reports/{storage_identity_id}/{cfg.job_id}/report.json"
            upload_to_s3(cfg, report_key, json.dumps(report, indent=2), "application/json")
            logger.info("Quality report uploaded: %s", report_key)
        except Exception as e:
            logger.warning("Failed to upload quality report (non-fatal): %s", e)
            report_key = None

        # ── 9. Compute quality & update DynamoDB ────────────────────────────
        metrics = compute_quality_metrics(reassembled)
        increment_usage(cfg, total_tokens_used, total_lines)

        output_key = f"{output_prefix}/"
        final_status = "COMPLETED" if not failed_files else "COMPLETED_WITH_ERRORS"
        status_msg = (
            f"Successfully converted {len(success_files)} files"
            if not failed_files
            else f"Converted {len(success_files)} files with {len(failed_files)} failures"
        )

        failed_file_names = []
        for f in failed_files:
            err_clip = f" ({f.error[:197]}...)" if f.error and len(f.error) > 200 else f" ({f.error})" if f.error else " (unknown error)"
            failed_file_names.append(f"{f.original_path}{err_clip}")

        update_job_status(cfg, final_status, {
            "statusMessage": status_msg,
            "progress": 100,
            "outputS3Key": output_key,
            "outputZipS3Key": output_zip_key,
            "outputS3Bucket": cfg.s3_bucket,
            "qualityReportS3Key": report_key,
            **metrics,
            "tokensUsed": total_tokens_used,
            "completedFiles": len(success_files),
            "failedFiles": len(failed_files),
            "failedFileNames": failed_file_names,
            "processingTimeMs": elapsed_ms,
            "completedAt": datetime.now(timezone.utc).isoformat(),
            "taskStatus": "BATCH_COMPLETED",
            "totalFiles": len(reassembled),
            "linesOfCode": total_lines,
        })

        logger.info(
            "Batch job completed — %d success, %d failed, %d ms",
            len(success_files), len(failed_files), elapsed_ms,
        )

    except Exception as exc:
        logger.exception("Batch job failed")
        err_str = str(exc)
        is_quota = any(
            kw in err_str.lower()
            for kw in [
                "rate limit", "quota exceeded", "resource_exhausted", "429",
                "overloaded", "temporarily unavailable", "503", "502", "500",
                "timeout", "econnreset", "etimedout", "econnrefused",
            ]
        )
        update_job_status(cfg, "FAILED", {
            "statusMessage": "Conversion failed. Please try again or contact support if the issue persists.",
            "errorDetails": (
                "Service temporarily unavailable. Please try again later."
                if is_quota
                else str(exc)
            ),
            "taskStatus": "BATCH_FAILED",
            "completedAt": datetime.now(timezone.utc).isoformat(),
        })
        sys.exit(1)


if __name__ == "__main__":
    main()
    logger.info("Process exiting successfully")
    sys.exit(0)
