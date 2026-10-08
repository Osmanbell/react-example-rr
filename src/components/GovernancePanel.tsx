import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Tag, 
  Eye, 
  ChevronDown, 
  ChevronUp, 
  FileCheck, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GovernanceReport, ComplianceCheck } from '../types';

interface GovernancePanelProps {
  report?: GovernanceReport;
  theme: 'dark' | 'light';
  language: string;
  cloud: string;
}

export const GovernancePanel: React.FC<GovernancePanelProps> = ({
  report,
  theme,
  language,
  cloud
}) => {
  const [expanded, setExpanded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (!report) return null;

  const categories = ['all', 'Data Protection & Encryption', 'Network Security', 'Access Control', 'Auditing & Logging', 'Resilience & Governance'];
  
  const filteredChecks = selectedCategory === 'all' 
    ? report.checks 
    : report.checks.filter(c => c.category === selectedCategory);

  const passedCount = report.checks.filter(c => c.status === 'passed').length;
  const warningCount = report.checks.filter(c => c.status === 'warning').length;
  const failedCount = report.checks.filter(c => c.status === 'failed').length;

  return (
    <div id="governance-compliance-panel" className={`p-6 rounded-2xl border transition-all ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-emerald-950/20 via-slate-900 to-black/60 border-emerald-500/30' 
        : 'bg-gradient-to-br from-emerald-50/50 via-white to-slate-50 border-emerald-300/80 shadow-md'
    }`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-7 h-7 text-emerald-500" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-bold">Enterprise Governance & Compliance Audit</h3>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                report.score >= 90 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                report.score >= 70 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}>
                {report.score}% Compliant
              </span>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-mono uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
                {cloud.toUpperCase()} • {language.toUpperCase()}
              </span>
            </div>
            <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Validated against CIS Benchmark v3.0, SOC 2 Type II, NIST SP 800-53, HIPAA, and PCI-DSS.
            </p>
          </div>
        </div>

        {/* Badges & Expand Button */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 text-xs">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> {passedCount} Passed
            </span>
            {warningCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-amber-500/10 text-amber-400 font-medium">
                <AlertTriangle className="w-3.5 h-3.5" /> {warningCount} Warn
              </span>
            )}
            {failedCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-rose-500/10 text-rose-400 font-medium">
                <XCircle className="w-3.5 h-3.5" /> {failedCount} Failed
              </span>
            )}
          </div>
          <button
            id="btn-toggle-governance-details"
            onClick={() => setExpanded(!expanded)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              theme === 'dark' ? 'bg-white/10 hover:bg-white/15 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
            }`}
          >
            {expanded ? (
              <>Less Details <ChevronUp className="w-3.5 h-3.5" /></>
            ) : (
              <>Inspect Rules <ChevronDown className="w-3.5 h-3.5" /></>
            )}
          </button>
        </div>
      </div>

      {/* Compliance Highlights Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-emerald-500/10">
        <div className={`p-2.5 rounded-xl ${theme === 'dark' ? 'bg-white/5' : 'bg-white'} border border-emerald-500/10 flex items-center gap-2.5`}>
          <Lock className="w-4 h-4 text-emerald-500 shrink-0" />
          <div>
            <div className="text-[11px] font-semibold text-emerald-500">Encryption at Rest</div>
            <div className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {report.encryptionVerified ? 'KMS / CMK Active' : 'Standard Provider'}
            </div>
          </div>
        </div>

        <div className={`p-2.5 rounded-xl ${theme === 'dark' ? 'bg-white/5' : 'bg-white'} border border-emerald-500/10 flex items-center gap-2.5`}>
          <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0" />
          <div>
            <div className="text-[11px] font-semibold text-blue-500">Zero-Trust Network</div>
            <div className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {report.networkIsolated ? 'Zero 0.0.0.0/0 SSH' : 'Perimeter Warning'}
            </div>
          </div>
        </div>

        <div className={`p-2.5 rounded-xl ${theme === 'dark' ? 'bg-white/5' : 'bg-white'} border border-emerald-500/10 flex items-center gap-2.5`}>
          <Tag className="w-4 h-4 text-purple-500 shrink-0" />
          <div>
            <div className="text-[11px] font-semibold text-purple-500">Corporate Tagging</div>
            <div className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              7 Enforced Labels
            </div>
          </div>
        </div>

        <div className={`p-2.5 rounded-xl ${theme === 'dark' ? 'bg-white/5' : 'bg-white'} border border-emerald-500/10 flex items-center gap-2.5`}>
          <FileCheck className="w-4 h-4 text-amber-500 shrink-0" />
          <div>
            <div className="text-[11px] font-semibold text-amber-500">Audit Logging</div>
            <div className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {report.auditLoggingEnabled ? '>= 365d Retention' : 'Diagnostic Sinks'}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Rule Inspector */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-emerald-500/20 space-y-3 overflow-hidden"
          >
            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : theme === 'dark'
                      ? 'bg-white/5 text-gray-400 hover:bg-white/10'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat === 'all' ? 'All Rules' : cat}
                </button>
              ))}
            </div>

            {/* Checks list */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {filteredChecks.map(check => (
                <div 
                  key={check.id}
                  className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs ${
                    check.status === 'passed' 
                      ? theme === 'dark' ? 'bg-emerald-950/20 border-emerald-500/20 text-gray-200' : 'bg-emerald-50/50 border-emerald-200 text-gray-800'
                      : check.status === 'warning'
                      ? theme === 'dark' ? 'bg-amber-950/20 border-amber-500/20 text-gray-200' : 'bg-amber-50/50 border-amber-200 text-gray-800'
                      : theme === 'dark' ? 'bg-rose-950/20 border-rose-500/20 text-gray-200' : 'bg-rose-50/50 border-rose-200 text-gray-800'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded font-bold ${
                        check.framework === 'CIS' ? 'bg-blue-500/20 text-blue-400' :
                        check.framework === 'SOC2' ? 'bg-purple-500/20 text-purple-400' :
                        check.framework === 'NIST' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {check.framework}
                      </span>
                      <span className="font-semibold">{check.rule}</span>
                    </div>
                    <p className={`text-[11px] ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {check.description}
                    </p>
                    {check.remediation && (
                      <p className="text-[11px] text-amber-400 mt-1 font-mono">
                        Fix: {check.remediation}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0 flex items-center gap-1.5 self-start sm:self-center">
                    {check.status === 'passed' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Passed
                      </span>
                    ) : check.status === 'warning' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-semibold text-[11px]">
                        <AlertTriangle className="w-3.5 h-3.5" /> Warning
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 font-semibold text-[11px]">
                        <XCircle className="w-3.5 h-3.5" /> Failed
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Enforced Tags Footnote */}
            <div className={`p-2.5 rounded-xl border text-[11px] ${
              theme === 'dark' ? 'bg-black/30 border-white/5 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-600'
            }`}>
              <div className="font-semibold text-gray-300 mb-1 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-purple-400" /> Mandatory Corporate Governance Tags Injected:
              </div>
              <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
                {Object.entries(report.tagsApplied || {}).map(([k, v]) => (
                  <span key={k} className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-gray-300">
                    {k}: <span className="text-emerald-400">{v}</span>
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
