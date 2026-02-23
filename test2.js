const cdk = require("../../core/lib");
const constructs = require("constructs");
const cfn_parse = require("../../core/lib/helpers-internal");
const { ActionConnectorReference, AnalysisReference, CustomPermissionsReference, DashboardReference, DataSetReference, DataSourceReference, FolderReference, RefreshScheduleReference, TemplateReference, ThemeReference, TopicReference, VPCConnectionReference } = require("../../interfaces/generated/aws-quicksight-interfaces.generated");
const { aws_quicksight: quickSightRefs } = require("../../interfaces");
class CfnAnalysis extends cdk.CfnResource {
  static CFN_RESOURCE_TYPE_NAME = "AWS::QuickSight::Analysis";
  static _fromCloudFormation(scope, id, resourceAttributes, options) {
    return new CfnAnalysis(scope, id, cfn_parse.fromCloudFormation(CfnAnalysis, resourceAttributes, options));
  }
  static isCfnAnalysis(x) {
    return x instanceof CfnAnalysis;
  }
  static arnForAnalysis(resource) {
    return resource.attrArn;
  }
  analysisId;
  awsAccountId;
  definition;
  errors;
  folderArns;
  name;
  parameters;
  permissions;
  sheets;
  sourceEntity;
  status;
  tags;
  tagsRaw;
  themeArn;
  validationStrategy;
  constructor(scope, id, props) {
    super(scope, id, {
      type: CfnAnalysis.CFN_RESOURCE_TYPE_NAME,
      properties: props
    });
    this.analysisId = props.analysisId;
    this.awsAccountId = props.awsAccountId;
    this.definition = props.definition;
    this.errors = props.errors;
    this.folderArns = props.folderArns;
    this.name = props.name;
    this.parameters = props.parameters;
    this.permissions = props.permissions;
    this.sheets = props.sheets;
    this.sourceEntity = props.sourceEntity;
    this.status = props.status;
    this.tags = new cdk.TagManager(cdk.TagType.STANDARD, "AWS::QuickSight::Analysis", props.tags, { use                     : props.useAs, dependsOn                 : props.dependsOn, removalPolicy             : props.removalPolicy, version                   : props.version, creationStack             : this, encodeDefaultGroup        : true });
    this.tagsRaw = props.tags;
    this.themeArn = props.themeArn;
    this.validationStrategy = props.validationStrategy;
  }
  get analysisRef() {
    return new AnalysisReference(this.attrArn);
  }
  get attrArn() {
    return this.getAtt("Arn").toString();
  }
  get attrCreatedTime() {
    return this.getAtt("CreatedTime").toString();
  }
  get attrDataSetArns() {
    return this.getAtt("DataSetArns");
  }
  get attrErrors() {
    return this.getAtt("Errors");
  }
  get attrLastUpdatedTime() {
    return this.getAtt("LastUpdatedTime").toString();
  }
  get attrSheets() {
    return this.getAtt("Sheets");
  }
  get cfnProperties() {
    return {
      analysisId: this.analysisId,
      awsAccountId: this.awsAccountId,
      definition: this.definition,
      errors: this.errors,
      folderArns: this.folderArns,
      name: this.name,
      parameters: this.parameters,
      permissions: this.permissions,
      sheets: this.sheets,
      sourceEntity: this.sourceEntity,
      status: this.status,
      tags: this.tags.renderTags(),
      themeArn: this.themeArn,
      validationStrategy: this.validationStrategy
    };
  }
  inspect(inspector) {
    inspector.forProperties(this, this.cfnProperties);
  }
  renderProperties(props) {
    return cfn_parse.renderProperties(props);
  }
}
exports.CfnAnalysis = CfnAnalysis;
class CfnDashboard extends cdk.CfnResource {
  static CFN_RESOURCE_TYPE_NAME = "AWS::QuickSight::Dashboard";
  static _fromCloudFormation(scope, id, resourceAttributes, options) {
    return new CfnDashboard(scope, id, cfn_parse.fromCloudFormation(CfnDashboard, resourceAttributes, options));
  }
  static isCfnDashboard(x) {
    return x instanceof CfnDashboard;
  }
  static arnForDashboard(resource) {
    return resource.attrArn;
  }
  awsAccountId;
  dashboardId;
  dashboardPublishOptions;
  definition;
  folderArns;
  linkEntities;
  linkSharingConfiguration;
  name;
  parameters;
  permissions;
  sourceEntity;
  tags;
  tagsRaw;
  themeArn;
  validationStrategy;
  versionDescription;
  constructor(scope, id, props) {
    super(scope, id, {
      type: CfnDashboard.CFN_RESOURCE_TYPE_NAME,
      properties: props
    });
    this.awsAccountId = props.awsAccountId;
    this.dashboardId = props.dashboardId;
    this.dashboardPublishOptions = props.dashboardPublishOptions;
    this.definition = props.definition;
    this.folderArns = props.folderArns;
    this.linkEntities = props.linkEntities;
    this.linkSharingConfiguration = props.linkSharingConfiguration;
    this.name = props.name;
    this.parameters = props.parameters;
    this.permissions = props.permissions;
    this.sourceEntity = props.sourceEntity;
    this.tags = new cdk.TagManager(cdk.TagType.STANDARD, "AWS::QuickSight::Dashboard", props.tags, { use                     : props.useAs, dependsOn                 : props.dependsOn, removalPolicy             : props.removalPolicy, version                   : props.version, creationStack             : this, encodeDefaultGroup        : true });
    this.tagsRaw = props.tags;
    this.themeArn = props.themeArn;
    this.validationStrategy = props.validationStrategy;
    this.versionDescription = props.versionDescription;
  }
  get dashboardRef() {
    return new DashboardReference(this.attrArn);
  }
  get attrArn() {
    return this.getAtt("Arn").toString();
  }
  get attrCreatedTime() {
    return this.getAtt("CreatedTime").toString();
  }
  get attrLastPublishedTime() {
    return this.getAtt("LastPublishedTime").toString();
  }
  get attrLastUpdatedTime() {
    return this.getAtt("LastUpdatedTime").toString();
  }
  get attrVersion() {
    return this.getAtt("Version");
  }
  get attrVersionArn() {
    return this.getAtt("Version.Arn").toString();
  }
  get attrVersionCreatedTime() {
    return this.getAtt("Version.CreatedTime").toString();
  }
  get attrVersionDataSetArns() {
    return this.getAtt("Version.DataSetArns");
  }
  get attrVersionDescription() {
    return this.getAtt("Version.Description").toString();
  }
  get attrVersionErrors() {
    return this.getAtt("Version.Errors");
  }
  get attrVersionSheets() {
    return this.getAtt("Version.Sheets");
  }
  get attrVersionSourceEntityArn() {
    return this.getAtt("Version.SourceEntityArn").toString();
  }
  get attrVersionStatus() {
    return this.getAtt("Version.Status").toString();
  }
  get attrVersionThemeArn() {
    return this.getAtt("Version.ThemeArn").toString();
  }
  get attrVersionVersionNumber() {
    return this.getAtt("Version.VersionNumber");
  }
  get cfnProperties() {
    return {
      awsAccountId: this.awsAccountId,
      dashboardId: this.dashboardId,
      dashboardPublishOptions: this.dashboardPublishOptions,
      definition: this.definition,
      folderArns: this.folderArns,
      linkEntities: this.linkEntities,
      linkSharingConfiguration: this.linkSharingConfiguration,
      name: this.name,
      parameters: this.parameters,
      permissions: this.permissions,
      sourceEntity: this.sourceEntity,
      tags: this.tags.renderTags(),
      themeArn: this.themeArn,
      validationStrategy: this.validationStrategy,
      versionDescription: this.versionDescription
    };
  }
  inspect(inspector) {
    inspector.forProperties(this, this.cfnProperties);
  }
  renderProperties(props) {
    return cfn_parse.renderProperties(props);
  }
}
exports.CfnDashboard = CfnDashboard;
class CfnDataSet extends cdk.CfnResource {
  static CFN_RESOURCE_TYPE_NAME = "AWS::QuickSight::DataSet";
  static _fromCloudFormation(scope, id, resourceAttributes, options) {
    return new CfnDataSet(scope, id, cfn_parse.fromCloudFormation(CfnDataSet, resourceAttributes, options));
  }
  static isCfnDataSet(x) {
    return x instanceof CfnDataSet;
  }
  static arnForDataSet(resource) {
    return resource.attrArn;
  }
  awsAccountId;
  columnGroups;
  columnLevelPermissionRules;
  dataPrepConfiguration;
  dataSetId;
  datasetParameters;
  dataSetRefreshProperties;
  dataSetUsageConfiguration;
  fieldFolders;
  folderArns;
  importMode;
  ingestionWaitPolicy;
  logicalTableMap;
  name;
  performanceConfiguration;
  permissions;
  physicalTableMap;
  rowLevelPermissionDataSet;
  rowLevelPermissionTagConfiguration;
  semanticModelConfiguration;
  tags;
  tagsRaw;
  useAs;
  constructor(scope, id, props = {}) {
    super(scope, id, {
      type: CfnDataSet.CFN_RESOURCE_TYPE_NAME,
      properties: props
    });
    this.awsAccountId = props.awsAccountId;
    this.columnGroups = props.columnGroups;
    this.columnLevelPermissionRules = props.columnLevelPermissionRules;
    this.dataPrepConfiguration = props.dataPrepConfiguration;
    this.dataSetId = props.dataSetId;
    this.datasetParameters = props.datasetParameters;
    this.dataSetRefreshProperties = props.dataSetRefreshProperties;
    this.dataSetUsageConfiguration = props.dataSetUsageConfiguration;
    this.fieldFolders = props.fieldFolders;
    this.folderArns = props.folderArns;
    this.importMode = props.importMode;
    this.ingestionWaitPolicy = props.ingestionWaitPolicy;
    this.logicalTableMap = props.logicalTableMap;
    this.name = props.name;
    this.performanceConfiguration = props.performanceConfiguration;
    this.permissions = props.permissions;
    this.physicalTableMap = props.physicalTableMap;
    this.rowLevelPermissionDataSet = props.rowLevelPermissionDataSet;
    this.rowLevelPermissionTagConfiguration = props.rowLevelPermissionTagConfiguration;
    this.semanticModelConfiguration = props.semanticModelConfiguration;
    this.tags = new cdk.TagManager(cdk.TagType.STANDARD, "AWS::QuickSight::DataSet", props.tags, { use                     : props.useAs, dependsOn                 : props.dependsOn, removalPolicy             : props.removalPolicy, version                   : props.version, creationStack             : this, encodeDefaultGroup        : true });
    this.tagsRaw = props.tags;
    this.useAs = props.useAs;
  }
  get dataSetRef() {
    return new DataSetReference(this.attrArn);
  }
  get attrArn() {
    return this.getAtt("Arn").toString();
  }
  get attrConsumedSpiceCapacityInBytes() {
    return this.getAtt("ConsumedSpiceCapacityInBytes");
  }
  get attrCreatedTime() {
    return this.getAtt("CreatedTime").toString();
  }
  get attrLastUpdatedTime() {
    return this.getAtt("LastUpdatedTime").toString();
  }
  get attrOutputColumns() {
    return this.getAtt("OutputColumns");
  }
  get cfnProperties() {
    return {
      awsAccountId: this.awsAccountId,
      columnGroups: this.columnGroups,
      columnLevelPermissionRules: this.columnLevelPermissionRules,
      dataPrepConfiguration: this.dataPrepConfiguration,
      dataSetId: this.dataSetId,
      datasetParameters: this.datasetParameters,
      dataSetRefreshProperties: this.dataSetRefreshProperties,
      dataSetUsageConfiguration: this.dataSetUsageConfiguration,
      fieldFolders: this.fieldFolders,
      folderArns: this.folderArns,
      importMode: this.importMode,
      ingestionWaitPolicy: this.ingestionWaitPolicy,
      logicalTableMap: this.logicalTableMap,
      name: this.name,
      performanceConfiguration: this.performanceConfiguration,
      permissions: this.permissions,
      physicalTableMap: this.physicalTableMap,
      rowLevelPermissionDataSet: this.rowLevelPermissionDataSet,
      rowLevelPermissionTagConfiguration: this.rowLevelPermissionTagConfiguration,
      semanticModelConfiguration: this.semanticModelConfiguration,
      tags: this.tags.renderTags(),
      useAs: this.useAs
    };
  }
  inspect(inspector) {
    inspector.forProperties(this, this.cfnProperties);
  }
  renderProperties(props) {
    return cfn_parse.renderProperties(props);
  }
}
exports.CfnDataSet = CfnDataSet;
class CfnDataSource extends cdk.CfnResource {
  static CFN_RESOURCE_TYPE_NAME = "AWS::QuickSight::DataSource";
  static _fromCloudFormation(scope, id, resourceAttributes, options) {
    return new CfnDataSource(scope, id, cfn_parse.fromCloudFormation(CfnDataSource, resourceAttributes, options));
  }
  static isCfnDataSource(x) {
    return x instanceof CfnDataSource;
  }
  static arnForDataSource(resource) {
    return resource.attrArn;
  }
  alternateDataSourceParameters;
  awsAccountId;
  credentials;
  dataSourceId;
  dataSourceParameters;
  errorInfo;
  folderArns;
  name;
  permissions;
  sslProperties;
  tags;
  tagsRaw;
  type;
  vpcConnectionProperties;
  constructor(scope, id, props) {
    super(scope, id, {
      type: CfnDataSource.CFN_RESOURCE_TYPE_NAME,
      properties: props
    });
    this.alternateDataSourceParameters = props.alternateDataSourceParameters;
    this.awsAccountId = props.awsAccountId;
    this.credentials = props.credentials;
    this.dataSourceId = props.dataSourceId;
    this.dataSourceParameters = props.dataSourceParameters;
    this.errorInfo = props.errorInfo;
    this.folderArns = props.folderArns;
    this.name = props.name;
    this.permissions = props.permissions;
    this.sslProperties = props.sslProperties;
    this.tags = new cdk.TagManager(cdk.TagType.STANDARD, "AWS::QuickSight::DataSource", props.tags, { use                     : props.useAs, dependsOn                 : props.dependsOn, removalPolicy             : props.removalPolicy, version                   : props.version, creationStack             : this, encodeDefaultGroup        : true });
    this.tagsRaw = props.tags;
    this.type = props.type;
    this.vpcConnectionProperties = props.vpcConnectionProperties;
  }
  get dataSourceRef() {
    return new DataSourceReference(this.attrArn);
  }
  get attrArn() {
    return this.getAtt("Arn").toString();
  }
  get attrCreatedTime() {
    return this.getAtt("CreatedTime").toString();
  }
  get attrLastUpdatedTime() {
    return this.getAtt("LastUpdatedTime").toString();
  }
  get attrStatus() {
    return this.getAtt("Status").toString();
  }
  get cfnProperties() {
    return {
      alternateDataSourceParameters: this.alternateDataSourceParameters,
      awsAccountId: this.awsAccountId,
      credentials: this.credentials,
      dataSourceId: this.dataSourceId,
      dataSourceParameters: this.dataSourceParameters,
      errorInfo: this.errorInfo,
      folderArns: this.folderArns,
      name: this.name,
      permissions: this.permissions,
      sslProperties: this.sslProperties,
      tags: this.tags.renderTags(),
      type: this.type,
      vpcConnectionProperties: this.vpcConnectionProperties
    };
  }
  inspect(inspector) {
    inspector.forProperties(this, this.cfnProperties);
  }
  renderProperties(props) {
    return cfn_parse.renderProperties(props);
  }
}
exports.CfnDataSource = CfnDataSource;
class CfnRefreshSchedule extends cdk.CfnResource {
  static CFN_RESOURCE_TYPE_NAME = "AWS::QuickSight::RefreshSchedule";
  static _fromCloudFormation(scope, id, resourceAttributes, options) {
    return new CfnRefreshSchedule(scope, id, cfn_parse.fromCloudFormation(CfnRefreshSchedule, resourceAttributes, options));
  }
  static isCfnRefreshSchedule(x) {
    return x instanceof CfnRefreshSchedule;
  }
  static arnForRefreshSchedule(resource) {
    return resource.attrArn;
  }
  awsAccountId;
  dataSetId;
  schedule;
  constructor(scope, id, props = {}) {
    super(scope, id, {
      type: CfnRefreshSchedule.CFN_RESOURCE_TYPE_NAME,
      properties: props
    });
    this.awsAccountId = props.awsAccountId;
    this.dataSetId = props.dataSetId;
    this.schedule = props.schedule;
  }
  get refreshScheduleRef() {
    return new RefreshScheduleReference(this.attrArn);
  }
  get attrArn() {
    return this.getAtt("Arn").toString();
  }
  get cfnProperties() {
    return {
      awsAccountId: this.awsAccountId,
      dataSetId: this.dataSetId,
      schedule: this.schedule
    };
  }
  inspect(inspector) {
    inspector.forProperties(this, this.cfnProperties);
  }
  renderProperties(props) {
    return cfn_parse.renderProperties(props);
  }
}
exports.CfnRefreshSchedule = CfnRefreshSchedule;
class CfnTemplate extends cdk.CfnResource {
  static CFN_RESOURCE_TYPE_NAME = "AWS::QuickSight::Template";
  static _fromCloudFormation(scope, id, resourceAttributes, options) {
    return new CfnTemplate(scope, id, cfn_parse.fromCloudFormation(CfnTemplate, resourceAttributes, options));
  }
  static isCfnTemplate(x) {
    return x instanceof CfnTemplate;
  }
  static arnForTemplate(resource) {
    return resource.attrArn;
  }
  awsAccountId;
  definition;
  name;
  permissions;
  sourceEntity;
  tags;
  tagsRaw;
  templateId;
  validationStrategy;
  versionDescription;
  constructor(scope, id, props) {
    super(scope, id, {
      type: CfnTemplate.CFN_RESOURCE_TYPE_NAME,
      properties: props
    });
    this.awsAccountId = props.awsAccountId;
    this.definition = props.definition;
    this.name = props.name;
    this.permissions = props.permissions;
    this.sourceEntity = props.sourceEntity;
    this.tags = new cdk.TagManager(cdk.TagType.STANDARD, "AWS::QuickSight::Template", props.tags, { use                     : props.useAs, dependsOn                 : props.dependsOn, removalPolicy             : props.removalPolicy, version                   : props.version, creationStack             : this, encodeDefaultGroup        : true });
    this.tagsRaw = props.tags;
    this.templateId = props.templateId;
    this.validationStrategy = props.validationStrategy;
    this.versionDescription = props.versionDescription;
  }
  get templateRef() {
    return new TemplateReference(this.attrArn);
  }
  get attrArn() {
    return this.getAtt("Arn").toString();
  }
  get attrCreatedTime() {
    return this.getAtt("CreatedTime").toString();
  }
  get attrLastUpdatedTime() {
    return this.getAtt("LastUpdatedTime").toString();
  }
  get attrVersion() {
    return this.getAtt("Version");
  }
  get attrVersionCreatedTime() {
    return this.getAtt("Version.CreatedTime").toString();
  }
  get attrVersionDataSetConfigurations() {
    return this.getAtt("Version.DataSetConfigurations");
  }
  get attrVersionDescription() {
    return this.getAtt("Version.Description").toString();
  }
  get attrVersionErrors() {
    return this.getAtt("Version.Errors");
  }
  get attrVersionSheets() {
    return this.getAtt("Version.Sheets");
  }
  get attrVersionSourceEntityArn() {
    return this.getAtt("Version.SourceEntityArn").toString();
  }
  get attrVersionStatus() {
    return this.getAtt("Version.Status").toString();
  }
  get attrVersionThemeArn() {
    return this.getAtt("Version.ThemeArn").toString();
  }
  get attrVersionVersionNumber() {
    return this.getAtt("Version.VersionNumber");
  }
  get cfnProperties() {
    return {
      awsAccountId: this.awsAccountId,
      definition: this.definition,
      name: this.name,
      permissions: this.permissions,
      sourceEntity: this.sourceEntity,
      tags: this.tags.renderTags(),
      templateId: this.templateId,
      validationStrategy: this.validationStrategy,
      versionDescription: this.versionDescription
    };
  }
  inspect(inspector) {
    inspector.forProperties(this, this.cfnProperties);
  }
  renderProperties(props) {
    return cfn_parse.renderProperties(props);
  }
}
exports.CfnTemplate = CfnTemplate;
class CfnTheme extends cdk.CfnResource {
  static CFN_RESOURCE_TYPE_NAME = "AWS::QuickSight::Theme";
  static _fromCloudFormation(scope, id, resourceAttributes, options) {
    return new CfnTheme(scope, id, cfn_parse.fromCloudFormation(CfnTheme, resourceAttributes, options));
  }
  static isCfnTheme(x) {
    return x instanceof CfnTheme;
  }
  static arnForTheme(resource) {
    return resource.attrArn;
  }
  awsAccountId;
  baseThemeId;
  configuration;
  name;
  permissions;
  tags;
  tagsRaw;
  themeId;
  versionDescription;
  constructor(scope, id, props) {
    super(scope, id, {
      type: CfnTheme.CFN_RESOURCE_TYPE_NAME,
      properties: props
    });
    this.awsAccountId = props.awsAccountId;
    this.baseThemeId = props.baseThemeId;
    this.configuration = props.configuration;
    this.name = props.name;
    this.permissions = props.permissions;
    this.tags = new cdk.TagManager(cdk.TagType.STANDARD, "AWS::QuickSight::Theme", props.tags, { use                     : props.useAs, dependsOn                 : props.dependsOn, removalPolicy             : props.removalPolicy, version                   : props.version, creationStack             : this, encodeDefaultGroup        : true });
    this.tagsRaw = props.tags;
    this.themeId = props.themeId;
    this.versionDescription = props.versionDescription;
  }
  get themeRef() {
    return new ThemeReference(this.attrArn);
  }
  get attrArn() {
    return this.getAtt("Arn").toString();
  }
  get attrCreatedTime() {
    return this.getAtt("CreatedTime").toString();
  }
  get attrLastUpdatedTime() {
    return this.getAtt("LastUpdatedTime").toString();
  }
  get attrType() {
    return this.getAtt("Type").toString();
  }
  get attrVersion() {
    return this.getAtt("Version");
  }
  get attrVersionArn() {
    return this.getAtt("Version.Arn").toString();
  }
  get attrVersionBaseThemeId() {
    return this.getAtt("Version.BaseThemeId").toString();
  }
  get attrVersionConfiguration() {
    return this.getAtt("Version.Configuration");
  }
  get attrVersionConfigurationDataColorPalette() {
    return this.getAtt("Version.Configuration.DataColorPalette");
  }
  get attrVersionConfigurationSheet() {
    return this.getAtt("Version.Configuration.Sheet");
  }
  get attrVersionConfigurationTypography() {
    return this.getAtt("Version.Configuration.Typography");
  }
  get attrVersionConfigurationUiColorPalette() {
    return this.getAtt("Version.Configuration.UIColorPalette");
  }
  get attrVersionCreatedTime() {
    return this.getAtt("Version.CreatedTime").toString();
  }
  get attrVersionDescription() {
    return this.getAtt("Version.Description").toString();
  }
  get attrVersionErrors() {
    return this.getAtt("Version.Errors");
  }
  get attrVersionStatus() {
    return this.getAtt("Version.Status").toString();
  }
  get attrVersionVersionNumber() {
    return this.getAtt("Version.VersionNumber");
  }
  get cfnProperties() {
    return {
      awsAccountId: this.awsAccountId,
      baseThemeId: this.baseThemeId,
      configuration: this.configuration,
      name: this.name,
      permissions: this.permissions,
      tags: this.tags.renderTags(),
      themeId: this.themeId,
      versionDescription: this.versionDescription
    };
  }
  inspect(inspector) {
    inspector.forProperties(this, this.cfnProperties);
  }
  renderProperties(props) {
    return cfn_parse.renderProperties(props);
  }
}
exports.CfnTheme = CfnTheme;
class CfnTopic extends cdk.CfnResource {
  static CFN_RESOURCE_TYPE_NAME = "AWS::QuickSight::Topic";
  static _fromCloudFormation(scope, id, resourceAttributes, options) {
    return new CfnTopic(scope, id, cfn_parse.fromCloudFormation(CfnTopic, resourceAttributes, options));
  }
  static isCfnTopic(x) {
    return x instanceof CfnTopic;
  }
  static arnForTopic(resource) {
    return resource.attrArn;
  }
  awsAccountId;
  cdkTagManager;
  configOptions;
  customInstructions;
  dataSets;
  description;
  folderArns;
  name;
  tags;
  topicId;
  userExperienceVersion;
  constructor(scope, id, props = {}) {
    super(scope, id, {
      type: CfnTopic.CFN_RESOURCE_TYPE_NAME,
      properties: props
    });
    this.awsAccountId = props.awsAccountId;
    this.cdkTagManager = new cdk.TagManager(cdk.TagType.KEY_VALUE, "AWS::QuickSight::Topic", props.tags, { use                     : props.useAs, dependsOn                 : props.dependsOn, removalPolicy             : props.removalPolicy, version                   : props.version, creationStack             : this, encodeDefaultGroup        : true });
    this.configOptions = props.configOptions;
    this.customInstructions = props.customInstructions;
    this.dataSets = props.dataSets;
    this.description = props.description;
    this.folderArns = props.folderArns;
    this.name = props.name;
    this.tags = props.tags;
    this.topicId = props.topicId;
    this.userExperienceVersion = props.userExperienceVersion;
  }
  get topicRef() {
    return new TopicReference(this.attrArn);
  }
  get attrArn() {
    return this.getAtt("Arn").toString();
  }
  get cfnProperties() {
    return {
      awsAccountId: this.awsAccountId,
      configOptions: this.configOptions,
      customInstructions: this.customInstructions,
      dataSets: this.dataSets,
      description: this.description,
      folderArns: this.folderArns,
      name: this.name,
      tags: this.cdkTagManager.renderTags(),
      topicId: this.topicId,
      userExperienceVersion: this.userExperienceVersion
    };
  }
  inspect(inspector) {
    inspector.forProperties(this, this.cfnProperties);
  }
  renderProperties(props) {
    return cfn_parse.renderProperties(props);
  }
}
exports.CfnTopic = CfnTopic;
class CfnVPCConnection extends cdk.CfnResource {
  static CFN_RESOURCE_TYPE_NAME = "AWS::QuickSight::VPCConnection";
  static _fromCloudFormation(scope, id, resourceAttributes, options) {
    return new CfnVPCConnection(scope, id, cfn_parse.fromCloudFormation(CfnVPCConnection, resourceAttributes, options));
  }
  static isCfnVPCConnection(x) {
    return x instanceof CfnVPCConnection;
  }
  static arnForVPCConnection(resource) {
    return resource.attrArn;
  }
  availabilityStatus;
  awsAccountId;
  dnsResolvers;
  name;
  roleArn;
  securityGroupIds;
  subnetIds;
  tags;
  tagsRaw;
  vpcConnectionId;
  constructor(scope, id, props = {}) {
    super(scope, id, {
      type: CfnVPCConnection.CFN_RESOURCE_TYPE_NAME,
      properties: props
    });
    this.availabilityStatus = props.availabilityStatus;
    this.awsAccountId = props.awsAccountId;
    this.dnsResolvers = props.dnsResolvers;
    this.name = props.name;
    this.roleArn = props.roleArn;
    this.securityGroupIds = props.securityGroupIds;
    this.subnetIds = props.subnetIds;
    this.tags = new cdk.TagManager(cdk.TagType.STANDARD, "AWS::QuickSight::VPCConnection", props.tags, { use                     : props.useAs, dependsOn                 : props.dependsOn, removalPolicy             : props.removalPolicy, version                   : props.version, creationStack             : this, encodeDefaultGroup        : true });
    this.tagsRaw = props.tags;
    this.vpcConnectionId = props.vpcConnectionId;
  }
  get vpcConnectionRef() {
    return new VPCConnectionReference(this.attrArn);
  }
  get attrArn() {
    return this.getAtt("Arn").toString();
  }
  get attrCreatedTime() {
    return this.getAtt("CreatedTime").toString();
  }
  get attrLastUpdatedTime() {
    return this.getAtt("LastUpdatedTime").toString();
  }
  get attrNetworkInterfaces() {
    return this.getAtt("NetworkInterfaces");
  }
  get attrStatus() {
    return this.getAtt("Status").toString();
  }
  get attrVpcId() {
    return this.getAtt("VPCId").toString();
  }
  get cfnProperties() {
    return {
      availabilityStatus: this.availabilityStatus,
      awsAccountId: this.awsAccountId,
      dnsResolvers: this.dnsResolvers,
      name: this.name,
      roleArn: this.roleArn,
      securityGroupIds: this.securityGroupIds,
      subnetIds: this.subnetIds,
      tags: this.tags.renderTags(),
      vpcConnectionId: this.vpcConnectionId
    };
  }
  inspect(inspector) {
    inspector.forProperties(this, this.cfnProperties);
  }
  renderProperties(props) {
    return cfn_parse.renderProperties(props);
  }
}
exports.CfnVPCConnection = CfnVPCConnection;
class CfnActionConnector extends cdk.CfnResource {
  static CFN_RESOURCE_TYPE_NAME = "AWS::QuickSight::ActionConnector";
  static _fromCloudFormation(scope, id, resourceAttributes, options) {
    return new CfnActionConnector(scope, id, cfn_parse.fromCloudFormation(CfnActionConnector, resourceAttributes, options));
  }
  static isCfnActionConnector(x) {
    return x instanceof CfnActionConnector;
  }
  static arnForActionConnector(resource) {
    return resource.attrArn;
  }
  actionConnectorId;
  authenticationConfig;
  awsAccountId;
  cdkTagManager;
  description;
  name;
  permissions;
  tags;
  type;
  vpcConnectionArn;
  constructor(scope, id, props) {
    super(scope, id, {
      type: CfnActionConnector.CFN_RESOURCE_TYPE_NAME,
      properties: props
    });
    this.actionConnectorId = props.actionConnectorId;
    this.authenticationConfig = props.authenticationConfig;
    this.awsAccountId = props.awsAccountId;
    this.cdkTagManager = new cdk.TagManager(cdk.TagType.KEY_VALUE, "AWS::QuickSight::ActionConnector", props.tags, { use                     : props.useAs, dependsOn                 : props.dependsOn, removalPolicy             : props.removalPolicy, version                   : props.version, creationStack             : this, encodeDefaultGroup        : true });
    this.description = props.description;
    this.name = props.name;
    this.permissions = props.permissions;
    this.tags = props.tags;
    this.type = props.type;
    this.vpcConnectionArn = props.vpcConnectionArn;
  }
  get actionConnectorRef() {
    return new ActionConnectorReference(this.attrArn);
  }
  get attrArn() {
    return this.getAtt("Arn").toString();
  }
  get attrCreatedTime() {
    return this.getAtt("CreatedTime").toString();
  }
  get attrEnabledActions() {
    return this.getAtt("EnabledActions");
  }
  get attrLastUpdatedTime() {
    return this.getAtt("LastUpdatedTime").toString();
  }
  get attrStatus() {
    return this.getAtt("Status").toString();
  }
  get cfnProperties() {
    return {
      actionConnectorId: this.actionConnectorId,
      authenticationConfig: this.authenticationConfig,
      awsAccountId: this.awsAccountId,
      description: this.description,
      name: this.name,
      permissions: this.permissions,
      tags: this.cdkTagManager.renderTags(),
      type: this.type,
      vpcConnectionArn: this.vpcConnectionArn
    };
  }
  inspect(inspector) {
    inspector.forProperties(this, this.cfnProperties);
  }
  renderProperties(props) {
    return cfn_parse.renderProperties(props);
  }
}
exports.CfnActionConnector = CfnActionConnector;
class CfnCustomPermissions extends cdk.CfnResource {
  static CFN_RESOURCE_TYPE_NAME = "AWS::QuickSight::CustomPermissions";
  static _fromCloudFormation(scope, id, resourceAttributes, options) {
    return new CfnCustomPermissions(scope, id, cfn_parse.fromCloudFormation(CfnCustomPermissions, resourceAttributes, options));
  }
  static isCfnCustomPermissions(x) {
    return x instanceof CfnCustomPermissions;
  }
  static arnForCustomPermissions(resource) {
    return resource.attrArn;
  }
  awsAccountId;
  capabilities;
  cdkTagManager;
  customPermissionsName;
  tags;
  constructor(scope, id, props) {
    super(scope, id, {
      type: CfnCustomPermissions.CFN_RESOURCE_TYPE_NAME,
      properties: props
    });
    this.awsAccountId = props.awsAccountId;
    this.capabilities = props.capabilities;
    this.cdkTagManager = new cdk.TagManager(cdk.TagType.KEY_VALUE, "AWS::QuickSight::CustomPermissions", props.tags, { use                     : props.useAs, dependsOn                 : props.dependsOn, removalPolicy             : props.removalPolicy, version                   : props.version, creationStack             : this, encodeDefaultGroup        : true });
    this.customPermissionsName = props.customPermissionsName;
    this.tags = props.tags;
  }
  get customPermissionsRef() {
    return new CustomPermissionsReference(this.attrArn);
  }
  get attrArn() {
    return this.getAtt("Arn").toString();
  }
  get cfnProperties() {
    return {
      awsAccountId: this.awsAccountId,
      capabilities: this.capabilities,
      customPermissionsName: this.customPermissionsName,
      tags: this.cdkTagManager.renderTags()
    };
  }
  inspect(inspector) {
    inspector.forProperties(this, this.cfnProperties);
  }
  renderProperties(props) {
    return cfn_parse.renderProperties(props);
  }
}
exports.CfnCustomPermissions = CfnCustomPermissions;
class CfnFolder extends cdk.CfnResource {
  static CFN_RESOURCE_TYPE_NAME = "AWS::QuickSight::Folder";
  static _fromCloudFormation(scope, id, resourceAttributes, options) {
    return new CfnFolder(scope, id, cfn_parse.fromCloudFormation(CfnFolder, resourceAttributes, options));
  }
  static isCfnFolder(x) {
    return x instanceof CfnFolder;
  }
  static arnForFolder(resource) {
    return resource.attrArn;
  }
  awsAccountId;
  cdkTagManager;
  folderId;
  folderType;
  name;
  parentFolderArn;
  permissions;
  sharingModel;
  tags;
  constructor(scope, id, props = {}) {
    super(scope, id, {
      type: CfnFolder.CFN_RESOURCE_TYPE_NAME,
      properties: props
    });
    this.awsAccountId = props.awsAccountId;
    this.cdkTagManager = new cdk.TagManager(cdk.TagType.KEY_VALUE, "AWS::QuickSight::Folder", props.tags, { use                     : props.useAs, dependsOn                 : props.dependsOn, removalPolicy             : props.removalPolicy, version                   : props.version, creationStack             : this, encodeDefaultGroup        : true });
    this.folderId = props.folderId;
    this.folderType = props.folderType;
    this.name = props.name;
    this.parentFolderArn = props.parentFolderArn;
    this.permissions = props.permissions;
    this.sharingModel = props.sharingModel;
    this.tags = props.tags;
  }
  get folderRef() {
    return new FolderReference(this.attrArn);
  }
  get attrArn() {
    return this.getAtt("Arn").toString();
  }
  get attrCreatedTime() {
    return this.getAtt("CreatedTime").toString();
  }
  get attrLastUpdatedTime() {
    return this.getAtt("LastUpdatedTime").toString();
  }
  get cfnProperties() {
    return {
      awsAccountId: this.awsAccountId,
      folderId: this.folderId,
      folderType: this.folderType,
      name: this.name,
      parentFolderArn: this.parentFolderArn,
      permissions: this.permissions,
      sharingModel: this.sharingModel,
      tags: this.cdkTagManager.renderTags()
    };
  }
  inspect(inspector) {
    inspector.forProperties(this, this.cfnProperties);
  }
  renderProperties(props) {
    return cfn_parse.renderProperties(props);
  }
}
exports.CfnFolder = CfnFolder;
