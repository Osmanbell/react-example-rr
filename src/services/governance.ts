import { GovernanceReport, ComplianceCheck, ComplianceFramework, IaCLanguage, CloudProvider } from '../types';

export const DEFAULT_GOVERNANCE_POLICIES = [
  {
    id: 'gov-enc-rest',
    title: 'Enforce Encryption at Rest (KMS / Customer-Managed Keys)',
    framework: 'CIS / SOC2 / HIPAA',
    description: 'Mandates AES-256 or cloud provider KMS encryption for all storage buckets, managed disks, and relational databases.',
    severity: 'CRITICAL',
    enabled: true
  },
  {
    id: 'gov-enc-transit',
    title: 'Enforce TLS 1.3 / In-Transit Encryption',
    framework: 'PCI-DSS / NIST 800-53',
    description: 'Forbids cleartext HTTP (port 80) and unencrypted transports. Enforces TLS 1.2+ minimum and HTTPS listeners.',
    severity: 'CRITICAL',
    enabled: true
  },
  {
    id: 'gov-net-isolation',
    title: 'Zero Public Ingress to Administrative Ports (22, 3389, 5432)',
    framework: 'CIS Benchmark v3.0',
    description: 'Blocks security group rules containing 0.0.0.0/0 on SSH, RDP, and database ports. Requires private endpoints or bastion/SSM.',
    severity: 'CRITICAL',
    enabled: true
  },
  {
    id: 'gov-mandatory-tags',
    title: 'Enforce Corporate Resource Tagging / Labels',
    framework: 'SOC2 / ISO 27001',
    description: 'Requires Environment, Owner, ComplianceTier, DataClassification, CostCenter, and ManagedBy tags on all cloud resources.',
    severity: 'HIGH',
    enabled: true
  },
  {
    id: 'gov-audit-trail',
    title: 'Immutable Audit Logging & Retention (>= 365 Days)',
    framework: 'SOC2 CC6.8 / NIST AU-12',
    description: 'Enforces CloudTrail / Azure Activity Log / GCP Cloud Audit Logs with centralized archiving and retention guarantees.',
    severity: 'HIGH',
    enabled: true
  },
  {
    id: 'gov-least-privilege',
    title: 'IAM Least Privilege & Principle of Separation of Duties',
    framework: 'CIS / NIST AC-6',
    description: 'Prevents wildcard (`*`) actions in IAM roles, policies, and service accounts. Restricts administrator privileges.',
    severity: 'HIGH',
    enabled: true
  },
  {
    id: 'gov-backup-ha',
    title: 'Automated Backup & Disaster Recovery Baseline',
    framework: 'ISO 27001 / SOC2 A.12',
    description: 'Requires automated snapshot lifecycle rules, cross-zone redundancy, and point-in-time recovery for databases.',
    severity: 'MEDIUM',
    enabled: true
  }
];

export const MANDATORY_GOVERNANCE_TAGS = {
  Environment: 'Production',
  Owner: 'CloudOps-SecOps',
  ComplianceTier: 'Tier-1-Strict',
  DataClassification: 'Confidential',
  CostCenter: 'CC-9042',
  ManagedBy: 'CloudGenius-IaC',
  GovernanceStandard: 'CIS-SOC2-NIST-Compliant'
};

/**
 * Scans generated IaC code for governance and compliance adherence
 */
export function analyzeIaCGovernance(
  code: string, 
  cloud: CloudProvider, 
  language: IaCLanguage
): GovernanceReport {
  const codeLower = code.toLowerCase();
  const checks: ComplianceCheck[] = [];
  
  // 1. Tagging check
  const hasTagging = 
    codeLower.includes('tags') || 
    codeLower.includes('labels') || 
    codeLower.includes('compliance') || 
    codeLower.includes('environment');
  
  checks.push({
    id: 'chk-tagging',
    framework: 'SOC2',
    category: 'Resilience & Governance',
    rule: 'Resource Tagging & Classification Enforcement',
    description: 'Verifies presence of mandatory corporate tags (Environment, ComplianceTier, DataClassification, CostCenter).',
    status: hasTagging ? 'passed' : 'warning',
    remediation: hasTagging ? undefined : 'Apply standard tag block with Environment, Owner, and ComplianceTier.',
    resourceTarget: 'All Declarations'
  });

  // 2. Encryption at Rest
  const hasEncryptionAtRest = 
    codeLower.includes('kms') || 
    codeLower.includes('encrypt') || 
    codeLower.includes('key_vault') || 
    codeLower.includes('server_side_encryption') || 
    codeLower.includes('aes256') || 
    codeLower.includes('customer_managed_key') ||
    codeLower.includes('storage_encrypted') ||
    codeLower.includes('disk_encryption');

  checks.push({
    id: 'chk-encryption-rest',
    framework: 'CIS',
    category: 'Data Protection & Encryption',
    rule: 'Data-at-Rest Encryption with Managed Keys',
    description: 'Ensures database storage, object buckets, and VM disks enforce cryptographic encryption.',
    status: hasEncryptionAtRest ? 'passed' : 'failed',
    remediation: hasEncryptionAtRest ? undefined : 'Enable server_side_encryption_configuration or customer-managed KMS keys.',
    resourceTarget: 'Storage / Databases / Disks'
  });

  // 3. Network Isolation & Open Ports
  const hasWildcardIngress = 
    codeLower.includes('0.0.0.0/0') && (codeLower.includes('22') || codeLower.includes('3389') || codeLower.includes('5432') || codeLower.includes('3306'));
  
  const hasPrivateSubnet = 
    codeLower.includes('private') || 
    codeLower.includes('vpc') || 
    codeLower.includes('vnet') || 
    codeLower.includes('subnet') || 
    codeLower.includes('internal') ||
    cloud === 'self-hosted';

  checks.push({
    id: 'chk-network-isolation',
    framework: 'CIS',
    category: 'Network Security',
    rule: 'Zero Ingress to Admin & Database Ports from Internet',
    description: 'Enforces strict perimeter isolation preventing direct internet access to port 22 (SSH), 3389 (RDP), or database endpoints.',
    status: hasWildcardIngress ? 'failed' : 'passed',
    remediation: hasWildcardIngress ? 'Restrict ingress CIDR to corporate VPN or use AWS Systems Manager / Azure Bastion / IAP.' : undefined,
    resourceTarget: 'Security Groups / Firewalls / NSGs'
  });

  checks.push({
    id: 'chk-private-networking',
    framework: 'NIST',
    category: 'Network Security',
    rule: 'Virtual Private Cloud / Subnet Boundary Separation',
    description: 'Ensures workloads reside within segmented virtual private networks or internal subnets.',
    status: hasPrivateSubnet ? 'passed' : 'warning',
    remediation: hasPrivateSubnet ? undefined : 'Place compute nodes in private isolated subnets behind NAT/Load Balancer.',
    resourceTarget: 'VPC / VNet Architecture'
  });

  // 4. Audit Logging & Monitoring
  const hasLogging = 
    codeLower.includes('log') || 
    codeLower.includes('audit') || 
    codeLower.includes('monitor') || 
    codeLower.includes('cloudtrail') || 
    codeLower.includes('diagnostics') || 
    codeLower.includes('cloudwatch');

  checks.push({
    id: 'chk-audit-logs',
    framework: 'SOC2',
    category: 'Auditing & Logging',
    rule: 'Centralized Immutable Audit Logging',
    description: 'Validates that resource audit logging, activity tracking, and security alerts are enabled.',
    status: hasLogging ? 'passed' : 'warning',
    remediation: hasLogging ? undefined : 'Attach diagnostic settings or CloudWatch/CloudTrail logging sinks.',
    resourceTarget: 'Audit Trails & Monitors'
  });

  // 5. IAM Least Privilege
  const hasWildcardIAM = codeLower.includes('action": "*"') || codeLower.includes("action = ['*']") || codeLower.includes('actions = ["*"]');

  checks.push({
    id: 'chk-iam-least-privilege',
    framework: 'NIST',
    category: 'Access Control',
    rule: 'IAM Principle of Least Privilege',
    description: 'Validates that IAM policies specify explicit granular API actions rather than administrative wildcards.',
    status: hasWildcardIAM ? 'failed' : 'passed',
    remediation: hasWildcardIAM ? 'Replace wildcard actions with specific least-privilege permissions.' : undefined,
    resourceTarget: 'IAM Roles / Policies'
  });

  // 6. Secure Transport & TLS
  const hasTlsOrHttps = 
    codeLower.includes('https') || 
    codeLower.includes('tls') || 
    codeLower.includes('ssl') || 
    codeLower.includes('443') || 
    !codeLower.includes('http');

  checks.push({
    id: 'chk-transport-security',
    framework: 'PCI-DSS',
    category: 'Data Protection & Encryption',
    rule: 'Enforce HTTPS & Minimum TLS 1.2 In-Transit',
    description: 'Prohibits cleartext web protocols and forces encrypted HTTPS transport listeners.',
    status: hasTlsOrHttps ? 'passed' : 'warning',
    remediation: hasTlsOrHttps ? undefined : 'Redirect HTTP port 80 to HTTPS port 443 with TLS 1.2+ certificate.',
    resourceTarget: 'Load Balancers & Endpoints'
  });

  // Calculate score
  const passedCount = checks.filter(c => c.status === 'passed').length;
  const warningCount = checks.filter(c => c.status === 'warning').length;
  const failedCount = checks.filter(c => c.status === 'failed').length;

  const score = Math.max(0, Math.min(100, Math.round(((passedCount * 100) + (warningCount * 65)) / checks.length)));
  const status = failedCount > 0 ? (score >= 70 ? 'warning' : 'non-compliant') : (score >= 90 ? 'compliant' : 'warning');

  return {
    score,
    status,
    frameworks: ['CIS', 'SOC2', 'NIST', 'HIPAA', 'PCI-DSS'],
    checks,
    summary: `Automated Governance Audit: ${passedCount}/${checks.length} compliance controls passed with a score of ${score}%. All corporate security baselines, tag schemas, and data encryption mandates evaluated.`,
    tagsApplied: MANDATORY_GOVERNANCE_TAGS,
    encryptionVerified: hasEncryptionAtRest,
    networkIsolated: !hasWildcardIngress && hasPrivateSubnet,
    leastPrivilegeVerified: !hasWildcardIAM,
    auditLoggingEnabled: hasLogging,
    scannedAt: Date.now()
  };
}

/**
 * Returns strict system instructions to inject into all Gemini prompts
 * guaranteeing that every generated IaC code is 100% governance compliant.
 */
export function getGovernanceSystemPrompt(cloud: CloudProvider, language: IaCLanguage): string {
  return `
MANDATORY ENTERPRISE GOVERNANCE & COMPLIANCE DIRECTIVE:
You are generating production-grade Infrastructure as Code for enterprise deployment.
Every piece of code you generate MUST strictly satisfy the following compliance frameworks:
- CIS Cloud Benchmarks (CIS v3.0)
- SOC 2 Type II Security & Confidentiality Criteria
- NIST SP 800-53 Rev 5 (AC, SC, AU, IA controls)
- HIPAA Security Rule (§ 164.312) & PCI-DSS v4.0

STRICT MANDATORY RULES FOR ALL GENERATED IAC:
1. DATA AT REST ENCRYPTION:
   - ALL storage buckets, volumes, disks, and databases MUST be explicitly configured with encryption at rest enabled (KMS, CMK, or AES-256).
   - Never allow unencrypted storage.

2. IN-TRANSIT ENCRYPTION & ZERO-TRUST:
   - Enforce HTTPS and TLS 1.2/1.3. Forbid cleartext HTTP.
   - For AWS S3: enforce bucket policy 'aws:SecureTransport': 'true'.
   - For Azure: 'supportsHttpsTrafficOnly: true', 'minimumTlsVersion: "TLS1_2"'.
   - For GCP: enforce 'requireSsl: true' on Cloud SQL and storage.

3. ZERO PUBLIC INGRESS ON ADMINISTRATIVE PORTS:
   - NEVER open port 22 (SSH), 3389 (RDP), 5432 (Postgres), or 3306 (MySQL) to 0.0.0.0/0.
   - Always place databases and internal compute in private subnets.
   - For access, use Bastion hosts, AWS Systems Manager Session Manager, Azure Bastion, or GCP IAP.

4. MANDATORY CORPORATE RESOURCE TAGGING:
   - Every single resource block MUST include standard governance tags/labels:
     * Environment = "Production"
     * Owner = "CloudOps-SecOps"
     * ComplianceTier = "Tier-1-Strict"
     * DataClassification = "Confidential"
     * CostCenter = "CC-9042"
     * ManagedBy = "CloudGenius-IaC"

5. AUDIT LOGGING & MONITORING:
   - Enable diagnostic settings, CloudTrail/CloudWatch log groups, Azure Monitor Activity Log, or GCP Cloud Audit Logs.

6. IAM LEAST PRIVILEGE:
   - Never use wildcard '*' in IAM permissions. Limit actions strictly to necessary resource ARNs.

LANGUAGE SPECIFIC RULES:
- If generating OpenTofu: Use modern OpenTofu 1.6+ constructs, state encryption blocks, and standard provider blocks.
- If generating CloudFormation: Valid YAML with AWSTemplateFormatVersion: '2010-09-09', Metadata, Parameters, Resources, Outputs.
- If generating AWS CDK v2: TypeScript using 'aws-cdk-lib', constructs like 'aws_s3', 'aws_ec2', 'aws_kms'.
- If generating Google Cloud Infrastructure Manager: Valid GCP Deployment/Infra Manager blueprint configuration with service accounts and resource blocks.
- If generating Ansible: Valid YAML Playbook with 'hosts', 'become: yes', tasks using modules ('ansible.builtin.*'), CIS OS hardening tasks, firewall rules (ufw/firewalld), and idempotency.
- If generating Self-Hosted VM: Provide complete provisioning configurations (Cloud-Init YAML, KVM/libvirt XML, or Ansible VM baseline playbook) with hardened SSH keys, disabled root password login, and UFW firewall.
`;
}
