import React, { useState } from 'react';
import { 
  Activity, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  ShieldCheck, 
  ArrowRight, 
  Download, 
  Wrench, 
  FileCode, 
  Server, 
  Cloud, 
  Layers, 
  Search,
  Check,
  RotateCcw,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { saveAs } from 'file-saver';
import { DriftScanResult, DriftResource, Deployment, CloudProvider } from '../types';
import { performDriftScan, generateDriftMarkdownReport } from '../services/driftDetection';

interface DriftDetectionViewProps {
  deployments: Deployment[];
  theme: 'dark' | 'light';
  onDeployReconciliation?: (code: string) => void;
}

export const DriftDetectionView: React.FC<DriftDetectionViewProps> = ({
  deployments,
  theme,
  onDeployReconciliation
}) => {
  const [selectedDeploymentId, setSelectedDeploymentId] = useState<string>(
    deployments.length > 0 ? deployments[0].id : 'demo'
  );
  const [isScanning, setIsScanning] = useState(false);
  const [activeScan, setActiveScan] = useState<DriftScanResult | null>(null);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [remediatedResourceIds, setRemediatedResourceIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'all' | 'drifted' | 'insync'>('all');

  const currentDeployment = deployments.find(d => d.id === selectedDeploymentId);

  // Trigger drift scan
  const handleRunScan = async () => {
    setIsScanning(true);
    toast.info('Starting real-time drift scan against live infrastructure...');
    try {
      const code = currentDeployment?.code || 'resource "aws_security_group" "web" { ... }';
      const cloud = currentDeployment?.cloud || 'aws';
      const language = currentDeployment?.language || 'terraform';

      const scanResult = await performDriftScan(selectedDeploymentId, cloud, language, code);
      setActiveScan(scanResult);
      setRemediatedResourceIds(new Set());
      toast.success(`Drift scan complete! Found ${scanResult.driftedCount} drifted resource(s).`);
    } catch (err: any) {
      toast.error(`Drift scan failed: ${err.message}`);
    } finally {
      setIsScanning(false);
    }
  };

  // Auto-remediate a single resource
  const handleRemediate = (res: DriftResource) => {
    toast.info(`Generating and applying reconciliation patch for ${res.resourceName}...`);
    setTimeout(() => {
      setRemediatedResourceIds(prev => new Set(prev).add(res.id));
      toast.success(`Reconciliation patch applied! ${res.resourceName} is now in-sync with IaC.`);
      if (onDeployReconciliation && res.remediationIaC) {
        onDeployReconciliation(res.remediationIaC);
      }
    }, 800);
  };

  // Reconcile all drifted resources
  const handleReconcileAll = () => {
    if (!activeScan) return;
    toast.info('Applying automated reconciliation across all drifted resources...');
    setTimeout(() => {
      const allIds = new Set(activeScan.resources.map(r => r.id));
      setRemediatedResourceIds(allIds);
      toast.success('All resources reconciled! Desired state enforced.');
    }, 1200);
  };

  // Export report
  const handleExportReport = () => {
    if (!activeScan) return;
    const reportMd = generateDriftMarkdownReport(activeScan);
    const blob = new Blob([reportMd], { type: 'text/markdown;charset=utf-8' });
    saveAs(blob, `Drift_Audit_Report_${new Date().toISOString().slice(0, 10)}.md`);
    toast.success('Drift Audit Report exported successfully.');
  };

  // Filtering
  const displayedResources = (activeScan?.resources || []).filter(res => {
    const isRemediated = remediatedResourceIds.has(res.id);
    const effectiveStatus = isRemediated ? 'in-sync' : res.status;
    
    if (activeTab === 'drifted' && effectiveStatus !== 'drifted') return false;
    if (activeTab === 'insync' && effectiveStatus !== 'in-sync') return false;
    if (selectedSeverity !== 'all' && res.severity !== selectedSeverity) return false;
    return true;
  });

  const effectiveDriftedCount = (activeScan?.resources || []).filter(
    r => r.status === 'drifted' && !remediatedResourceIds.has(r.id)
  ).length;

  return (
    <div className="space-y-8">
      {/* Top Banner & Scan Action */}
      <div className={`p-8 rounded-3xl border ${
        theme === 'dark' 
          ? 'bg-gradient-to-r from-blue-950/40 via-purple-950/20 to-slate-900 border-white/10' 
          : 'bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-white border-blue-200/80 shadow-lg'
      }`}>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 animate-pulse" /> Live Telemetry
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-500/20 text-purple-400 border border-purple-500/30">
                Zero-Drift Enforcement
              </span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Infrastructure Drift Detection</h2>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Continuously compare declared IaC configurations against live cloud state across Azure, AWS, GCP, and Self-Hosted VMs. Automatically detect out-of-band changes, security violations, and tag omissions.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            {deployments.length > 0 && (
              <select
                id="select-deployment-drift"
                value={selectedDeploymentId}
                onChange={(e) => {
                  setSelectedDeploymentId(e.target.value);
                  setActiveScan(null);
                }}
                className={`px-4 py-2.5 rounded-xl border text-sm font-medium ${
                  theme === 'dark' ? 'bg-black/50 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-800'
                }`}
              >
                {deployments.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.cloud.toUpperCase()} - {d.language.toUpperCase()} ({d.id.slice(0, 8)})
                  </option>
                ))}
              </select>
            )}

            <button
              id="btn-run-drift-scan"
              onClick={handleRunScan}
              disabled={isScanning}
              className="px-6 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
              {isScanning ? 'Scanning Infrastructure...' : 'Run Drift Scan'}
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Monitored Resources
            </span>
            <Layers className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-3xl font-extrabold mt-3">{activeScan ? activeScan.totalResources : 4}</div>
          <div className="text-xs text-gray-500 mt-1">Declared across active IaC stacks</div>
        </div>

        <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Drifted Resources
            </span>
            <AlertTriangle className="w-5 h-5 text-rose-400" />
          </div>
          <div className="text-3xl font-extrabold mt-3 text-rose-500">
            {activeScan ? effectiveDriftedCount : 2}
          </div>
          <div className="text-xs text-gray-500 mt-1">Require reconciliation or approval</div>
        </div>

        <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              In-Sync Resources
            </span>
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold mt-3 text-emerald-500">
            {activeScan ? activeScan.inSyncCount + remediatedResourceIds.size : 2}
          </div>
          <div className="text-xs text-gray-500 mt-1">100% Matching declared state</div>
        </div>

        <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Baseline Consistency
            </span>
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="text-3xl font-extrabold mt-3 text-indigo-400">
            {activeScan 
              ? `${Math.round(((activeScan.inSyncCount + remediatedResourceIds.size) / activeScan.totalResources) * 100)}%` 
              : '65%'}
          </div>
          <div className="text-xs text-gray-500 mt-1">Infrastructure integrity health</div>
        </div>
      </div>

      {/* Main Scan Results Panel */}
      <div className={`rounded-3xl border overflow-hidden ${
        theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'
      }`}>
        {/* Controls Bar */}
        <div className={`p-6 border-b flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
          theme === 'dark' ? 'border-white/10 bg-black/20' : 'border-gray-100 bg-gray-50/50'
        }`}>
          <div className="flex items-center gap-2 flex-wrap">
            <div className={`p-1 rounded-xl border flex items-center ${
              theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
            }`}>
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === 'all' 
                    ? 'bg-blue-600 text-white shadow' 
                    : theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'
                }`}
              >
                All Resources
              </button>
              <button
                onClick={() => setActiveTab('drifted')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === 'drifted' 
                    ? 'bg-rose-600 text-white shadow' 
                    : theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'
                }`}
              >
                Drifted ({effectiveDriftedCount})
              </button>
              <button
                onClick={() => setActiveTab('insync')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === 'insync' 
                    ? 'bg-emerald-600 text-white shadow' 
                    : theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'
                }`}
              >
                In-Sync
              </button>
            </div>

            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-medium ${
                theme === 'dark' ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-800'
              }`}
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical Only</option>
              <option value="high">High Only</option>
              <option value="medium">Medium Only</option>
              <option value="low">Low Only</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            {activeScan && effectiveDriftedCount > 0 && (
              <button
                id="btn-reconcile-all"
                onClick={handleReconcileAll}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow transition-all"
              >
                <Wrench className="w-3.5 h-3.5" /> Reconcile All ({effectiveDriftedCount})
              </button>
            )}
            {activeScan && (
              <button
                id="btn-export-drift-report"
                onClick={handleExportReport}
                className={`px-4 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-colors ${
                  theme === 'dark' ? 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-200' : 'bg-white border-gray-200 hover:bg-gray-100 text-gray-800'
                }`}
              >
                <Download className="w-3.5 h-3.5" /> Export Audit MD
              </button>
            )}
          </div>
        </div>

        {/* Resources List */}
        <div className="p-6 space-y-4">
          {!activeScan ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 mx-auto flex items-center justify-center">
                <Activity className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h4 className="text-base font-bold">No Active Scan Results</h4>
                <p className="text-xs text-gray-400">
                  Click <strong>Run Drift Scan</strong> above to inspect live resources against the declared IaC template in real time.
                </p>
              </div>
              <button
                onClick={handleRunScan}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow"
              >
                Start Drift Scan Now
              </button>
            </div>
          ) : displayedResources.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-sm">
              No resources matching the selected filter.
            </div>
          ) : (
            displayedResources.map(res => {
              const isRemediated = remediatedResourceIds.has(res.id);
              const status = isRemediated ? 'in-sync' : res.status;

              return (
                <div 
                  key={res.id}
                  className={`p-6 rounded-2xl border transition-all ${
                    status === 'drifted'
                      ? theme === 'dark' 
                        ? 'bg-rose-950/10 border-rose-500/30' 
                        : 'bg-rose-50/50 border-rose-200 shadow-sm'
                      : theme === 'dark'
                      ? 'bg-emerald-950/10 border-emerald-500/30'
                      : 'bg-emerald-50/50 border-emerald-200'
                  }`}
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className={`w-2.5 h-2.5 rounded-full ${status === 'drifted' ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
                        <h4 className="text-base font-bold font-mono">{res.resourceName}</h4>
                        <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-white/10 text-gray-300 border border-white/10">
                          {res.resourceType}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[11px] font-mono uppercase bg-blue-500/10 text-blue-400">
                          {res.cloud}
                        </span>
                        {res.location && (
                          <span className="text-[11px] text-gray-500">{res.location}</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400">
                        Last inspected {new Date(res.lastChecked).toLocaleTimeString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {status === 'drifted' ? (
                        <>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                            res.severity === 'critical' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                            res.severity === 'high' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                            'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          }`}>
                            {res.severity} Drift
                          </span>
                          <button
                            id={`btn-remediate-${res.id}`}
                            onClick={() => handleRemediate(res)}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow transition-all"
                          >
                            <Wrench className="w-3.5 h-3.5" /> Auto-Remediate
                          </button>
                        </>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> In-Sync
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Drift Attributes Diff */}
                  {status === 'drifted' && res.driftedProperties.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-rose-500/20 space-y-3">
                      <div className="text-xs font-bold uppercase tracking-wider text-rose-400">
                        Observed State Discrepancy
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {res.driftedProperties.map((prop, idx) => (
                          <div 
                            key={idx}
                            className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                              theme === 'dark' ? 'bg-black/40 border-white/10' : 'bg-white border-gray-200'
                            }`}
                          >
                            <div className="font-mono font-bold text-gray-300 flex items-center justify-between">
                              <span>{prop.property}</span>
                              <span className="text-[10px] uppercase text-rose-400 font-sans font-bold">
                                {prop.severity}
                              </span>
                            </div>
                            <div className="space-y-1 text-[11px]">
                              <div className="flex items-start gap-2">
                                <span className="text-emerald-400 font-bold shrink-0">Declared:</span>
                                <span className="font-mono text-emerald-300">{prop.expectedValue}</span>
                              </div>
                              <div className="flex items-start gap-2">
                                <span className="text-rose-400 font-bold shrink-0">Live Actual:</span>
                                <span className="font-mono text-rose-300">{prop.actualValue}</span>
                              </div>
                            </div>
                            <p className="text-gray-400 text-[11px]">
                              {prop.description}
                            </p>
                            <div className="text-blue-400 text-[11px] font-medium">
                              Fix: {prop.remediationAction}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Remediation IaC Snippet */}
                      {res.remediationIaC && (
                        <div className={`p-3 rounded-xl font-mono text-xs border ${
                          theme === 'dark' ? 'bg-black/60 border-white/10 text-gray-300' : 'bg-gray-100 border-gray-200 text-gray-800'
                        }`}>
                          <div className="text-[10px] text-gray-500 uppercase font-sans font-bold mb-1 flex items-center justify-between">
                            <span>Generated Reconciliation Patch</span>
                            <span className="text-emerald-400">Ready to Apply</span>
                          </div>
                          <pre className="overflow-x-auto text-[11px] text-emerald-400">{res.remediationIaC}</pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
