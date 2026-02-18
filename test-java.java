// File: TranslationHarness.java
// Build (with Jackson on classpath):
//   javac -cp jackson-core-2.17.0.jar:jackson-databind-2.17.0.jar:jackson-annotations-2.17.0.jar TranslationHarness.java
// Run:
//   java -cp .:jackson-core-2.17.0.jar:jackson-databind-2.17.0.jar:jackson-annotations-2.17.0.jar TranslationHarness --port=8080 --workers=8
//
// Endpoints:
//   POST /hash   { "text": "...", "salt": "...", "repeat": 1000 }
//   POST /fetch  { "url": "...", "timeoutMs": 1500, "retries": 2 }
//
// CLI modes:
//   --server (default)  start HTTP server
//   --client            run a small client that hits the server concurrently
//   --selftest          deterministic quick checks (useful for translation parity)

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sun.net.httpserver.Headers;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;

import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.security.MessageDigest;
import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.regex.Pattern;

public class TranslationHarness {

    // -------------------- Config / CLI --------------------
    static class Config {
        int port = 8080;
        int workers = 8;
        String mode = "server"; // server | client | selftest
        String logFile = "translation_harness.log";
    }

    static Config parseArgs(String[] args) {
        Config c = new Config();
        for (String a : args) {
            if (a.equals("--client")) c.mode = "client";
            else if (a.equals("--server")) c.mode = "server";
            else if (a.equals("--selftest")) c.mode = "selftest";
            else if (a.startsWith("--port=")) c.port = Integer.parseInt(a.substring("--port=".length()));
            else if (a.startsWith("--workers=")) c.workers = Integer.parseInt(a.substring("--workers=".length()));
            else if (a.startsWith("--log=")) c.logFile = a.substring("--log=".length());
        }
        return c;
    }

    // -------------------- JSON helpers --------------------
    static final ObjectMapper MAPPER = new ObjectMapper()
            .setSerializationInclusion(JsonInclude.Include.NON_NULL);

    static <T> T readJson(InputStream in, Class<T> clazz) throws IOException {
        return MAPPER.readValue(in, clazz);
    }

    static byte[] writeJsonBytes(Object obj) throws JsonProcessingException {
        return MAPPER.writeValueAsBytes(obj);
    }

    // -------------------- Models --------------------
    static class HashRequest {
        public String text;
        public String salt;
        public Integer repeat; // nullable -> default
    }

    static class HashResponse {
        public String algorithm;
        public String hexDigest;
        public int repeat;
        public long elapsedMs;
    }

    static class FetchRequest {
        public String url;
        public Integer timeoutMs; // default 1500
        public Integer retries;   // default 1
    }

    static class FetchResponse {
        public String url;
        public int status;
        public String bodySnippet;
        public long elapsedMs;
        public int attempts;
        public String error; // present on failure
    }

    static class ErrorResponse {
        public String error;
        public String details;
    }

    // -------------------- Logging (file I/O + sync) --------------------
    static class Logger {
        private final Path path;
        private final Object lock = new Object();

        Logger(String file) {
            this.path = Paths.get(file);
        }

        void log(String line) {
            String msg = Instant.now() + " " + line + System.lineSeparator();
            synchronized (lock) {
                try {
                    Files.write(path, msg.getBytes(StandardCharsets.UTF_8),
                            StandardOpenOption.CREATE, StandardOpenOption.APPEND);
                } catch (IOException e) {
                    // As a harness, swallow file log failure but print to stderr.
                    System.err.println("LOG FAIL: " + e.getMessage());
                }
            }
        }
    }

    // -------------------- Utilities --------------------
    static final Pattern WHITESPACE = Pattern.compile("\\s+");

    static String normalize(String s) {
        if (s == null) return "";
        return WHITESPACE.matcher(s.trim()).replaceAll(" ");
    }

    static String sha256Hex(String input) throws Exception {
        MessageDigest md = MessageDigest.getInstance("SHA-256");
        byte[] digest = md.digest(input.getBytes(StandardCharsets.UTF_8));
        StringBuilder sb = new StringBuilder(digest.length * 2);
        for (byte b : digest) sb.append(String.format("%02x", b));
        return sb.toString();
    }

    static void writeResponse(HttpExchange ex, int status, Object body) throws IOException {
        byte[] bytes = writeJsonBytes(body);
        Headers h = ex.getResponseHeaders();
        h.set("Content-Type", "application/json; charset=utf-8");
        h.set("Cache-Control", "no-store");
        ex.sendResponseHeaders(status, bytes.length);
        try (OutputStream os = ex.getResponseBody()) {
            os.write(bytes);
        }
    }

    static void writeError(HttpExchange ex, int status, String error, String details) throws IOException {
        ErrorResponse er = new ErrorResponse();
        er.error = error;
        er.details = details;
        writeResponse(ex, status, er);
    }

    // -------------------- HTTP client with retries + timeout --------------------
    static FetchResponse fetchWithRetries(FetchRequest req) {
        FetchResponse out = new FetchResponse();
        out.url = req.url;

        int timeoutMs = (req.timeoutMs == null) ? 1500 : req.timeoutMs;
        int retries = (req.retries == null) ? 1 : req.retries;
        int attempts = 0;

        Instant start = Instant.now();
        while (attempts < Math.max(1, retries + 1)) {
            attempts++;
            try {
                URL u = new URL(req.url);
                HttpURLConnection conn = (HttpURLConnection) u.openConnection();
                conn.setRequestMethod("GET");
                conn.setConnectTimeout(timeoutMs);
                conn.setReadTimeout(timeoutMs);
                conn.setInstanceFollowRedirects(true);

                int status = conn.getResponseCode();
                InputStream is = (status >= 200 && status < 400) ? conn.getInputStream() : conn.getErrorStream();
                String body = readAll(is, 32_768);

                out.status = status;
                out.bodySnippet = body.length() > 200 ? body.substring(0, 200) : body;
                out.elapsedMs = Duration.between(start, Instant.now()).toMillis();
                out.attempts = attempts;
                return out;

            } catch (Exception e) {
                out.error = e.getClass().getSimpleName() + ": " + e.getMessage();
                // retry unless last attempt
            }
        }
        out.elapsedMs = Duration.between(start, Instant.now()).toMillis();
        out.attempts = attempts;
        return out;
    }

    static String readAll(InputStream in, int maxBytes) throws IOException {
        if (in == null) return "";
        ByteArrayOutputStream bos = new ByteArrayOutputStream();
        byte[] buf = new byte[4096];
        int total = 0;
        int r;
        while ((r = in.read(buf)) != -1) {
            int take = Math.min(r, maxBytes - total);
            if (take <= 0) break;
            bos.write(buf, 0, take);
            total += take;
        }
        return bos.toString(StandardCharsets.UTF_8);
    }

    // -------------------- Server --------------------
    static void startServer(Config cfg) throws Exception {
        Logger logger = new Logger(cfg.logFile);
        ExecutorService pool = Executors.newFixedThreadPool(cfg.workers);
        HttpServer server = HttpServer.create(new InetSocketAddress(cfg.port), 0);

        server.createContext("/hash", ex -> {
            Instant start = Instant.now();
            if (!"POST".equalsIgnoreCase(ex.getRequestMethod())) {
                writeError(ex, 405, "method_not_allowed", "Use POST");
                return;
            }
            try (InputStream in = ex.getRequestBody()) {
                HashRequest req = readJson(in, HashRequest.class);
                String text = normalize(req.text);
                String salt = normalize(req.salt);
                int repeat = (req.repeat == null) ? 1000 : req.repeat;

                String payload = text + "|" + salt;
                // CPU-ish loop to test performance + determinism
                String hex = payload;
                for (int i = 0; i < repeat; i++) {
                    hex = sha256Hex(hex);
                }

                HashResponse resp = new HashResponse();
                resp.algorithm = "SHA-256";
                resp.hexDigest = hex;
                resp.repeat = repeat;
                resp.elapsedMs = Duration.between(start, Instant.now()).toMillis();

                logger.log("HASH ok repeat=" + repeat + " ms=" + resp.elapsedMs);
                writeResponse(ex, 200, resp);

            } catch (Exception e) {
                logger.log("HASH err=" + e.getMessage());
                writeError(ex, 400, "bad_request", e.toString());
            }
        });

        server.createContext("/fetch", ex -> {
            Instant start = Instant.now();
            if (!"POST".equalsIgnoreCase(ex.getRequestMethod())) {
                writeError(ex, 405, "method_not_allowed", "Use POST");
                return;
            }
            try (InputStream in = ex.getRequestBody()) {
                FetchRequest req = readJson(in, FetchRequest.class);
                if (req.url == null || req.url.isEmpty()) {
                    writeError(ex, 400, "bad_request", "url is required");
                    return;
                }

                FetchResponse resp = fetchWithRetries(req);
                resp.elapsedMs = Duration.between(start, Instant.now()).toMillis();

                int status = (resp.error == null) ? 200 : 502;
                logger.log("FETCH status=" + status + " attempts=" + resp.attempts + " ms=" + resp.elapsedMs);
                writeResponse(ex, status, resp);

            } catch (Exception e) {
                logger.log("FETCH err=" + e.getMessage());
                writeError(ex, 400, "bad_request", e.toString());
            }
        });

        // Graceful shutdown hook (tests cancellation/cleanup translation)
        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            logger.log("SHUTDOWN start");
            server.stop(0);
            pool.shutdown();
            try {
                if (!pool.awaitTermination(3, TimeUnit.SECONDS)) pool.shutdownNow();
            } catch (InterruptedException ignored) {
                pool.shutdownNow();
            }
            logger.log("SHUTDOWN done");
        }));

        server.setExecutor(pool);
        server.start();
        System.out.println("Server started on http://localhost:" + cfg.port);
        System.out.println("POST /hash and POST /fetch");
    }

    // -------------------- Client mode (concurrency test) --------------------
    static void runClient(Config cfg) throws Exception {
        int n = Math.max(4, cfg.workers);
        ExecutorService exec = Executors.newFixedThreadPool(n);
        AtomicInteger ok = new AtomicInteger();
        AtomicInteger fail = new AtomicInteger();

        String base = "http://localhost:" + cfg.port;

        List<Callable<Void>> tasks = new ArrayList<>();
        for (int i = 0; i < 20; i++) {
            final int idx = i;
            tasks.add(() -> {
                try {
                    HashRequest hr = new HashRequest();
                    hr.text = "hello " + idx;
                    hr.salt = "world";
                    hr.repeat = 500 + (idx % 3) * 250;

                    byte[] body = writeJsonBytes(hr);
                    HttpURLConnection conn = (HttpURLConnection) new URL(base + "/hash").openConnection();
                    conn.setRequestMethod("POST");
                    conn.setDoOutput(true);
                    conn.setConnectTimeout(1500);
                    conn.setReadTimeout(1500);
                    conn.setRequestProperty("Content-Type", "application/json");

                    try (OutputStream os = conn.getOutputStream()) {
                        os.write(body);
                    }

                    int status = conn.getResponseCode();
                    if (status == 200) ok.incrementAndGet();
                    else fail.incrementAndGet();

                } catch (Exception e) {
                    fail.incrementAndGet();
                }
                return null;
            });
        }

        Instant start = Instant.now();
        exec.invokeAll(tasks);
        exec.shutdown();
        exec.awaitTermination(3, TimeUnit.SECONDS);
        long ms = Duration.between(start, Instant.now()).toMillis();

        System.out.println("Client done. ok=" + ok.get() + " fail=" + fail.get() + " elapsedMs=" + ms);
    }

    // -------------------- Selftest (determinism / parity) --------------------
    static void runSelfTest() throws Exception {
        // Deterministic checks help validate translation behavior.
        String n1 = normalize("  a \n b\tc   ");
        if (!n1.equals("a b c")) throw new AssertionError("normalize failed: " + n1);

        String d = sha256Hex("abc");
        if (!d.equals("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"))
            throw new AssertionError("sha256 mismatch: " + d);

        FetchRequest fr = new FetchRequest();
        fr.url = "https://example.com";
        fr.timeoutMs = 1500;
        fr.retries = 0;
        FetchResponse resp = fetchWithRetries(fr);
        // Don’t assert status since network might vary; just assert it set attempts and elapsed.
        if (resp.attempts < 1) throw new AssertionError("fetch attempts not set");
        if (resp.elapsedMs < 0) throw new AssertionError("elapsed invalid");

        System.out.println("Selftest OK");
    }

    // -------------------- Main --------------------
    public static void main(String[] args) throws Exception {
        Config cfg = parseArgs(args);
        switch (cfg.mode) {
            case "client" -> runClient(cfg);
            case "selftest" -> runSelfTest();
            default -> startServer(cfg);
        }
    }
}
