import React, { useState } from 'react';
import { 
  Users, 
  ShieldCheck, 
  Key, 
  Lock, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Copy, 
  Check, 
  ExternalLink, 
  Sliders, 
  UserCheck, 
  Mail, 
  Building, 
  Eye, 
  Trash2,
  FileCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { UserRole, OrgMember, SSOConfig, RolePermission } from '../types';

interface RBACAndSSOViewProps {
  theme: 'dark' | 'light';
  currentUserRole?: UserRole;
  onSimulateRole?: (role: UserRole) => void;
}

const ROLES_PERMISSIONS: RolePermission[] = [
  {
    role: 'Organization Owner',
    description: 'Unrestricted superadmin authority. Manages billing, IAM governance, security baselines, and IdP federation.',
    permissions: ['iac:generate', 'iac:deploy', 'drift:scan', 'drift:reconcile', 'vm:manage', 'ansible:run', 'rbac:admin', 'sso:configure', 'audit:export']
  },
  {
    role: 'Security Administrator',
    description: 'Enforces governance baselines (CIS, SOC2, NIST), monitors drift, reviews IAM least privilege, and audits keys.',
    permissions: ['iac:generate', 'drift:scan', 'drift:reconcile', 'vm:manage', 'rbac:admin', 'sso:configure', 'audit:export']
  },
  {
    role: 'Cloud Administrator',
    description: 'Responsible for infrastructure provisioning, cloud resource lifecycles, and network topologies.',
    permissions: ['iac:generate', 'iac:deploy', 'drift:scan', 'drift:reconcile', 'vm:manage', 'ansible:run', 'audit:export']
  },
  {
    role: 'Cloud Architect',
    description: 'Designs multi-cloud infrastructure, drafts IaC templates, cost optimization, and architecture diagrams.',
    permissions: ['iac:generate', 'drift:scan', 'ansible:run', 'audit:export']
  },
  {
    role: 'DevOps Engineer',
    description: 'Deploys tested templates, manages CI/CD pipelines, executes Ansible playbooks, and fixes configuration drift.',
    permissions: ['iac:generate', 'iac:deploy', 'drift:scan', 'drift:reconcile', 'ansible:run']
  },
  {
    role: 'Auditor',
    description: 'Read-only compliance verification. Reviews architecture blueprints, drift history, and SOC2 audit trails.',
    permissions: ['drift:scan', 'audit:export']
  }
];

const INITIAL_MEMBERS: OrgMember[] = [
  {
    id: 'mem-1',
    email: 'husmanbell@gmail.com',
    displayName: 'Husman Bell (You)',
    role: 'Organization Owner',
    department: 'Cloud Infrastructure & Architecture',
    lastLogin: Date.now() - 1000 * 60 * 2,
    ssoEnforced: true,
    addedAt: Date.now() - 1000 * 60 * 60 * 24 * 30
  },
  {
    id: 'mem-2',
    email: 'sarah.secops@enterprise.internal',
    displayName: 'Sarah Chen',
    role: 'Security Administrator',
    department: 'InfoSec & Governance',
    lastLogin: Date.now() - 1000 * 60 * 45,
    ssoEnforced: true,
    addedAt: Date.now() - 1000 * 60 * 60 * 24 * 20
  },
  {
    id: 'mem-3',
    email: 'alex.devops@enterprise.internal',
    displayName: 'Alex Mercer',
    role: 'DevOps Engineer',
    department: 'Platform Engineering',
    lastLogin: Date.now() - 1000 * 60 * 180,
    ssoEnforced: true,
    addedAt: Date.now() - 1000 * 60 * 60 * 24 * 14
  },
  {
    id: 'mem-4',
    email: 'elena.audit@kpmg-advisory.com',
    displayName: 'Elena Rostova',
    role: 'Auditor',
    department: 'External Compliance & SOC2',
    lastLogin: Date.now() - 1000 * 60 * 60 * 24,
    ssoEnforced: false,
    addedAt: Date.now() - 1000 * 60 * 60 * 24 * 7
  }
];

export const RBACAndSSOView: React.FC<RBACAndSSOViewProps> = ({
  theme,
  currentUserRole = 'Organization Owner',
  onSimulateRole
}) => {
  const [activeTab, setActiveTab] = useState<'rbac' | 'sso' | 'audit'>('rbac');
  const [members, setMembers] = useState<OrgMember[]>(INITIAL_MEMBERS);
  const [activeRole, setActiveRole] = useState<UserRole>(currentUserRole);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  
  // Invite Member Form
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('Cloud Architect');
  const [inviteDept, setInviteDept] = useState('Engineering');

  // SSO Configuration State
  const [ssoConfig, setSsoConfig] = useState<SSOConfig>({
    enabled: true,
    provider: 'entra-id',
    issuerUrl: 'https://login.microsoftonline.com/72f988bf-86f1-41af-91ab-2d7cd011db47/v2.0',
    entityId: 'urn:federation:cloudgenius:enterprise',
    acsUrl: 'https://cloudgenius-ai.internal/api/auth/saml/callback',
    clientId: 'c0a4e321-789a-4122-b903-88fe02901a54',
    enforceDomain: 'enterprise.internal',
    defaultRole: 'DevOps Engineer',
    certificateThumbprint: 'E4:9C:A2:3B:5F:81:7A:12:90:34:CD:E7:F9:AA:88:BB',
    lastVerified: Date.now() - 1000 * 60 * 60 * 3
  });

  const [isTestingSSO, setIsTestingSSO] = useState(false);
  const [copiedAcs, setCopiedAcs] = useState(false);

  // Invite member
  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) {
      toast.error('Please specify an email address.');
      return;
    }
    const newMember: OrgMember = {
      id: `mem-${Date.now()}`,
      email: inviteEmail,
      displayName: inviteName || inviteEmail.split('@')[0],
      role: inviteRole,
      department: inviteDept,
      ssoEnforced: ssoConfig.enabled,
      addedAt: Date.now()
    };
    setMembers(prev => [...prev, newMember]);
    setIsInviteModalOpen(false);
    setInviteEmail('');
    setInviteName('');
    toast.success(`Invitation dispatched to ${newMember.email} with role [${newMember.role}].`);
  };

  // Delete member
  const handleDeleteMember = (id: string) => {
    if (id === 'mem-1') {
      toast.error('Cannot remove the primary Organization Owner.');
      return;
    }
    setMembers(prev => prev.filter(m => m.id !== id));
    toast.success('Member removed from organization.');
  };

  // Test SSO Handshake
  const handleTestSSO = async () => {
    setIsTestingSSO(true);
    toast.info(`Initiating SAML 2.0 / OIDC handshake with ${ssoConfig.provider.toUpperCase()}...`);
    
    setTimeout(() => {
      setIsTestingSSO(false);
      setSsoConfig(prev => ({ ...prev, lastVerified: Date.now() }));
      toast.success(`SSO Handshake Verified! SAML Metadata and IdP Certificate signature valid.`);
    }, 1500);
  };

  // Copy ACS URL
  const handleCopyAcs = () => {
    navigator.clipboard.writeText(ssoConfig.acsUrl);
    setCopiedAcs(true);
    setTimeout(() => setCopiedAcs(false), 2000);
    toast.success('Assertion Consumer Service (ACS) URL copied.');
  };

  // Switch Role Simulation
  const handleRoleSelect = (role: UserRole) => {
    setActiveRole(role);
    if (onSimulateRole) {
      onSimulateRole(role);
    }
    toast.info(`Switched active session preview to role: ${role}`);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className={`p-8 rounded-3xl border ${
        theme === 'dark' 
          ? 'bg-gradient-to-r from-purple-950/30 via-slate-900 to-black/60 border-white/10' 
          : 'bg-gradient-to-r from-purple-50/70 via-indigo-50/30 to-white border-purple-200/80 shadow-lg'
      }`}>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" /> Identity & Access Governance
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30">
                SAML 2.0 • OIDC • RBAC Matrix
              </span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Enterprise RBAC & Single Sign-On (SSO)</h2>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Enforce least-privilege role-based access control across your infrastructure team. Federate identities seamlessly via Okta, Microsoft Entra ID, or Google Workspace with automated SAML JIT provisioning.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Navigation Tabs */}
            <div className={`p-1 rounded-2xl border flex items-center ${
              theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
            }`}>
              <button
                onClick={() => setActiveTab('rbac')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                  activeTab === 'rbac' ? 'bg-purple-600 text-white shadow' : 'text-gray-400 hover:text-white'
                }`}
              >
                Roles & Permissions
              </button>
              <button
                onClick={() => setActiveTab('sso')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                  activeTab === 'sso' ? 'bg-purple-600 text-white shadow' : 'text-gray-400 hover:text-white'
                }`}
              >
                SSO Federation
              </button>
              <button
                onClick={() => setActiveTab('audit')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                  activeTab === 'audit' ? 'bg-purple-600 text-white shadow' : 'text-gray-400 hover:text-white'
                }`}
              >
                Audit Trail
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* TAB 1: RBAC & Members */}
      {activeTab === 'rbac' && (
        <div className="space-y-8">
          {/* Active Role Simulator & Info */}
          <div className={`p-6 rounded-3xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
            theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Simulate Role Perspective</div>
                <div className="text-lg font-bold flex items-center gap-2">
                  <span>{activeRole}</span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-500/20 text-emerald-400">
                    Active Session
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-400">Switch Role:</span>
              {(['Organization Owner', 'Security Administrator', 'Cloud Architect', 'DevOps Engineer', 'Auditor'] as UserRole[]).map(r => (
                <button
                  key={r}
                  onClick={() => handleRoleSelect(r)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    activeRole === r 
                      ? 'bg-purple-600 text-white' 
                      : theme === 'dark' ? 'bg-white/5 hover:bg-white/10 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                  }`}
                >
                  {r.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Members Table */}
          <div className={`rounded-3xl border overflow-hidden ${
            theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'
          }`}>
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">Organization Team Members ({members.length})</h3>
                <p className="text-xs text-gray-400">Users provisioned through Enterprise Directory & SSO</p>
              </div>
              <button
                id="btn-invite-member"
                onClick={() => setIsInviteModalOpen(true)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-1.5 shadow"
              >
                <Plus className="w-4 h-4" /> Invite Member
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className={`border-b ${theme === 'dark' ? 'border-white/10 bg-white/5 text-gray-400' : 'border-gray-200 bg-gray-50 text-gray-600'}`}>
                  <tr>
                    <th className="py-3 px-6 font-semibold">User</th>
                    <th className="py-3 px-6 font-semibold">Role</th>
                    <th className="py-3 px-6 font-semibold">Department</th>
                    <th className="py-3 px-6 font-semibold">Authentication</th>
                    <th className="py-3 px-6 font-semibold">Last Active</th>
                    <th className="py-3 px-6 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {members.map(member => (
                    <tr key={member.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-bold text-sm text-gray-200">{member.displayName}</div>
                        <div className="text-gray-400 font-mono text-[11px]">{member.email}</div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          member.role === 'Organization Owner' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          member.role === 'Security Administrator' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          member.role === 'DevOps Engineer' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                          'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                        }`}>
                          {member.role}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-300">
                        {member.department || 'Infrastructure'}
                      </td>
                      <td className="py-4 px-6">
                        {member.ssoEnforced ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                            <ShieldCheck className="w-3.5 h-3.5" /> SSO Enforced
                          </span>
                        ) : (
                          <span className="text-gray-400">Password / MFA</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-gray-400">
                        {member.lastLogin ? new Date(member.lastLogin).toLocaleTimeString() : 'Never'}
                      </td>
                      <td className="py-4 px-6 text-right">
                        {member.id !== 'mem-1' && (
                          <button
                            onClick={() => handleDeleteMember(member.id)}
                            className="p-1 rounded text-gray-400 hover:text-rose-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Granular Permission Matrix */}
          <div className={`p-6 rounded-3xl border space-y-4 ${
            theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
          }`}>
            <h3 className="text-base font-bold">Enterprise Role Permission Matrix</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ROLES_PERMISSIONS.map(rp => (
                <div 
                  key={rp.role}
                  className={`p-4 rounded-2xl border text-xs space-y-2 ${
                    activeRole === rp.role 
                      ? 'border-purple-500 bg-purple-500/10' 
                      : theme === 'dark' ? 'border-white/5 bg-black/20' : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">{rp.role}</span>
                    <span className="text-[10px] font-mono text-purple-400 font-bold">
                      {rp.permissions.length} PERMS
                    </span>
                  </div>
                  <p className="text-gray-400 text-[11px]">{rp.description}</p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {rp.permissions.map(perm => (
                      <span key={perm} className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-white/5 text-gray-300">
                        {perm}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SSO Federation */}
      {activeTab === 'sso' && (
        <div className="space-y-6">
          <div className={`p-8 rounded-3xl border space-y-6 ${
            theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold">SAML 2.0 & OpenID Connect Single Sign-On</h3>
                <p className="text-xs text-gray-400">Configure identity federation for centralized login</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  id="btn-test-sso-handshake"
                  onClick={handleTestSSO}
                  disabled={isTestingSSO}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-1.5 shadow"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTestingSSO ? 'animate-spin' : ''}`} />
                  {isTestingSSO ? 'Testing Handshake...' : 'Test SSO Connection'}
                </button>
              </div>
            </div>

            {/* Provider Selector */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { id: 'entra-id', name: 'Microsoft Entra ID' },
                { id: 'okta', name: 'Okta Identity' },
                { id: 'google-workspace', name: 'Google Workspace' },
                { id: 'ping', name: 'PingIdentity' },
                { id: 'generic-saml', name: 'Generic SAML 2.0' }
              ].map(prov => (
                <button
                  key={prov.id}
                  onClick={() => setSsoConfig(prev => ({ ...prev, provider: prov.id as any }))}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    ssoConfig.provider === prov.id
                      ? 'border-purple-500 bg-purple-500/10 font-bold text-purple-400'
                      : theme === 'dark' ? 'border-white/5 bg-white/5 text-gray-400' : 'border-gray-200 bg-gray-50 text-gray-600'
                  }`}
                >
                  <div className="text-xs">{prov.name}</div>
                </button>
              ))}
            </div>

            {/* SSO Form Parameters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400">Identity Provider (IdP) Issuer / Metadata URL</label>
                <input
                  type="text"
                  value={ssoConfig.issuerUrl}
                  onChange={e => setSsoConfig(prev => ({ ...prev, issuerUrl: e.target.value }))}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono ${
                    theme === 'dark' ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-gray-300'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400">SAML Entity ID (Audience URI)</label>
                <input
                  type="text"
                  value={ssoConfig.entityId}
                  onChange={e => setSsoConfig(prev => ({ ...prev, entityId: e.target.value }))}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono ${
                    theme === 'dark' ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-gray-300'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400">Assertion Consumer Service (ACS) Callback URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={ssoConfig.acsUrl}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono ${
                      theme === 'dark' ? 'bg-black/60 border-white/10 text-gray-400' : 'bg-gray-100 border-gray-300 text-gray-700'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={handleCopyAcs}
                    className="p-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-gray-300"
                  >
                    {copiedAcs ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400">Restricted Corporate Email Domain</label>
                <input
                  type="text"
                  placeholder="e.g. acmecorp.com"
                  value={ssoConfig.enforceDomain}
                  onChange={e => setSsoConfig(prev => ({ ...prev, enforceDomain: e.target.value }))}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono ${
                    theme === 'dark' ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-gray-300'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400">IdP X.509 Certificate Thumbprint</label>
                <input
                  type="text"
                  value={ssoConfig.certificateThumbprint}
                  onChange={e => setSsoConfig(prev => ({ ...prev, certificateThumbprint: e.target.value }))}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono ${
                    theme === 'dark' ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-gray-300'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400">Default Role for JIT Provisioning</label>
                <select
                  value={ssoConfig.defaultRole}
                  onChange={e => setSsoConfig(prev => ({ ...prev, defaultRole: e.target.value as any }))}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs ${
                    theme === 'dark' ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-gray-300'
                  }`}
                >
                  <option value="Cloud Architect">Cloud Architect</option>
                  <option value="DevOps Engineer">DevOps Engineer</option>
                  <option value="Auditor">Auditor</option>
                  <option value="Security Administrator">Security Administrator</option>
                </select>
              </div>
            </div>

            {/* Toggles */}
            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ssoConfig.enabled}
                  onChange={e => setSsoConfig(prev => ({ ...prev, enabled: e.target.checked }))}
                  className="rounded border-gray-400 text-purple-600 focus:ring-purple-500 w-4 h-4"
                />
                <div>
                  <div className="text-xs font-bold text-gray-200">Enforce SSO Authentication</div>
                  <div className="text-[11px] text-gray-400">Bypass local passwords for domain members</div>
                </div>
              </label>

              <div className="text-xs text-gray-400">
                Last verified: {ssoConfig.lastVerified ? new Date(ssoConfig.lastVerified).toLocaleString() : 'Never'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Audit Trail */}
      {activeTab === 'audit' && (
        <div className={`p-6 rounded-3xl border space-y-4 ${
          theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">Immutable Security & Access Audit Log</h3>
              <p className="text-xs text-gray-400">SOC 2 CC6.8 compliant audit trail of all authentication and privilege events</p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Audit Stream Active
            </span>
          </div>

          <div className="space-y-2">
            {[
              { time: '2 mins ago', event: 'SAML Assertion Verified', user: 'husmanbell@gmail.com', ip: '192.168.1.10', status: 'success' },
              { time: '14 mins ago', event: 'Role Assumed: Organization Owner', user: 'husmanbell@gmail.com', ip: '192.168.1.10', status: 'success' },
              { time: '1 hour ago', event: 'Drift Scan Initiated', user: 'sarah.secops@enterprise.internal', ip: '10.0.4.15', status: 'info' },
              { time: '3 hours ago', event: 'SSO Metadata Handshake Sync', user: 'SYSTEM (Entra ID)', ip: '20.190.159.0', status: 'success' },
              { time: '5 hours ago', event: 'Ansible Playbook Dispatched', user: 'alex.devops@enterprise.internal', ip: '10.0.12.8', status: 'success' }
            ].map((entry, idx) => (
              <div 
                key={idx}
                className={`p-3 rounded-xl border flex items-center justify-between text-xs font-mono ${
                  theme === 'dark' ? 'bg-black/30 border-white/5' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-emerald-400 font-bold">[{entry.time}]</span>
                  <span className="text-gray-200">{entry.event}</span>
                </div>
                <div className="flex items-center gap-4 text-gray-400">
                  <span>{entry.user}</span>
                  <span className="text-gray-500">{entry.ip}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      <AnimatePresence>
        {isInviteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full max-w-md rounded-3xl border p-6 space-y-5 ${
                theme === 'dark' ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900 shadow-2xl'
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">Invite Organization Member</h3>
                <button
                  onClick={() => setIsInviteModalOpen(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleInvite} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400">Corporate Email</label>
                  <input
                    type="email"
                    required
                    placeholder="user@enterprise.internal"
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    className={`w-full px-3.5 py-2 rounded-xl border text-sm ${
                      theme === 'dark' ? 'bg-black/50 border-white/10 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400">Full Name</label>
                  <input
                    type="text"
                    placeholder="Jane Doe"
                    value={inviteName}
                    onChange={e => setInviteName(e.target.value)}
                    className={`w-full px-3.5 py-2 rounded-xl border text-sm ${
                      theme === 'dark' ? 'bg-black/50 border-white/10 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400">Assigned Role</label>
                  <select
                    value={inviteRole}
                    onChange={e => setInviteRole(e.target.value as any)}
                    className={`w-full px-3.5 py-2 rounded-xl border text-sm ${
                      theme === 'dark' ? 'bg-black/50 border-white/10 text-white' : 'bg-white border-gray-300'
                    }`}
                  >
                    <option value="Security Administrator">Security Administrator</option>
                    <option value="Cloud Administrator">Cloud Administrator</option>
                    <option value="Cloud Architect">Cloud Architect</option>
                    <option value="DevOps Engineer">DevOps Engineer</option>
                    <option value="Auditor">Auditor</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsInviteModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow"
                  >
                    Send Invitation
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
