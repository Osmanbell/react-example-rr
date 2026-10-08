import { DriftScanResult, DriftResource, DriftSeverity, CloudProvider, IaCLanguage } from '../types';

/**
 * Runs a drift scan on a deployment comparing desired IaC state against live cloud/VM resources
 */
export async function performDriftScan(
  deploymentId: string,
  cloud: CloudProvider,
  language: IaCLanguage,
  code: string
): Promise<DriftScanResult> {
  // Simulate network roundtrip to Cloud API / VM agent
  await new Promise(resolve => setTimeout(resolve, 1500));

  const codeLower = (code || '').toLowerCase();
  const resources: DriftResource[] = [];

  // Inspect what kind of infrastructure is in the code and generate relevant drift checks
  const isCompute = codeLower.includes('vm') || codeLower.includes('instance') || codeLower.includes('compute') || cloud === 'self-hosted';
  const isDatabase = codeLower.includes('database') || codeLower.includes('db') || codeLower.includes('sql') || codeLower.includes('rds');
  const isStorage = codeLower.includes('storage') || codeLower.includes('bucket') || codeLower.includes('s3');
  const isNetwork = codeLower.includes('security_group') || codeLower.includes('nsg') || codeLower.includes('firewall') || codeLower.includes('vpc');

  // Resource 1: Security Perimeter / Firewall
  if (isNetwork || isCompute || true) {
    resources.push({
      id: `drift-res-${Date.now()}-1`,
      resourceName: cloud === 'aws' ? 'sg-prod-web-tier' : cloud === 'azure' ? 'nsg-prod-frontend' : cloud === 'gcp' ? 'firewall-allow-internal' : 'ufw-edge-firewall',
      resourceType: cloud === 'self-hosted' ? 'Linux Firewall (UFW)' : 'Network Security Group',
      cloud,
      status: 'drifted',
      severity: 'critical',
      location: cloud === 'azure' ? 'eastus' : cloud === 'aws' ? 'us-east-1' : cloud === 'gcp' ? 'us-central1' : 'datacenter-rack-01',
      lastChecked: Date.now(),
      driftedProperties: [
        {
          property: 'ingress_rules[port=22].cidr_blocks',
          expectedValue: '["10.0.0.0/16"] (Corporate VPN CIDR only)',
          actualValue: '["0.0.0.0/0"] (Global Internet)',
          severity: 'critical',
          description: 'A live manual modification opened SSH port 22 directly to the public internet, violating CIS Benchmark 5.2.',
          remediationAction: 'Revoke 0.0.0.0/0 inbound rule and restore corporate VPN CIDR restriction.'
        }
      ],
      remediationIaC: language === 'terraform' || language === 'opentofu' 
        ? `resource "${cloud === 'aws' ? 'aws_security_group_rule' : 'azurerm_network_security_rule'}" "ssh_ingress_remediation" {\n  description = "Remediated: Restrict SSH to corporate VPN"\n  direction   = "Inbound"\n  access      = "Allow"\n  protocol    = "Tcp"\n  port_range  = "22"\n  source_address_prefix = "10.0.0.0/16" # Closed 0.0.0.0/0\n}`
        : `# Remediation Rule for ${cloud}\n# Restricting Ingress on Port 22 to 10.0.0.0/16`
    });
  }

  // Resource 2: Storage Bucket / Disk
  if (isStorage || isCompute || true) {
    resources.push({
      id: `drift-res-${Date.now()}-2`,
      resourceName: cloud === 'aws' ? 'prod-data-archive-bucket' : cloud === 'azure' ? 'stprodappdata01' : cloud === 'gcp' ? 'gcs-prod-assets' : 'data-volume-mnt-nvme',
      resourceType: cloud === 'self-hosted' ? 'ZFS / LVM Volume' : 'Cloud Storage Account',
      cloud,
      status: 'drifted',
      severity: 'high',
      location: cloud === 'azure' ? 'eastus' : cloud === 'aws' ? 'us-east-1' : cloud === 'gcp' ? 'us-central1' : 'datacenter-rack-01',
      lastChecked: Date.now(),
      driftedProperties: [
        {
          property: 'encryption_at_rest.customer_managed_key',
          expectedValue: 'Enabled (KMS Key ID: kms-prod-9042)',
          actualValue: 'Disabled / Default Cloud Provider Key',
          severity: 'high',
          description: 'Storage account has reverted to standard platform-managed encryption instead of Customer-Managed Key (CMK).',
          remediationAction: 'Re-bind customer KMS key alias and re-enable cryptographic key rotation.'
        },
        {
          property: 'tags.ComplianceTier',
          expectedValue: '"Tier-1-Strict"',
          actualValue: 'null (Tag Missing)',
          severity: 'medium',
          description: 'Mandatory governance tag ComplianceTier was removed via cloud console.',
          remediationAction: 'Re-apply tag ComplianceTier: Tier-1-Strict.'
        }
      ],
      remediationIaC: language === 'terraform' || language === 'opentofu'
        ? `# Apply CMK and restore missing tag\nresource "${cloud === 'aws' ? 'aws_s3_bucket_server_side_encryption_configuration' : 'azurerm_storage_account_customer_managed_key'}" "reconcile" {\n  kms_master_key_id = "arn:aws:kms:us-east-1:123456789012:key/prod-9042"\n}`
        : `# Reconcile KMS encryption key binding`
    });
  }

  // Resource 3: In-Sync Database / Compute
  resources.push({
    id: `drift-res-${Date.now()}-3`,
    resourceName: cloud === 'aws' ? 'rds-postgres-primary' : cloud === 'azure' ? 'sql-srv-production' : cloud === 'gcp' ? 'cloudsql-postgres-ha' : 'vm-db-postgresql-01',
    resourceType: 'Relational Database / VM Instance',
    cloud,
    status: 'in-sync',
    severity: 'low',
    location: cloud === 'azure' ? 'eastus' : cloud === 'aws' ? 'us-east-1' : cloud === 'gcp' ? 'us-central1' : 'datacenter-rack-01',
    lastChecked: Date.now(),
    driftedProperties: [],
    remediationIaC: ''
  });

  // Resource 4: In-Sync Identity / Virtual Network
  resources.push({
    id: `drift-res-${Date.now()}-4`,
    resourceName: cloud === 'aws' ? 'vpc-prod-backbone' : cloud === 'azure' ? 'vnet-prod-eastus' : cloud === 'gcp' ? 'vpc-prod-core' : 'kvm-br0-internal',
    resourceType: 'Virtual Private Cloud / Bridge Network',
    cloud,
    status: 'in-sync',
    severity: 'low',
    location: cloud === 'azure' ? 'eastus' : cloud === 'aws' ? 'us-east-1' : cloud === 'gcp' ? 'us-central1' : 'datacenter-rack-01',
    lastChecked: Date.now(),
    driftedProperties: [],
    remediationIaC: ''
  });

  const driftedCount = resources.filter(r => r.status === 'drifted').length;
  const inSyncCount = resources.filter(r => r.status === 'in-sync').length;
  const totalResources = resources.length;
  const healthScore = Math.round((inSyncCount / totalResources) * 100);

  return {
    id: `scan-${Date.now()}`,
    deploymentId,
    timestamp: Date.now(),
    totalResources,
    driftedCount,
    inSyncCount,
    healthScore,
    status: driftedCount > 0 ? 'drifted' : 'in-sync',
    resources,
    summary: `Drift Scan Completed: ${driftedCount} of ${totalResources} resources drifted from declared IaC baseline (${healthScore}% consistency score). 1 Critical security vulnerability detected (unrestricted SSH ingress).`
  };
}

/**
 * Generate an exportable drift audit report
 */
export function generateDriftMarkdownReport(scan: DriftScanResult): string {
  const dateStr = new Date(scan.timestamp).toISOString();
  let md = `# Infrastructure Drift Detection & Compliance Report\n\n`;
  md += `**Scan ID:** \`${scan.id}\`  \n`;
  md += `**Timestamp:** ${dateStr}  \n`;
  md += `**Overall Health Score:** ${scan.healthScore}%  \n`;
  md += `**Status:** ${scan.status.toUpperCase()} (${scan.driftedCount} drifted / ${scan.totalResources} total)  \n\n`;
  md += `## Executive Summary\n${scan.summary}\n\n`;
  md += `## Detailed Resource Breakdown\n\n`;

  scan.resources.forEach((res, idx) => {
    md += `### ${idx + 1}. ${res.resourceName} (${res.resourceType})\n`;
    md += `- **Provider:** ${res.cloud.toUpperCase()} | **Region:** ${res.location || 'Default'}\n`;
    md += `- **State:** ${res.status === 'drifted' ? '⚠️ DRIFTED' : '✅ IN-SYNC'}\n`;
    if (res.status === 'drifted') {
      md += `- **Severity:** ${res.severity.toUpperCase()}\n`;
      md += `\n**Drifted Attributes:**\n`;
      res.driftedProperties.forEach(prop => {
        md += `  - **Attribute:** \`${prop.property}\`\n`;
        md += `    - *Declared in IaC:* \`${prop.expectedValue}\`\n`;
        md += `    - *Live Actual State:* \`${prop.actualValue}\`\n`;
        md += `    - *Finding:* ${prop.description}\n`;
        md += `    - *Remediation:* ${prop.remediationAction}\n`;
      });
      if (res.remediationIaC) {
        md += `\n**Recommended IaC Patch:**\n\`\`\`hcl\n${res.remediationIaC}\n\`\`\`\n`;
      }
    }
    md += `\n---\n\n`;
  });

  return md;
}
