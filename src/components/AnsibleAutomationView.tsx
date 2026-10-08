import React, { useState } from 'react';
import { 
  TerminalSquare, 
  Play, 
  FileCode2, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  Copy, 
  Check, 
  Layers, 
  ShieldCheck, 
  Server, 
  Sparkles,
  RefreshCw,
  FolderGit2
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { AnsiblePlaybookRun, SelfHostedVM } from '../types';

interface AnsibleAutomationViewProps {
  theme: 'dark' | 'light';
  selfHostedVms?: SelfHostedVM[];
}

const TEMPLATE_PLAYBOOKS = [
  {
    id: 'cis-hardening',
    title: 'CIS Benchmark v3.0 OS Hardening',
    description: 'Enforces SSH key-only auth, UFW/Firewalld isolation, kernel sysctl security, and auditd.',
    category: 'Security & Compliance',
    target: 'all_vms',
    code: `---
- name: Enterprise CIS Benchmark v3.0 OS Hardening
  hosts: all
  become: yes
  vars:
    ssh_port: 22
    permit_root_login: "no"
    password_auth: "no"
    allowed_vpn_subnet: "10.0.0.0/16"

  tasks:
    - name: 1. Ensure packages are up to date and security patches applied
      ansible.builtin.apt:
        update_cache: yes
        upgrade: dist
        autoremove: yes
      when: ansible_os_family == "Debian"

    - name: 2. Harden SSH Daemon Configuration (CIS 5.2)
      ansible.builtin.lineinfile:
        path: /etc/ssh/sshd_config
        regexp: "{{ item.regexp }}"
        line: "{{ item.line }}"
        state: present
        validate: '/usr/sbin/sshd -t -f %s'
      loop:
        - { regexp: '^#?PermitRootLogin', line: 'PermitRootLogin {{ permit_root_login }}' }
        - { regexp: '^#?PasswordAuthentication', line: 'PasswordAuthentication {{ password_auth }}' }
        - { regexp: '^#?X11Forwarding', line: 'X11Forwarding no' }
        - { regexp: '^#?MaxAuthTries', line: 'MaxAuthTries 3' }
      notify: Restart SSH

    - name: 3. Configure UFW Firewall (CIS 3.5)
      community.general.ufw:
        state: enabled
        policy: reject
        logging: 'on'

    - name: 4. Allow SSH ingress strictly from Corporate VPN
      community.general.ufw:
        rule: allow
        port: "{{ ssh_port }}"
        proto: tcp
        from_ip: "{{ allowed_vpn_subnet }}"

    - name: 5. Enforce Kernel Hardening Sysctl parameters
      ansible.posix.sysctl:
        name: "{{ item.name }}"
        value: "{{ item.value }}"
        state: present
        reload: yes
      loop:
        - { name: 'net.ipv4.conf.all.rp_filter', value: '1' }
        - { name: 'net.ipv4.conf.all.accept_redirects', value: '0' }
        - { name: 'net.ipv4.tcp_syncookies', value: '1' }

  handlers:
    - name: Restart SSH
      ansible.builtin.service:
        name: sshd
        state: restarted`
  },
  {
    id: 'k3s-docker',
    title: 'K3s Lightweight Kubernetes & Containerd',
    description: 'Installs hardened single-node or cluster agent K3s with Cilium CNI and local storage.',
    category: 'Container Orchestration',
    target: 'compute_nodes',
    code: `---
- name: Deploy Production K3s Kubernetes Runtime
  hosts: compute_nodes
  become: yes
  vars:
    k3s_version: "v1.30.2+k3s1"
    disable_traefik: true

  tasks:
    - name: Install required network tools and cgroup dependencies
      ansible.builtin.package:
        name:
          - curl
          - iptables
          - wireguard-tools
        state: present

    - name: Download official K3s install script
      ansible.builtin.get_url:
        url: https://get.k3s.io
        dest: /tmp/install_k3s.sh
        mode: '0755'

    - name: Execute K3s installation with CIS security flags
      ansible.builtin.shell: >
        INSTALL_K3S_VERSION="{{ k3s_version }}"
        INSTALL_K3S_EXEC="server --write-kubeconfig-mode 644 --protect-kernel-defaults"
        /tmp/install_k3s.sh
      args:
        creates: /usr/local/bin/k3s

    - name: Verify K3s systemd service is active and running
      ansible.builtin.systemd:
        name: k3s
        state: started
        enabled: yes`
  },
  {
    id: 'nginx-tls',
    title: 'Hardened Nginx Reverse Proxy with TLS 1.3',
    description: 'Deploys Nginx edge proxy with strict HTTP security headers (HSTS, CSP) and TLS 1.3.',
    category: 'Web & Load Balancing',
    target: 'edge_proxies',
    code: `---
- name: Deploy Hardened Nginx Reverse Proxy
  hosts: edge_proxies
  become: yes

  tasks:
    - name: Install Nginx web server
      ansible.builtin.package:
        name: nginx
        state: present

    - name: Configure TLS 1.3 and HSTS Security Headers
      ansible.builtin.copy:
        dest: /etc/nginx/conf.d/security_headers.conf
        content: |
          add_header X-Frame-Options "DENY" always;
          add_header X-Content-Type-Options "nosniff" always;
          add_header X-XSS-Protection "1; mode=block" always;
          add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
          ssl_protocols TLSv1.2 TLSv1.3;
          ssl_prefer_server_ciphers on;
      notify: Reload Nginx

  handlers:
    - name: Reload Nginx
      ansible.builtin.service:
        name: nginx
        state: reloaded`
  }
];

export const AnsibleAutomationView: React.FC<AnsibleAutomationViewProps> = ({
  theme,
  selfHostedVms = []
}) => {
  const [selectedPlaybook, setSelectedPlaybook] = useState(TEMPLATE_PLAYBOOKS[0]);
  const [playbookCode, setPlaybookCode] = useState(TEMPLATE_PLAYBOOKS[0].code);
  const [targetHost, setTargetHost] = useState('all');
  const [dryRun, setDryRun] = useState(false);
  const [verbose, setVerbose] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [runLogs, setRunLogs] = useState<string[]>([]);
  const [lastRunStats, setLastRunStats] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  // Switch template
  const handleSelectTemplate = (p: typeof TEMPLATE_PLAYBOOKS[0]) => {
    setSelectedPlaybook(p);
    setPlaybookCode(p.code);
    setRunLogs([]);
    setLastRunStats(null);
  };

  // Run Playbook
  const handleExecutePlaybook = async () => {
    setIsRunning(true);
    setRunLogs([]);
    toast.info(`Executing playbook "${selectedPlaybook.title}" on target [${targetHost}]...`);

    const simulatedLogs = [
      `$ ansible-playbook site.yml -i inventory.ini ${dryRun ? '--check' : ''} ${verbose ? '-v' : ''}`,
      `Using /etc/ansible/ansible.cfg as config file`,
      ``,
      `PLAY [${selectedPlaybook.title}] **********************************************************`,
      ``,
      `TASK [Gathering Facts] *******************************************************************`,
      `ok: [192.168.10.45]`,
      `ok: [10.0.50.12]`,
      `ok: [10.0.50.30]`,
      ``,
      `TASK [1. Ensure packages are up to date and security patches applied] ********************`,
      dryRun ? `ok: [192.168.10.45]` : `changed: [192.168.10.45] (14 security updates installed)`,
      `ok: [10.0.50.12]`,
      dryRun ? `ok: [10.0.50.30]` : `changed: [10.0.50.30] (3 updates)`,
      ``,
      `TASK [2. Harden SSH Daemon Configuration (CIS 5.2)] **************************************`,
      dryRun ? `ok: [192.168.10.45]` : `changed: [192.168.10.45] (PermitRootLogin -> no)`,
      dryRun ? `ok: [10.0.50.12]` : `changed: [10.0.50.12] (PasswordAuthentication -> no)`,
      `ok: [10.0.50.30]`,
      ``,
      `TASK [3. Configure UFW Firewall (CIS 3.5)] ***********************************************`,
      dryRun ? `ok: [192.168.10.45]` : `changed: [192.168.10.45] (UFW active, default policy reject)`,
      `ok: [10.0.50.12]`,
      dryRun ? `ok: [10.0.50.30]` : `changed: [10.0.50.30] (firewalld restricted)`,
      ``,
      `TASK [4. Enforce Kernel Hardening Sysctl parameters] **************************************`,
      `ok: [192.168.10.45]`,
      `ok: [10.0.50.12]`,
      `ok: [10.0.50.30]`,
      ``,
      `RUNNING HANDLER [Restart SSH] ************************************************************`,
      dryRun ? `skipping: [192.168.10.45]` : `changed: [192.168.10.45]`,
      dryRun ? `skipping: [10.0.50.12]` : `changed: [10.0.50.12]`,
      ``,
      `PLAY RECAP *******************************************************************************`,
      dryRun
        ? `192.168.10.45 : ok=5    changed=0    unreachable=0    failed=0    skipped=1`
        : `192.168.10.45 : ok=6    changed=4    unreachable=0    failed=0    skipped=0`,
      dryRun
        ? `10.0.50.12    : ok=5    changed=0    unreachable=0    failed=0    skipped=1`
        : `10.0.50.12    : ok=5    changed=2    unreachable=0    failed=0    skipped=0`,
      dryRun
        ? `10.0.50.30    : ok=5    changed=0    unreachable=0    failed=0    skipped=1`
        : `10.0.50.30    : ok=5    changed=1    unreachable=0    failed=0    skipped=0`,
      ``,
      `[SUCCESS] Ansible playbook completed successfully in 3.42s.`
    ];

    // Stream logs progressively
    for (let i = 0; i < simulatedLogs.length; i++) {
      await new Promise(r => setTimeout(r, 60));
      setRunLogs(prev => [...prev, simulatedLogs[i]]);
    }

    setIsRunning(false);
    setLastRunStats({
      ok: 16,
      changed: dryRun ? 0 : 7,
      failed: 0,
      unreachable: 0,
      status: 'success'
    });
    toast.success('Ansible playbook run finished with 0 failures!');
  };

  // Download Playbook zip
  const handleDownloadZip = async () => {
    const zip = new JSZip();
    zip.file('playbook.yml', playbookCode);
    zip.file('ansible.cfg', `[defaults]\ninventory = inventory.ini\nhost_key_checking = False\nremote_user = ubuntu\nretry_files_enabled = False\n`);
    zip.file('inventory.ini', `[all_vms]\n192.168.10.45 ansible_user=ubuntu\n10.0.50.12 ansible_user=root\n10.0.50.30 ansible_user=admin ansible_port=2222\n\n[compute_nodes]\n192.168.10.45\n\n[edge_proxies]\n10.0.50.12\n`);
    zip.file('README.md', `# Ansible Playbook Bundle\n\nGenerated by CloudGenius AI.\n\nRun:\n\`\`\`bash\nansible-playbook -i inventory.ini playbook.yml\n\`\`\`\n`);

    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, `ansible-${selectedPlaybook.id}-${Date.now()}.zip`);
    toast.success('Ansible playbook bundle (.zip) downloaded.');
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(playbookCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Playbook YAML copied to clipboard.');
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className={`p-8 rounded-3xl border ${
        theme === 'dark' 
          ? 'bg-gradient-to-r from-red-950/30 via-slate-900 to-black/60 border-white/10' 
          : 'bg-gradient-to-r from-red-50/70 via-orange-50/30 to-white border-red-200/80 shadow-lg'
      }`}>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1.5">
                <TerminalSquare className="w-3.5 h-3.5" /> Configuration Management
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30">
                Ansible Engine 2.16+
              </span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Ansible Automation & Playbooks</h2>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Declarative configuration management and host orchestration. Execute modular, idempotent Ansible playbooks against Self-Hosted VMs, AWS EC2, Azure VMs, and GCP Compute Engine with CIS compliance built-in.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="btn-download-ansible-zip"
              onClick={handleDownloadZip}
              className={`px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-colors ${
                theme === 'dark' ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white' : 'bg-white border-gray-200 hover:bg-gray-100 text-gray-800'
              }`}
            >
              <Download className="w-4 h-4" /> Export Bundle (.zip)
            </button>
            <button
              id="btn-run-ansible-playbook"
              onClick={handleExecutePlaybook}
              disabled={isRunning}
              className="px-6 py-2.5 rounded-xl font-bold text-sm bg-red-600 hover:bg-red-500 text-white flex items-center gap-2 shadow-lg shadow-red-600/25 transition-all disabled:opacity-50"
            >
              <Play className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
              {isRunning ? 'Running Tasks...' : 'Run Playbook'}
            </button>
          </div>
        </div>
      </div>

      {/* Catalog & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Playbook Templates Selector */}
        <div className="space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-400 px-1">
            Enterprise Playbook Catalog
          </div>
          {TEMPLATE_PLAYBOOKS.map(pb => (
            <button
              key={pb.id}
              onClick={() => handleSelectTemplate(pb)}
              className={`w-full text-left p-4 rounded-2xl border transition-all ${
                selectedPlaybook.id === pb.id
                  ? 'border-red-500/50 bg-red-500/10 shadow-sm'
                  : theme === 'dark' ? 'border-white/5 bg-white/5 hover:bg-white/10' : 'border-gray-200 bg-white hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sm">{pb.title}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-400">
                  {pb.category}
                </span>
              </div>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {pb.description}
              </p>
            </button>
          ))}

          {/* Execution Configuration Card */}
          <div className={`p-5 rounded-2xl border space-y-4 ${
            theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
          }`}>
            <div className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Run Configuration
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-400">Target Inventory Group</label>
              <select
                value={targetHost}
                onChange={e => setTargetHost(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border text-xs font-mono ${
                  theme === 'dark' ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-gray-300'
                }`}
              >
                <option value="all">all (All 3 registered hosts)</option>
                <option value="compute_nodes">compute_nodes (KVM & Bare Metal)</option>
                <option value="edge_proxies">edge_proxies (Proxmox Node)</option>
                <option value="192.168.10.45">192.168.10.45 (Ubuntu Edge)</option>
              </select>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="text-xs font-medium cursor-pointer flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={dryRun}
                  onChange={e => setDryRun(e.target.checked)}
                  className="rounded border-gray-400 text-red-600 focus:ring-red-500"
                />
                Dry Run (--check mode)
              </label>

              <label className="text-xs font-medium cursor-pointer flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={verbose}
                  onChange={e => setVerbose(e.target.checked)}
                  className="rounded border-gray-400 text-red-600 focus:ring-red-500"
                />
                Verbose (-v)
              </label>
            </div>
          </div>
        </div>

        {/* Playbook Editor & Terminal Output */}
        <div className="lg:col-span-2 space-y-6">
          {/* YAML Editor Panel */}
          <div className={`rounded-3xl border overflow-hidden flex flex-col ${
            theme === 'dark' ? 'bg-black/60 border-white/10' : 'bg-white border-gray-200 shadow-sm'
          }`}>
            <div className={`p-4 border-b flex items-center justify-between ${
              theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-gray-100 bg-gray-50'
            }`}>
              <div className="flex items-center gap-2 font-mono text-xs">
                <FileCode2 className="w-4 h-4 text-red-400" />
                <span className="font-bold">playbook.yml</span>
                <span className="text-gray-500">• YAML (Ansible 2.16)</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCode}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white transition-colors"
                  title="Copy Playbook"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <textarea
              value={playbookCode}
              onChange={e => setPlaybookCode(e.target.value)}
              rows={14}
              spellCheck={false}
              className="w-full p-4 font-mono text-xs bg-transparent resize-y focus:outline-none scrollbar-hide text-emerald-400"
            />
          </div>

          {/* Execution Console Terminal */}
          <div className={`rounded-3xl border overflow-hidden flex flex-col ${
            theme === 'dark' ? 'bg-black border-white/10' : 'bg-gray-900 border-gray-800 text-white'
          }`}>
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-2 font-mono text-xs">
                <TerminalSquare className="w-4 h-4 text-emerald-400" />
                <span className="font-bold">Ansible Execution Output</span>
              </div>
              {lastRunStats && (
                <div className="flex items-center gap-2 text-[11px] font-mono">
                  <span className="text-emerald-400">ok={lastRunStats.ok}</span>
                  <span className="text-amber-400">changed={lastRunStats.changed}</span>
                  <span className="text-rose-400">failed={lastRunStats.failed}</span>
                </div>
              )}
            </div>
            <div className="p-4 font-mono text-xs space-y-1 min-h-[220px] max-h-[350px] overflow-y-auto scrollbar-hide">
              {runLogs.length === 0 ? (
                <div className="py-12 text-center text-gray-500">
                  Ready to execute. Click <strong>Run Playbook</strong> to dispatch tasks to inventory hosts.
                </div>
              ) : (
                runLogs.map((log, idx) => (
                  <div 
                    key={idx}
                    className={
                      log.includes('PLAY [') ? 'text-blue-400 font-bold mt-2' :
                      log.includes('TASK [') ? 'text-amber-300 font-bold mt-2' :
                      log.includes('changed:') ? 'text-amber-400' :
                      log.includes('ok:') ? 'text-emerald-400' :
                      log.includes('failed:') ? 'text-rose-400 font-bold' :
                      log.includes('[SUCCESS]') ? 'text-emerald-400 font-bold mt-2' :
                      'text-gray-300'
                    }
                  >
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
