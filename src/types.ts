export type CloudProvider = 'azure' | 'aws' | 'gcp' | 'self-hosted';

export type IaCLanguage = 
  | 'terraform' 
  | 'opentofu' 
  | 'cloudformation' 
  | 'cdk' 
  | 'google-infra-manager' 
  | 'bicep' 
  | 'arm' 
  | 'pulumi' 
  | 'ansible';

export type DeploymentStatus = 'idle' | 'generating' | 'validating' | 'deploying' | 'success' | 'failed';

// Governance & Compliance Types
export type ComplianceFramework = 'CIS' | 'SOC2' | 'NIST' | 'HIPAA' | 'PCI-DSS' | 'ISO27001';

export interface ComplianceCheck {
  id: string;
  framework: ComplianceFramework;
  rule: string;
  category: 'Access Control' | 'Data Protection & Encryption' | 'Network Security' | 'Auditing & Logging' | 'Resilience & Governance';
  description: string;
  status: 'passed' | 'warning' | 'failed';
  remediation?: string;
  resourceTarget?: string;
}

export interface GovernanceReport {
  score: number; // 0 - 100
  status: 'compliant' | 'warning' | 'non-compliant';
  frameworks: ComplianceFramework[];
  checks: ComplianceCheck[];
  summary: string;
  tagsApplied: { [key: string]: string };
  encryptionVerified: boolean;
  networkIsolated: boolean;
  leastPrivilegeVerified: boolean;
  auditLoggingEnabled: boolean;
  scannedAt: number;
}

// Drift Detection Types
export type DriftSeverity = 'critical' | 'high' | 'medium' | 'low';
export type DriftStatus = 'in-sync' | 'drifted' | 'scanning' | 'unknown';

export interface DriftedProperty {
  property: string;
  expectedValue: string;
  actualValue: string;
  severity: DriftSeverity;
  description: string;
  remediationAction: string;
}

export interface DriftResource {
  id: string;
  resourceName: string;
  resourceType: string;
  cloud: CloudProvider;
  status: 'drifted' | 'in-sync';
  severity: DriftSeverity;
  driftedProperties: DriftedProperty[];
  remediationIaC: string;
  lastChecked: number;
  location?: string;
}

export interface DriftScanResult {
  id: string;
  deploymentId: string;
  timestamp: number;
  totalResources: number;
  driftedCount: number;
  inSyncCount: number;
  healthScore: number; // 0 - 100
  status: DriftStatus;
  resources: DriftResource[];
  summary: string;
}

// Self-Hosted VM Types
export interface SelfHostedVM {
  id: string;
  name: string;
  host: string;
  port: number;
  username: string;
  os: string;
  arch: string;
  status: 'online' | 'offline' | 'provisioning' | 'drifted';
  cpuCores: number;
  ramGb: number;
  diskGb: number;
  ipAddress: string;
  installedPackages: string[];
  lastPing: number;
  tags: { [key: string]: string };
  complianceScore: number;
  activeWorkloads: string[];
}

// RBAC & SSO Types
export type UserRole = 
  | 'Organization Owner'
  | 'Security Administrator'
  | 'Cloud Administrator'
  | 'Cloud Architect'
  | 'DevOps Engineer'
  | 'Auditor';

export interface RolePermission {
  role: UserRole;
  description: string;
  permissions: string[];
}

export interface OrgMember {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  department?: string;
  lastLogin?: number;
  ssoEnforced: boolean;
  addedAt: number;
}

export interface SSOConfig {
  enabled: boolean;
  provider: 'okta' | 'entra-id' | 'google-workspace' | 'ping' | 'generic-saml';
  issuerUrl: string;
  entityId: string;
  acsUrl: string;
  clientId: string;
  clientSecret?: string;
  certificateThumbprint?: string;
  enforceDomain: string;
  defaultRole: UserRole;
  lastVerified?: number;
}

// Ansible Types
export interface AnsiblePlaybookRun {
  id: string;
  name: string;
  targetHosts: string;
  status: 'running' | 'success' | 'failed';
  tasksCount: number;
  outputLogs: string[];
  startedAt: number;
  durationMs: number;
  stats: {
    ok: number;
    changed: number;
    unreachable: number;
    failed: number;
  };
}

export interface Deployment {
  id: string;
  prompt: string;
  cloud: CloudProvider;
  language: IaCLanguage;
  status: DeploymentStatus;
  plan?: string;
  code?: string;
  validation?: string;
  costEstimate?: number;
  costBreakdown?: { resource: string; cost: number; unit: string }[];
  diagramCode?: string;
  workflowCode?: string;
  designDocument?: string;
  githubRepo?: string;
  githubWorkflowId?: string;
  logs: string[];
  createdAt: number;
  type?: 'builder' | 'consultant';
  governanceReport?: GovernanceReport;
  driftScan?: DriftScanResult;
}
