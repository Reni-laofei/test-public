from __future__ import annotations
from typing import Any

from ..core import lib as cdk
import constructs
from ..core.lib import helpers_internal as cfn_parse
from ..interfaces.generated.aws_quicksight_interfaces_generated import (
    ActionConnectorReference, AnalysisReference, CustomPermissionsReference, DashboardReference,
    DataSetReference, DataSourceReference, FolderReference, IActionConnectorRef, IAnalysisRef,
    ICustomPermissionsRef, IDashboardRef, IDataSetRef, IDataSourceRef, IFolderRef,
    IRefreshScheduleRef, ITemplateRef, IThemeRef, ITopicRef, IVPCConnectionRef,
    RefreshScheduleReference, TemplateReference, ThemeReference, TopicReference, VPCConnectionReference
)
from ..interfaces import aws_quicksight as quick_sight_refs


class CfnAnalysis(cdk.CfnResource, cdk.IInspectable, IAnalysisRef, cdk.ITaggable):
    """
    Creates an analysis in Amazon QuickSight.

    :cloudformationResource AWS::QuickSight::Analysis
    :stability external
    :see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-quicksight-analysis.html
    """

    CFN_RESOURCE_TYPE_NAME: str = "AWS::QuickSight::Analysis"
    """
    The CloudFormation resource type name for this resource class.
    """

    @classmethod
    def _from_cloud_formation(
        cls,
        scope: constructs.Construct,
        id: str,
        resource_attributes: Any,
        options: cfn_parse.FromCloudFormationOptions
    ) -> "CfnAnalysis":
        """
        Build a CfnAnalysis from CloudFormation properties

        A factory method that creates a new instance of this class from an object
        containing the CloudFormation properties of this resource.
        Used in the @aws-cdk/cloudformation-include module.

        :internal:
        """
        # The body is omitted as the original TypeScript method was only a declaration.
        # This typically means the actual implementation would be provided elsewhere
        # or this is a type definition. For conversion, we provide the signature
        # but cannot provide a functional body from the provided snippet.
        # In a real CDK project, this method would likely construct and return
        # an instance of CfnAnalysis based on the resource_attributes.
        raise NotImplementedError("Method declaration only; implementation truncated in original source.")

    # ... truncated (58100 lines omitted for E2E test) ...
