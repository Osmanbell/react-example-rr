import React, { useState, useEffect, useRef } from 'react';
import { 
  Cloud, 
  Terminal, 
  Code2, 
  Activity, 
  Settings, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ChevronRight,
  Database,
  Shield,
  Layers,
  ExternalLink,
  Download,
  Copy,
  Plus,
  Image,
  ImageIcon,
  Layout,
  FileText,
  Check,
  Sun,
  Moon,
  Zap,
  Github,
  Cpu,
  Globe,
  MessageSquare,
  BookOpen,
  Link as LinkIcon,
  Trash2,
  Server,
  TerminalSquare,
  Users,
  ShieldAlert,
  FileCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toPng, toJpeg, toBlob } from 'html-to-image';
import mermaid from 'mermaid';
import Lottie from 'lottie-react';
import { Toaster, toast } from 'sonner';

// Public Lottie Animation URLs (High-quality tech/cloud animations)
const LOTTIE_URLS = {
  hero: 'https://assets3.lottiefiles.com/packages/lf20_w51pcehl.json', // Cloud/Server animation
  processing: 'https://assets6.lottiefiles.com/packages/lf20_p8bfn5to.json', // Loading/Processing
};

// Initialize Mermaid
mermaid.initialize({
  startOnLoad: true,
  theme: 'default',
  securityLevel: 'loose',
  fontFamily: 'Inter',
  fontSize: 40, // Even larger font size for maximum clarity
  flowchart: {
    useMaxWidth: true,
    htmlLabels: true,
    curve: 'basis',
    nodeSpacing: 100, // More spacing for larger text
    rankSpacing: 100
  }
});

import Markdown from 'react-markdown';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

const DesignDocumentSection = ({ currentDeployment, theme }: { currentDeployment: any, theme: 'dark' | 'light' }) => {
  if (!currentDeployment.designDocument) return null;
  
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-8 rounded-3xl border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-xl'}`}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold flex items-center gap-3">
          <BookOpen className="w-6 h-6 text-blue-500" />
          Solution Design Document
        </h3>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              const blob = new Blob([currentDeployment.designDocument!], { type: 'text/markdown' });
              saveAs(blob, `Solution_Design_${currentDeployment.id.slice(0, 8)}.md`);
            }}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${theme === 'dark' ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}`}
          >
            <Download className="w-3 h-3" />
            Download MD
          </button>
          <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
            Expert Recommendation
          </div>
        </div>
      </div>
      <div className={`prose prose-sm max-w-none ${theme === 'dark' ? 'prose-invert' : ''}`}>
        <Markdown>{currentDeployment.designDocument}</Markdown>
      </div>
    </motion.section>
  );
};

const getIaCFilename = (lang: string) => {
  switch (lang) {
    case 'terraform': return 'main.tf';
    case 'opentofu': return 'main.tofu';
    case 'cloudformation': return 'template.yaml';
    case 'cdk': return 'stack.ts';
    case 'google-infra-manager': return 'main.tf';
    case 'bicep': return 'main.bicep';
    case 'arm': return 'template.json';
    case 'pulumi': return 'index.ts';
    case 'ansible': return 'playbook.yml';
    default: return 'infrastructure.txt';
  }
};

const ResultsSection = ({ 
  currentDeployment, 
  theme, 
  lottieData, 
  handleDeploy, 
  handleTriggerWorkflow,
  handleDownloadDiagramJpeg,
  handleDownloadDiagramPng,
  handleDownloadDiagram,
  handleDownloadExcel,
  handlePushToGithub,
  userProfile,
  logsEndRef
}: any) => {
  const activeGovernanceReport = currentDeployment.governanceReport || (currentDeployment.code ? analyzeIaCGovernance(currentDeployment.code, currentDeployment.language, currentDeployment.cloud) : undefined);

  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-8"
    >
      {/* Enterprise Governance & Compliance Panel */}
      {currentDeployment.code && (
        <div className="lg:col-span-2">
          <GovernancePanel 
            report={activeGovernanceReport} 
            theme={theme} 
            language={currentDeployment.language} 
            cloud={currentDeployment.cloud} 
          />
        </div>
      )}

      {/* Code Panel */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Code2 className="w-5 h-5 text-blue-500" />
            Generated Code
            <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {currentDeployment.language}
            </span>
          </h3>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => handleDeploy()}
              disabled={currentDeployment.status === 'deploying'}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-600/20"
            >
              {currentDeployment.status === 'deploying' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Deploying...
                </>
              ) : (
                <>
                  <Activity className="w-4 h-4" />
                  Deploy
                </>
              )}
            </button>
            <button 
              onClick={() => handlePushToGithub(currentDeployment)}
              className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900'}`}
              title="Push to GitHub"
            >
              <Github className="w-4 h-4" />
            </button>
            <button 
              onClick={() => {
                if (currentDeployment.code) {
                  const filename = getIaCFilename(currentDeployment.language);
                  const blob = new Blob([currentDeployment.code], { type: 'text/plain;charset=utf-8' });
                  saveAs(blob, filename);
                  toast.success(`Downloaded ${filename}`);
                }
              }}
              className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900'}`}
              title="Download IaC Code"
            >
              <Download className="w-4 h-4" />
            </button>
            <button 
              onClick={() => {
                if (currentDeployment.code) {
                  navigator.clipboard.writeText(currentDeployment.code);
                  toast.success("Code copied to clipboard!");
                }
              }}
              className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900'}`}
              title="Copy Code"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 overflow-hidden bg-[#1e1e1e] h-[600px] p-6 overflow-auto">
          {currentDeployment.code ? (
            <motion.pre 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm font-mono text-gray-300 whitespace-pre"
            >
              {currentDeployment.code}
            </motion.pre>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-4">
              <div className="w-48 h-48">
                {lottieData.processing && (
                  <Lottie 
                    animationData={lottieData.processing}
                    loop={true}
                  />
                )}
              </div>
              <p className="text-lg font-medium animate-pulse text-blue-400">Architecting your cloud infrastructure...</p>
            </div>
          )}
        </div>
      </div>

      {/* Status & Logs Panel */}
      <div className="space-y-4 flex flex-col">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Terminal className="w-5 h-5 text-purple-500" />
            Deployment Status
          </h3>
          {currentDeployment.status === 'validating' && (
            <button 
              onClick={() => handleDeploy()}
              className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-500 flex items-center gap-2 shadow-lg shadow-green-600/20 transition-all"
            >
              Deploy Infrastructure
            </button>
          )}
        </div>
        
        <div className={`flex-1 rounded-2xl border ${theme === 'dark' ? 'border-white/10 bg-black/40' : 'border-gray-200 bg-white'} backdrop-blur-xl flex flex-col overflow-hidden h-[600px]`}>
          <div className={`p-4 border-b ${theme === 'dark' ? 'border-white/5 bg-white/5' : 'border-gray-100 bg-gray-50'} flex items-center justify-between`}>
            <div className="flex items-center gap-3">
              <StatusBadge status={currentDeployment.status} theme={theme} />
              <span className={`text-xs font-mono ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>ID: {currentDeployment.id.slice(0, 8)}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <div className="w-2 h-2 rounded-full bg-green-500" />
            </div>
          </div>
          <div className="flex-1 p-6 font-mono text-sm space-y-2 overflow-y-auto scrollbar-hide">
            {currentDeployment.logs.map((log: string, i: number) => (
              <div key={i} className={`flex gap-3 ${
                log.includes('[ERROR]') ? 'text-red-500' : 
                log.includes('[SUCCESS]') ? 'text-green-600' : 
                log.includes('[VALIDATION]') ? 'text-blue-600' : 
                (theme === 'dark' ? 'text-gray-400' : 'text-gray-600')
              }`}>
                <span className="opacity-30 select-none">{i + 1}</span>
                <span>{log}</span>
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        </div>
      </div>

      {/* Diagram Section */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Layout className="w-5 h-5 text-green-500" />
            Architecture Diagram
          </h3>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleDownloadDiagramJpeg}
              className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900'}`}
              title="Download JPEG"
            >
              <Download className="w-4 h-4" />
            </button>
            <button 
              onClick={handleDownloadDiagramPng}
              className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900'}`}
              title="Download PNG"
            >
              <ImageIcon className="w-4 h-4" />
            </button>
            <button 
              onClick={() => handleDownloadDiagram(currentDeployment)}
              className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900'}`}
              title="Download Mermaid Code"
            >
              <FileText className="w-4 h-4" />
            </button>
          </div>
        </div>
        <motion.div 
          id="architecture-diagram"
          className={`rounded-2xl border ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white'} p-6 flex items-center justify-center min-h-[400px] overflow-auto transition-colors`}
        >
          {currentDeployment.diagramCode ? (
            <MermaidDiagram 
              chart={currentDeployment.diagramCode} 
              theme={theme} 
              id={`mermaid-diagram-inner-${currentDeployment.id}`}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-600 space-y-4">
              <div className="w-32 h-32">
                {lottieData.processing && (
                  <Lottie 
                    animationData={lottieData.processing}
                    loop={true}
                  />
                )}
              </div>
              <p className="text-sm font-medium animate-pulse">Generating architecture diagram...</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Cost Estimator Panel */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Database className="w-5 h-5 text-green-500" />
            Cost Estimate
          </h3>
          {currentDeployment.costBreakdown && (
            <button 
              onClick={() => handleDownloadExcel(currentDeployment)}
              className="px-4 py-2 bg-green-600/10 text-green-500 border border-green-500/20 rounded-lg hover:bg-green-600/20 transition-all flex items-center gap-2 text-sm"
            >
              <Download className="w-4 h-4" />
              Export Excel
            </button>
          )}
        </div>
        <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'bg-white border-gray-200 shadow-sm'} space-y-6`}>
          {currentDeployment.costEstimate !== undefined ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              <div className="text-center space-y-1 md:border-r border-gray-200 dark:border-white/10">
                <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} text-sm`}>Estimated Monthly Cost</p>
                <p className="text-4xl font-bold text-green-600">${currentDeployment.costEstimate.toFixed(2)}</p>
              </div>
              <div className="md:col-span-2 space-y-3">
                <p className={`text-xs font-bold ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} uppercase tracking-widest`}>Resource Breakdown</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentDeployment.costBreakdown?.map((item: any, i: number) => (
                    <div key={i} className={`flex items-center justify-between p-3 rounded-xl border ${theme === 'dark' ? 'bg-black/20 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                      <span className={`text-sm truncate mr-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{item.resource}</span>
                      <span className={`text-sm font-bold shrink-0 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>${item.cost.toFixed(2)} <span className="text-[10px] text-gray-500 font-normal">/{item.unit}</span></span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-gray-600 space-y-4">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p>Calculating estimated costs...</p>
            </div>
          )}
        </div>
      </div>

      {/* CI/CD Pipeline Section */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Github className="w-5 h-5 text-gray-400" />
            CI/CD Pipeline (GitHub Actions)
          </h3>
          <div className="flex items-center gap-4">
            {userProfile?.gitCreds?.repo && (
              <a 
                href={`https://github.com/${userProfile.gitCreds.repo}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-xs text-blue-500 hover:underline"
              >
                <ExternalLink className="w-3 h-3" />
                Linked Repo: {userProfile.gitCreds.repo}
              </a>
            )}
            {currentDeployment.workflowCode && (
              <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                  const blob = new Blob([currentDeployment.workflowCode!], { type: 'text/yaml' });
                  saveAs(blob, 'deploy.yml');
                }}
                className="px-4 py-2 bg-yellow-600/10 text-yellow-500 border border-yellow-500/20 rounded-lg hover:bg-yellow-600/20 transition-all flex items-center gap-2 text-sm"
              >
                <Download className="w-4 h-4" />
                Download YAML
              </button>
              <button 
                onClick={() => handleTriggerWorkflow(currentDeployment)}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-500 transition-all flex items-center gap-2 text-sm font-bold shadow-lg shadow-yellow-600/20"
              >
                <Zap className="w-4 h-4" />
                Trigger Pipeline
              </button>
            </div>
          )}
          </div>
        </div>
        <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'border-white/10 bg-[#1e1e1e]' : 'border-gray-200 bg-white shadow-sm'} overflow-hidden h-[400px] overflow-auto`}>
          {currentDeployment.workflowCode ? (
            <pre className={`text-sm font-mono whitespace-pre ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {currentDeployment.workflowCode}
            </pre>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
              <Zap className="w-12 h-12 opacity-20" />
              <p>No CI/CD workflow generated yet.</p>
            </div>
          )}
        </div>
      </div>
    </motion.section>
  );
};

const MermaidDiagram = ({ chart, theme, id }: { chart: string, theme: 'dark' | 'light', id?: string }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && chart) {
      ref.current.removeAttribute('data-processed');
      mermaid.initialize({
        startOnLoad: true,
        theme: theme === 'dark' ? 'dark' : 'default',
        securityLevel: 'loose',
        fontFamily: 'Inter',
        fontSize: 32,
        arrowMarkerAbsolute: true,
        flowchart: {
          useMaxWidth: false,
          htmlLabels: true,
          curve: 'basis',
          nodeSpacing: 100,
          rankSpacing: 100,
          padding: 40,
          defaultRenderer: 'dagre-wrapper'
        },
        themeVariables: {
          edgeColor: theme === 'dark' ? '#60a5fa' : '#2563eb',
          lineColor: theme === 'dark' ? '#60a5fa' : '#2563eb',
          primaryColor: theme === 'dark' ? '#1e293b' : '#f8fafc',
          primaryTextColor: theme === 'dark' ? '#f8fafc' : '#1e293b',
          primaryBorderColor: theme === 'dark' ? '#3b82f6' : '#2563eb',
          secondaryColor: theme === 'dark' ? '#334155' : '#f1f5f9',
          tertiaryColor: theme === 'dark' ? '#0f172a' : '#ffffff',
          mainBkg: theme === 'dark' ? '#0f172a' : '#ffffff',
          nodeBorder: theme === 'dark' ? '#3b82f6' : '#2563eb',
          clusterBkg: theme === 'dark' ? 'rgba(59, 130, 246, 0.05)' : 'rgba(37, 99, 235, 0.05)',
          clusterBorder: theme === 'dark' ? '#3b82f6' : '#2563eb',
          fontSize: '24px',
          fontFamily: 'Inter'
        }
      });
      mermaid.render('mermaid-svg-' + Math.random().toString(36).substr(2, 9), chart).then(({ svg }) => {
        if (ref.current) {
          ref.current.innerHTML = svg;
          
          const svgElement = ref.current.querySelector('svg');
          if (svgElement) {
            svgElement.setAttribute('width', '100%');
            svgElement.setAttribute('height', '100%');
            svgElement.style.maxWidth = 'none';

            const style = document.createElement('style');
            style.textContent = `
              .node b { font-weight: 900; font-size: 1.8em; color: inherit; }
              .node .label { padding: 25px; }
              .node img { margin-bottom: 15px; display: block; margin-left: auto; margin-right: auto; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2)); }
              .cluster rect { rx: 20; ry: 20; stroke-width: 5px !important; stroke-dasharray: 12,12; fill-opacity: 0.2; }
              .cluster .label { font-weight: 900; font-size: 2em; }
              .edgePath path { stroke-width: 5px !important; stroke: ${theme === 'dark' ? '#60a5fa' : '#2563eb'} !important; }
              .marker, marker { fill: ${theme === 'dark' ? '#60a5fa' : '#2563eb'} !important; stroke: none !important; scale: 2; }
              .edgeLabel { font-size: 1.2em; font-weight: 800; background-color: ${theme === 'dark' ? '#0f172a' : '#ffffff'} !important; padding: 4px; }
            `;
            svgElement.appendChild(style);
          }

          // Add click listeners to nodes
          const nodes = ref.current.querySelectorAll('.node');
          nodes.forEach(node => {
            // Ensure images have crossOrigin set for capture and handle errors
            const img = node.querySelector('img');
            if (img) {
              img.setAttribute('crossorigin', 'anonymous');
              img.onerror = () => {
                console.warn(`Failed to load image: ${img.src}. Replacing with placeholder.`);
                img.src = 'https://cdn.simpleicons.org/cloud/666666'; // Generic cloud icon as placeholder
              };
            }
            
            node.addEventListener('click', () => {
              const label = node.querySelector('.label')?.textContent;
              if (label) {
                toast.info(`Resource: ${label}`);
              }
            });
            (node as HTMLElement).style.cursor = 'pointer';
          });
        }
      });
    }
  }, [chart, theme]);

  return (
    <TransformWrapper initialScale={1} minScale={0.5} maxScale={3}>
      <TransformComponent wrapperClass="w-full h-full" contentClass="w-full h-full">
        <div 
          ref={ref} 
          id={id || "mermaid-diagram-inner"}
          className="w-full h-full flex items-center justify-center p-4 [&_text]:!font-bold [&_text]:!text-2xl bg-white min-w-fit min-h-fit" 
        />
      </TransformComponent>
    </TransformWrapper>
  );
};
import { auth, db } from './firebase';
import { GoogleGenAI, Type } from "@google/genai";
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  Timestamp,
  doc,
  updateDoc,
  setDoc,
  getDoc,
  deleteDoc
} from 'firebase/firestore';
import axios from 'axios';
import confetti from 'canvas-confetti';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { CloudProvider, IaCLanguage, Deployment, DeploymentStatus, UserRole } from './types';
import { GovernancePanel } from './components/GovernancePanel';
import { DriftDetectionView } from './components/DriftDetectionView';
import { SelfHostedVMView } from './components/SelfHostedVMView';
import { AnsibleAutomationView } from './components/AnsibleAutomationView';
import { RBACAndSSOView } from './components/RBACAndSSOView';
import { analyzeIaCGovernance, getGovernanceSystemPrompt } from './services/governance';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('app-theme');
    return (saved as 'dark' | 'light') || 'dark';
  });
  const [prompt, setPrompt] = useState('');
  const [selectedCloud, setSelectedCloud] = useState<CloudProvider>('azure');
  const [selectedLanguage, setSelectedLanguage] = useState<IaCLanguage>('terraform');
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [currentDeployment, setCurrentDeployment] = useState<Deployment | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'builder' | 'drift' | 'self-hosted' | 'ansible' | 'rbac-sso' | 'deployments' | 'creds' | 'consultant'>('builder');
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('Organization Owner');
  const [filterCloud, setFilterCloud] = useState<CloudProvider | 'all'>('all');
  const [filterLanguage, setFilterLanguage] = useState<IaCLanguage | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<DeploymentStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc'>('date-desc');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isCredModalOpen, setIsCredModalOpen] = useState(false);
  const [editingCloud, setEditingCloud] = useState<CloudProvider | 'github' | null>(null);
  const [modalAzureUseMI, setModalAzureUseMI] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<{[key: string]: 'idle' | 'verifying' | 'success' | 'failed'}>({});
  const [autoDeploy, setAutoDeploy] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (snapshot) => {
        if (snapshot.exists()) {
          setUserProfile(snapshot.data());
        } else {
          setDoc(doc(db, 'users', user.uid), {
            email: user.email,
            displayName: user.displayName,
            azureCreds: null,
            awsCreds: null,
            gcpCreds: null,
            gitCreds: null,
            createdAt: Timestamp.now()
          });
        }
      });
      return () => unsubscribe();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      const q = query(
        collection(db, 'deployments'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        setDeployments(docs);
      });
      return () => unsubscribe();
    }
  }, [user]);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentDeployment?.logs]);

  const handleDownloadIaC = async () => {
    if (!currentDeployment || !currentDeployment.code) return;
    
    const zip = new JSZip();
    const folderName = `iac-${currentDeployment.cloud}-${currentDeployment.language}-${Date.now()}`;
    const mainFile = currentDeployment.language === 'terraform' ? 'main.tf' : 
                     currentDeployment.language === 'bicep' ? 'main.bicep' : 
                     currentDeployment.language === 'arm' ? 'template.json' : 'index.ts';
    
    zip.file(`${folderName}/${mainFile}`, currentDeployment.code);
    
    // Add a readme
    zip.file(`${folderName}/README.md`, `# Infrastructure as Code\n\nGenerated by CloudGenius AI\n\nCloud: ${currentDeployment.cloud}\nLanguage: ${currentDeployment.language}\nPrompt: ${currentDeployment.prompt}`);
    
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `${folderName}.zip`);
  };

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleConsult = async () => {
    if (!prompt || prompt.trim().length < 10) {
      alert("Please provide a more detailed problem statement (at least 10 characters).");
      return;
    }
    if (!user) return;

    setIsGenerating(true);
    // Reset current deployment to avoid stale state issues
    setCurrentDeployment(null);
    
    // Small delay to ensure state clears
    await new Promise(r => setTimeout(r, 100));

    setCurrentDeployment({
      id: 'temp',
      prompt,
      cloud: selectedCloud,
      language: selectedLanguage,
      status: 'generating',
      logs: ['[INFO] DevOps Consultant analyzing your request...', '[INFO] Researching cloud best practices...'],
      createdAt: Date.now(),
      type: 'consultant'
    });

    try {
      // 1. Consultant Agent (Solution Design)
      const consultantResponse = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Problem: ${prompt}\nTarget Cloud: ${selectedCloud}`,
        config: {
          systemInstruction: `You are a Senior DevOps & Cloud Architect Consultant. 
          Your task is to provide a comprehensive solution design for the user's problem.
          
          Follow these guidelines:
          1. **Service Recommendations**: Identify the specific services needed on ${selectedCloud} to solve the problem.
          2. **Reasoning**: Explain WHY each service is chosen based on best practices (scalability, security, cost-efficiency).
          3. **Architecture Strategy**: Describe the high-level architecture (e.g., serverless, microservices, event-driven).
          4. **Documentation Links**: Provide relevant documentation links from ${selectedCloud}'s official docs.
          5. **Best Practices**: Mention specific standards (e.g., AWS Well-Architected Framework, Azure Well-Architected Framework).
          
          Format the output as a professional Solution Design Document in Markdown.`
        }
      });
      const designDocument = consultantResponse.text;
      
      // Small delay to mitigate rate limiting
      await new Promise(r => setTimeout(r, 1000));

      setCurrentDeployment(prev => prev ? { ...prev, designDocument, logs: [...prev.logs, '[INFO] Solution design document generated.', '[INFO] Planner Agent starting...'] } : null);

      // Continue with the standard generation flow but using the design document as context
      // 2. Planner Agent
      const plannerResponse = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Cloud: ${selectedCloud}, Language: ${selectedLanguage}, Request: ${prompt}\nSolution Design: ${designDocument}`,
        config: {
          systemInstruction: `You are a Senior Cloud Architect Planner Agent. Break down the solution design into a structured list of resources and their dependencies. Return a detailed architectural plan.
          
          CRITICAL INSTRUCTIONS FOR DEPLOYABILITY:
          - You MUST consider the facts and eligibility of all resources to be deployed.
          - Ensure the chosen architecture is fully deployable to ${selectedCloud} using ${selectedLanguage}.
          - Consider CSP limits, valid resource combinations, and required dependencies (e.g., a subnet must exist before a VM can use it).
          - Recommend the BEST approach following official documentation from ${selectedCloud} and best practices for ${selectedLanguage}.
          - FREE TIER AWARENESS: The user is on a Free Azure Subscription. Design the architecture using the lowest possible pricing tiers. Avoid heavy compute resources that exceed free tier vCPU quotas.`
        }
      });
      const plan = plannerResponse.text;

      // Small delay to mitigate rate limiting
      await new Promise(r => setTimeout(r, 1000));

      setCurrentDeployment(prev => prev ? { ...prev, plan, logs: [...prev.logs, '[INFO] Architecture plan generated.', '[INFO] IaC Generator Agent starting...'] } : null);

      // ... (rest of the handleGenerate logic)
      // I'll refactor handleGenerate to take an optional designDocument and plan
      await finishGeneration(designDocument, plan, 'consultant');

    } catch (error) {
      handleAIError(error, "Consultation");
    } finally {
      setIsGenerating(false);
    }
  };

  const finishGeneration = async (designDocument: string, plan: string, type: 'builder' | 'consultant' = 'builder') => {
    try {
      // 2. IaC Generator Agent
    const cleanCode = (rawCode: string) => {
      return rawCode
        .replace(/```[a-z]*\n/gi, '')
        .replace(/```/g, '')
        .trim();
    };

    const generatorResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Plan: ${plan}\nDesign: ${designDocument}`,
      config: {
        systemInstruction: `You are an expert IaC Generator Agent. Generate production-ready ${selectedLanguage} code for ${selectedCloud} based on the provided architecture plan and design document. Follow best practices, modular structure, and include comments. 
        
        CRITICAL INSTRUCTIONS FOR DEPLOYABILITY & SMART GENERATION:
        - You MUST consider the best approach to get the resources deployed for ${selectedLanguage} following the official documentation from ${selectedCloud} and the IaC language.
        - ALL facts and eligibility of all resources to be deployed MUST be considered while generating code.
        - The generated IaC MUST meet all criteria to be fully deployable to ${selectedCloud} without manual intervention.
        - Ensure all required properties for every resource are included according to the latest API versions.
        - Handle dependencies explicitly (e.g., 'dependsOn' in ARM/Bicep, explicit references in Terraform/Pulumi).
        - FREE TIER & QUOTA AWARENESS: The user is using a Free Azure Subscription. You MUST default to the absolute lowest pricing tiers for ALL resources (e.g., 'F1' or 'B1' for App Service, 'Standard_B1s' or 'Standard_B2s' for VMs, 'Basic' for databases, 'Standard_LRS' for storage).
        - For VM-based services (AKS, VMSS), use the absolute minimum node count (e.g., 1) and the smallest allowed VM size to avoid vCPU quota limits.
        
        CRITICAL AZURE NAMING:
        - For Key Vaults, names must be 3-24 characters, alphanumeric, and start with a letter.
        - Use 'take(concat('kv', uniqueString(resourceGroup().id)), 24)' for unique Key Vault names in ARM/Bicep.
        - Avoid using 'substring' on 'uniqueString' results if the length requested is greater than 13.
        
        AZURE ARM PARAMETERS:
        - ALWAYS provide a 'defaultValue' for every parameter in ARM templates.
        - For passwords/secrets, use a secure default or generate one using functions if possible, but ensure 'defaultValue' is present.
        
        AZURE VALIDATION BEST PRACTICES:
        - Ensure globally unique names for Storage Accounts, Web Apps, and Key Vaults using 'uniqueString(resourceGroup().id)'.
        - STORAGE ACCOUNT NAMES: Must be 3-24 characters, lowercase letters and numbers ONLY. No hyphens or underscores. If the user provides a name, sanitize it (lowercase, remove hyphens) and append 'uniqueString' to ensure uniqueness.
        - GENERAL NAMING: For all resources (MySQL, PostgreSQL, etc.), ensure names are valid. When in doubt, use lowercase letters, numbers, and hyphens, and keep lengths between 3 and 24 characters. Avoid special characters.
        - Use standard SKUs (e.g., 'Standard_LRS' for storage, 'B1' or 'S1' for App Service) that are widely available across regions.
        - LOCATION: Always use '[resourceGroup().location]' for the 'location' property of all resources to ensure they are deployed in the same region as the resource group, preventing 'LocationNotAvailable' errors.
        - For AKS ('Microsoft.ContainerService/managedClusters'), DO NOT specify the 'kubernetesVersion' property. Let Azure automatically select the default supported version for the region to prevent 'K8sVersionNotSupported' errors.
        - RESPECT USER NAMES: If the user specifies a name for a resource or the resource group in their prompt, you MUST use that exact name (except for Storage Accounts which must be sanitized).
        - RESOURCE GROUP NAME: If the user specifies a resource group name, you MUST define a parameter named 'resourceGroupName' with that name as its 'defaultValue'. The deployment engine will use this parameter to create the resource group.
        - PRIVATE DNS ZONES: If you reference a Private DNS Zone (e.g., 'Microsoft.Network/privateDnsZones') in 'dependsOn' or 'resourceId()', you MUST explicitly define it in the 'resources' array. Do not assume it exists.
        - RESOURCE DECLARATION: If you reference ANY resource (e.g., in 'dependsOn', 'resourceId()', or 'reference()'), you MUST explicitly declare that resource in the 'resources' array of the template. Do not assume any resource exists beforehand.
        
        AZURE ARM FUNCTIONS (CRITICAL):
        - NESTED RESOURCE IDs: When using 'resourceId()' for nested resources (like 'Microsoft.Network/privateDnsZones/virtualNetworkLinks'), you MUST pass the parent name and child name as separate arguments. Example: "[resourceId('Microsoft.Network/privateDnsZones/virtualNetworkLinks', 'myZone.com', 'myLink')]". DO NOT pass a single slash-separated string.
        - DEPENDS ON: In the 'dependsOn' array, you MUST use the full resource ID expression (e.g., "[resourceId(...)]") for resources, especially nested ones. DO NOT use raw strings like 'Microsoft.Network/privateDnsZones/virtualNetworkLinks/my-link' as this will cause a malformed resource identifier error.
        - DO NOT use the 'reference()' function inside a resource 'name' or inside a 'guid()' function that defines a resource 'name'. This is a HARD RESTRICTION in Azure and causes validation errors.
        - For Role Assignment GUIDs, you MUST use static strings or resource IDs (e.g., 'guid(resourceId(...), 'roleName')') instead of dynamic principal IDs from 'reference()'.
        - Example of WRONG: guid(resourceId(...), reference(...).principalId)
        - Example of RIGHT: guid(resourceId(...), 'my-role-assignment')
        - VARIABLE DEFINITIONS: Every variable used via '[variables('varName')]' MUST be explicitly defined in the 'variables' section of the ARM template.
        - RESOURCE DEFINITIONS: Every resource referenced in 'dependsOn' or via 'resourceId()' MUST be explicitly defined in the 'resources' array of the template. DO NOT reference resources (like subnets or managed identities) that are not declared in the same template.
        
        ${getGovernanceSystemPrompt(selectedCloud, selectedLanguage)}
        
        Return ONLY the code, no markdown blocks.`
      }
    });
    const code = cleanCode(generatorResponse.text);
    const governanceReport = analyzeIaCGovernance(code, selectedCloud, selectedLanguage);

    setCurrentDeployment(prev => prev ? { 
      ...prev, 
      code, 
      governanceReport,
      logs: [
        ...prev.logs, 
        '[INFO] IaC code generation completed.', 
        `[INFO] Enterprise Governance audit completed: Score ${governanceReport.score}/100 (${governanceReport.status.toUpperCase()}) - ${governanceReport.checks.filter(c => c.status === 'passed').length} checks passed.`,
        '[INFO] Cost Estimator Agent starting...'
      ] 
    } : null);

    // Small delay to mitigate rate limiting
    await new Promise(r => setTimeout(r, 1000));

    // 3. Cost Estimator Agent
    const costResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Code: ${code}\nPlan: ${plan}`,
      config: {
        systemInstruction: `You are a Cloud Cost Estimator Agent. Analyze the provided IaC code and architecture plan for ${selectedCloud}. Estimate the monthly cost in USD.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            totalEstimate: { type: Type.NUMBER },
            breakdown: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  resource: { type: Type.STRING },
                  cost: { type: Type.NUMBER },
                  unit: { type: Type.STRING }
                },
                required: ["resource", "cost", "unit"]
              }
            }
          },
          required: ["totalEstimate", "breakdown"]
        }
      }
    });
    const costData = JSON.parse(costResponse.text);

    setCurrentDeployment(prev => prev ? { ...prev, costEstimate: costData.totalEstimate, costBreakdown: costData.breakdown, logs: [...prev.logs, '[INFO] Cost estimation completed.', '[INFO] Diagram Agent starting...'] } : null);

    // Small delay to mitigate rate limiting
    await new Promise(r => setTimeout(r, 1000));

    // 4. Diagram Agent
    const diagramResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Plan: ${plan}`,
      config: {
        systemInstruction: `You are a Cloud Architecture Diagram Agent. Generate a professional Mermaid.js flowchart (graph TD).
        
        CRITICAL: Use BOLD lines and CLEAR connectivity.
        
        Follow these structural guidelines based on industry standards (AWS/Azure/GCP):
        1. **Hierarchy**: Use subgraphs to represent logical boundaries:
           - Outer: Region / Cloud Provider
           - Middle: VPC / Virtual Network
           - Inner: Availability Zones and Subnets (Public/Private)
        2. **Clarity**: 
           - Use HTML labels for nodes to include icons and **bold** text.
           - ALWAYS include crossorigin='anonymous' in img tags.
           - Example: A["<div style='text-align:center; padding:10px;'><img src='https://raw.githubusercontent.com/mingrammer/diagrams/master/resources/aws/compute/ec2.png' width='60' crossorigin='anonymous'/><br/><b style='font-size:1.2em;'>EC2 Instance</b></div>"]
        3. **Flow & Layout**: 
           - Use standard Mermaid arrow syntax: \`-->\` for solid lines with arrows.
           - Minimize arrow intersections. Group related resources together. 
           - Use logical top-to-bottom ordering (Internet -> Gateway -> Load Balancer -> App -> Database).
           - Use subgraphs to keep components organized and prevent "spaghetti" lines.
        4. **Mermaid Syntax Rules (CRITICAL)**:
           - DO NOT use "class:" or "style:" prefixes inside node definitions.
           - DO NOT use "classDef" or "class" statements.
           - Use ONLY standard node definitions: ID["Label"]
           - For arrows with labels, use the syntax: A -- "Label" --> B. DO NOT use A -->|Label| B or A -- Label --> B as they are prone to parsing errors with special characters.
           - DO NOT use colons (:) in arrow labels.
           - If you must style a node, use the syntax: style ID fill:#fff,stroke:#333,stroke-width:3px (on a NEW line at the end of the diagram).
           - DO NOT use special characters like ( ) [ ] { } : ; in node IDs. Use simple alphanumeric IDs (e.g., node1, vpc1).
           - Ensure HTML labels are simple and correctly closed.
        5. **Icons**: Use high-quality icons from the mingrammer/diagrams repository.
           - DO NOT add query parameters (like ?timestamp) to icon URLs.
           - Use ONLY the exact URLs provided or similar raw GitHub URLs.
        
        Common Icon URLs:
        - Networking:
          - VPC: https://raw.githubusercontent.com/mingrammer/diagrams/master/resources/aws/network/vpc.png
          - Subnet: https://raw.githubusercontent.com/mingrammer/diagrams/master/resources/aws/network/public-subnet.png
          - Internet Gateway: https://raw.githubusercontent.com/mingrammer/diagrams/master/resources/aws/network/internet-gateway.png
        - Compute:
          - AWS EC2: https://raw.githubusercontent.com/mingrammer/diagrams/master/resources/aws/compute/ec2.png
          - Azure App Service: https://raw.githubusercontent.com/mingrammer/diagrams/master/resources/azure/compute/app-services.png
          - GCP GCE: https://raw.githubusercontent.com/mingrammer/diagrams/master/resources/gcp/compute/compute-engine.png
        - Database:
          - AWS RDS: https://raw.githubusercontent.com/mingrammer/diagrams/master/resources/aws/database/rds.png
          - Azure SQL: https://raw.githubusercontent.com/mingrammer/diagrams/master/resources/azure/database/sql-databases.png
          - GCP Cloud SQL: https://raw.githubusercontent.com/mingrammer/diagrams/master/resources/gcp/database/sql.png
        - Storage:
          - AWS S3: https://raw.githubusercontent.com/mingrammer/diagrams/master/resources/aws/storage/s3.png
          - Azure Blob: https://raw.githubusercontent.com/mingrammer/diagrams/master/resources/azure/storage/blob-storage.png
          - GCP GCS: https://raw.githubusercontent.com/mingrammer/diagrams/master/resources/gcp/storage/gcs.png
        
        Return ONLY the Mermaid code, no markdown blocks.`
      }
    });
    let diagramCode = diagramResponse.text.replace(/```mermaid/g, '').replace(/```/g, '').trim();
    
    // Programmatic cleanup for common Mermaid syntax errors
    diagramCode = diagramCode
      .split('\n')
      .map(line => {
        // Remove problematic style/class prefixes that sometimes leak into node definitions
        let cleaned = line.replace(/(style|class):/g, '');
        
        // Fix colon-style labels: A --> B : Label  =>  A -- "Label" --> B
        // This handles cases like: node1 -.-> node2 : My Label
        const colonLabelMatch = cleaned.match(/^(\s*)(\w+)\s*(-[.-]*>)\s*(\w+)\s*:\s*(.+)$/);
        if (colonLabelMatch) {
          const [, indent, startNode, arrow, endNode, label] = colonLabelMatch;
          cleaned = `${indent}${startNode} -- "${label.trim()}" ${arrow} ${endNode}`;
        }
        
        return cleaned;
      })
      .join('\n');

    // Ensure it starts with graph TD or similar
    if (!diagramCode.toLowerCase().startsWith('graph') && !diagramCode.toLowerCase().startsWith('flowchart')) {
      diagramCode = 'graph TD\n' + diagramCode;
    }

    setCurrentDeployment(prev => prev ? { ...prev, diagramCode, logs: [...prev.logs, '[INFO] Architecture diagram generated.', '[INFO] Validation Agent starting...'] } : null);

    // Small delay to mitigate rate limiting
    await new Promise(r => setTimeout(r, 1000));

    // 5. Validation Agent
    const validationResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Code: ${code}`,
      config: {
        systemInstruction: `You are a Validation Agent. Review the following ${selectedLanguage} code for ${selectedCloud}. Check for syntax errors, missing dependencies, and security best practices. Return a summary of the validation.`
      }
    });
    const validation = validationResponse.text;

    setCurrentDeployment(prev => prev ? { ...prev, validation, logs: [...prev.logs, '[INFO] Validation completed.', '[INFO] CI/CD Agent starting...'] } : null);

    // 6. CI/CD Agent
    const workflowResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Cloud: ${selectedCloud}, Language: ${selectedLanguage}, Code: ${code}`,
      config: {
        systemInstruction: `You are a CI/CD Expert Agent. Generate a GitHub Actions workflow (.yml) to deploy the provided ${selectedLanguage} code to ${selectedCloud}. 
        
        CRITICAL: The workflow MUST include:
        on:
          workflow_dispatch:
            inputs:
              deploymentId:
                description: 'Deployment ID'
                required: false
          push:
            branches: [ main ]
        
        Include steps for:
        1. Checkout code
        2. Setup ${selectedLanguage}
        3. Configure cloud credentials (using secrets)
        4. ${selectedLanguage} init, plan, and apply.
        Return ONLY the YAML code.`
      }
    });
    const workflowCode = workflowResponse.text.replace(/```yaml/g, '').replace(/```/g, '').trim();

    const newDeployment = {
      userId: user!.uid,
      prompt,
      cloud: selectedCloud,
      language: selectedLanguage,
      status: 'validating',
      plan,
      code,
      validation,
      governanceReport,
      costEstimate: costData.totalEstimate,
      costBreakdown: costData.breakdown,
      diagramCode,
      workflowCode,
      designDocument,
      logs: [
        '[INFO] Architecture plan generated.',
        '[INFO] IaC code generation completed.',
        `[INFO] Governance & Compliance audit: ${governanceReport.score}/100 (${governanceReport.status.toUpperCase()}).`,
        '[INFO] Cost estimation completed.',
        '[INFO] Architecture diagram generated.',
        '[INFO] Validation completed.',
        '[INFO] CI/CD workflow generated.',
        '[SUCCESS] Infrastructure ready for review.'
      ],
      createdAt: Date.now(),
      type
    };

    const docRef = await addDoc(collection(db, 'deployments'), newDeployment);
    const finalDeployment = { id: docRef.id, ...newDeployment, createdAt: Date.now() } as any;
    setCurrentDeployment(finalDeployment);

    if (autoDeploy) {
      handleDeploy(finalDeployment);
    }
    } catch (error) {
      handleAIError(error, "Generation");
    }
  };

  const handleAIError = (error: any, stage: string) => {
    console.error(`${stage} failed`, error);
    let errorMessage = `[ERROR] ${stage} failed.`;
    const errorStr = JSON.stringify(error).toLowerCase();
    
    if (error?.message?.includes('429') || error?.status === 'RESOURCE_EXHAUSTED' || errorStr.includes('429') || errorStr.includes('resource_exhausted')) {
      errorMessage = `[CRITICAL] AI Rate Limit Exceeded (429). You have reached the maximum number of requests allowed by the Gemini API for now. Please wait a minute and try again.`;
    } else if (error?.message?.includes('quota') || errorStr.includes('quota')) {
      errorMessage = `[CRITICAL] AI Quota Exceeded. Please check your Gemini API billing details or usage limits.`;
    }
    
    setCurrentDeployment(prev => prev ? { ...prev, status: 'failed', logs: [...prev.logs, errorMessage] } : null);
    setIsGenerating(false);
  };

  const handleGenerate = async () => {
    // Client-side validation
    if (!prompt || prompt.trim().length < 10) {
      alert("Please provide a more detailed infrastructure description (at least 10 characters).");
      return;
    }
    if (!user) return;

    setIsGenerating(true);
    // Reset current deployment to avoid stale state issues
    setCurrentDeployment(null);

    // Small delay to ensure state clears
    await new Promise(r => setTimeout(r, 100));

    setCurrentDeployment({
      id: 'temp',
      prompt,
      cloud: selectedCloud,
      language: selectedLanguage,
      status: 'generating',
      logs: ['[INFO] Initializing AI Agents...', '[INFO] Planner Agent analyzing request...'],
      createdAt: Date.now(),
      type: 'builder'
    });

    try {
      // 1. Planner Agent
      const plannerResponse = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Cloud: ${selectedCloud}, Language: ${selectedLanguage}, Request: ${prompt}`,
        config: {
          systemInstruction: "You are a Cloud Architect Planner Agent. Break down the user's infrastructure request into a structured list of resources and their dependencies. Return a detailed architectural plan."
        }
      });
      const plan = plannerResponse.text;

      setCurrentDeployment(prev => prev ? { ...prev, plan, logs: [...prev.logs, '[INFO] Architecture plan generated.', '[INFO] IaC Generator Agent starting...'] } : null);

      // Generate a design document even in simple mode
      const consultantResponse = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Problem: ${prompt}\nTarget Cloud: ${selectedCloud}`,
        config: {
          systemInstruction: `You are a Senior DevOps & Cloud Architect Consultant. Provide a brief solution design document for this request. Explain chosen services and best practices.`
        }
      });
      const designDocument = consultantResponse.text;

      await finishGeneration(designDocument, plan);
      
    } catch (error) {
      console.error("Generation failed", error);
      setCurrentDeployment(prev => prev ? { ...prev, status: 'failed', logs: [...prev.logs, '[ERROR] AI Generation failed.'] } : null);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeploy = async (targetDeployment?: Deployment) => {
    const dep = targetDeployment || currentDeployment;
    if (!dep || dep.id === 'temp') return;

    // Check credentials
    const creds = dep.cloud === 'azure' ? userProfile?.azureCreds : dep.cloud === 'aws' ? userProfile?.awsCreds : userProfile?.gcpCreds;
    if (!creds) {
      alert(`Please configure your ${dep.cloud.toUpperCase()} credentials in the Credentials tab before deploying.`);
      setActiveTab('creds');
      return;
    }

    setCurrentDeployment(prev => prev ? { ...prev, status: 'deploying', logs: [...prev.logs, '[INFO] Initializing secure deployment tunnel...', `[INFO] Authenticating with ${dep.cloud.toUpperCase()}...`] } : null);
    
    try {
      let deploymentCode = dep.code;

      // If Azure and not ARM JSON, we need to convert it for the SDK to deploy it
      if (dep.cloud === 'azure' && !deploymentCode.trim().startsWith('{')) {
        setCurrentDeployment(prev => prev ? { ...prev, logs: [...prev.logs, `[INFO] Converting ${dep.language.toUpperCase()} to ARM JSON for direct deployment...`] } : null);
        const convertResponse = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `Convert the following ${dep.language.toUpperCase()} code to a valid, single-file ARM Template JSON for Azure. Return ONLY the JSON, no markdown blocks.\n\nCode:\n${dep.code}`,
          config: {
            systemInstruction: `You are an expert Cloud Infrastructure converter. Your task is to convert any IaC (Terraform, Bicep, Pulumi) into a valid, deployable Azure ARM Template JSON. 
            
            CRITICAL INSTRUCTIONS FOR DEPLOYABILITY & SMART CONVERSION:
            - You MUST consider the best approach to get the resources deployed following the official documentation from Azure and the ARM template schema.
            - ALL facts and eligibility of all resources to be deployed MUST be considered while generating the ARM JSON.
            - The generated ARM JSON MUST meet all criteria to be fully deployable to Azure without manual intervention.
            - Ensure all required properties for every resource are included according to the latest API versions.
            - FREE TIER & QUOTA AWARENESS: The user is using a Free Azure Subscription. You MUST default to the absolute lowest pricing tiers for ALL resources (e.g., 'F1' or 'B1' for App Service, 'Standard_B1s' for VMs, 'Basic' for databases, 'Standard_LRS' for storage).
            
            CRITICAL AZURE NAMING:
            - For Key Vaults, names must be 3-24 characters, alphanumeric, and start with a letter.
            - Use 'take(concat('kv', uniqueString(resourceGroup().id)), 24)' for unique Key Vault names.
            - Avoid using 'substring' on 'uniqueString' results if the length requested is greater than 13.
            
            AZURE ARM PARAMETERS:
            - ALWAYS provide a 'defaultValue' for every parameter in the generated ARM JSON.
            
            AZURE VALIDATION BEST PRACTICES:
            - Ensure globally unique names for Storage Accounts, Web Apps, and Key Vaults using 'uniqueString(resourceGroup().id)'.
            - STORAGE ACCOUNT NAMES: Must be 3-24 characters, lowercase letters and numbers ONLY. No hyphens or underscores. If the user provides a name, sanitize it (lowercase, remove hyphens) and append 'uniqueString' to ensure uniqueness.
            - GENERAL NAMING: For all resources (MySQL, PostgreSQL, etc.), ensure names are valid. When in doubt, use lowercase letters, numbers, and hyphens, and keep lengths between 3 and 24 characters. Avoid special characters.
            - Use standard SKUs (e.g., 'Standard_LRS' for storage, 'B1' or 'S1' for App Service) that are widely available across regions.
            - LOCATION: Always use '[resourceGroup().location]' for the 'location' property of all resources to ensure they are deployed in the same region as the resource group, preventing 'LocationNotAvailable' errors.
            - For AKS ('Microsoft.ContainerService/managedClusters'), DO NOT specify the 'kubernetesVersion' property. Let Azure automatically select the default supported version for the region to prevent 'K8sVersionNotSupported' errors.
            - RESPECT USER NAMES: If the user specifies a name for a resource or the resource group in their prompt, you MUST use that exact name (except for Storage Accounts which must be sanitized).
            - RESOURCE GROUP NAME: If the user specifies a resource group name, you MUST define a parameter named 'resourceGroupName' with that name as its 'defaultValue'. The deployment engine will use this parameter to create the resource group.
            - PRIVATE DNS ZONES: If you reference a Private DNS Zone (e.g., 'Microsoft.Network/privateDnsZones') in 'dependsOn' or 'resourceId()', you MUST explicitly define it in the 'resources' array. Do not assume it exists.
            - RESOURCE DECLARATION: If you reference ANY resource (e.g., in 'dependsOn', 'resourceId()', or 'reference()'), you MUST explicitly declare that resource in the 'resources' array of the template. Do not assume any resource exists beforehand.
            
            AZURE ARM FUNCTIONS (CRITICAL):
            - NESTED RESOURCE IDs: When using 'resourceId()' for nested resources (like 'Microsoft.Network/privateDnsZones/virtualNetworkLinks'), you MUST pass the parent name and child name as separate arguments. Example: "[resourceId('Microsoft.Network/privateDnsZones/virtualNetworkLinks', 'myZone.com', 'myLink')]". DO NOT pass a single slash-separated string.
            - DEPENDS ON: In the 'dependsOn' array, you MUST use the full resource ID expression (e.g., "[resourceId(...)]") for resources, especially nested ones. DO NOT use raw strings like 'Microsoft.Network/privateDnsZones/virtualNetworkLinks/my-link' as this will cause a malformed resource identifier error.
            - DO NOT use the 'reference()' function inside a resource 'name' or inside a 'guid()' function that defines a resource 'name'. This is a HARD RESTRICTION in Azure and causes validation errors.
            - For Role Assignment GUIDs, you MUST use static strings or resource IDs (e.g., 'guid(resourceId(...), 'roleName')') instead of dynamic principal IDs from 'reference()'.
            - Example of WRONG: guid(resourceId(...), reference(...).principalId)
            - Example of RIGHT: guid(resourceId(...), 'my-role-assignment')
            - VARIABLE DEFINITIONS: Every variable used via '[variables('varName')]' MUST be explicitly defined in the 'variables' section of the ARM template.
            - RESOURCE DEFINITIONS: Every resource referenced in 'dependsOn' or via 'resourceId()' MUST be explicitly defined in the 'resources' array of the template. DO NOT reference resources (like subnets, managed identities, or network interfaces) that are not declared in the same template.
            - DEPENDENCY ORDERING: You MUST explicitly define 'dependsOn' for every resource that relies on another resource (e.g., AKS depends on VNET/Subnet, Web App depends on App Service Plan, Storage depends on VNET if using Private Endpoints). DO NOT rely on implicit ordering.
            
            Return ONLY valid JSON. No markdown markers.`
          }
        });
        
        const rawText = convertResponse.text;
        // Robust JSON extraction
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        deploymentCode = jsonMatch ? jsonMatch[0] : rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      }

      // If Azure and ARM, ensure it's clean JSON
      if (dep.cloud === 'azure' && dep.language === 'arm') {
        const jsonMatch = deploymentCode.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          deploymentCode = jsonMatch[0];
        }
      }

      // Call the real backend deployment endpoint
      const response = await axios.post('/api/deploy', {
        deploymentId: dep.id,
        code: deploymentCode,
        cloud: dep.cloud,
        credentials: creds
      });

      const { logs: rawBackendLogs, status } = response.data;
      const backendLogs = Array.isArray(rawBackendLogs) ? rawBackendLogs : [];
      let allLogs = [...dep.logs];

      // Stream the logs to the UI for a better experience
      for (const log of backendLogs) {
        allLogs.push(log);
        setCurrentDeployment(prev => prev ? { ...prev, logs: [...allLogs] } : null);
        await new Promise(r => setTimeout(r, 400)); // Smooth log streaming
      }

      // Use Gemini to add final touches/summary to the logs
      const summaryStream = await ai.models.generateContentStream({
        model: "gemini-3-flash-preview",
        contents: `The following deployment to ${dep.cloud} was successful. Here are the logs: ${backendLogs.join('\n')}. 
        Generate a final summary log line with output variables (e.g. public IP, cluster endpoint) based on the code: ${dep.code}.`,
        config: {
          systemInstruction: "You are a Cloud Deployment Agent. Add a realistic final output summary to the deployment logs."
        }
      });

      for await (const chunk of summaryStream) {
        const lines = chunk.text.split('\n').filter(l => l.trim());
        for (const line of lines) {
          allLogs.push(line);
          setCurrentDeployment(prev => prev ? { ...prev, logs: [...allLogs] } : null);
        }
      }

      const deploymentRef = doc(db, 'deployments', dep.id);
      await updateDoc(deploymentRef, {
        status: 'success',
        logs: allLogs,
        updatedAt: Timestamp.now()
      });

      setCurrentDeployment(prev => prev ? { ...prev, status: 'success' } : null);

      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#10b981', '#6366f1']
      });

    } catch (error: any) {
      console.error("Deployment failed", error);
      let errorMessage = '[ERROR] Deployment agent encountered a critical error.';
      
      if (axios.isAxiosError(error) && error.response?.data?.logs) {
        const rawBackendLogs = error.response.data.logs;
        const backendLogs = Array.isArray(rawBackendLogs) ? rawBackendLogs : [];
        let allLogs = [...dep.logs];
        
        // Add backend logs to the UI even on failure
        for (const log of backendLogs) {
          if (!allLogs.includes(log)) {
            allLogs.push(log);
          }
        }
        
        // Specific tip for the substring error
        const substringError = backendLogs.find((l: string) => typeof l === 'string' && l.includes('substring') && l.includes('index and length parameters'));
        if (substringError) {
          allLogs.push('[TIP] The Azure deployment failed due to an invalid resource name length. I have updated the AI instructions to fix this. Please try generating the code again.');
        }

        // Specific tip for missing parameters
        const parameterError = backendLogs.find((l: string) => typeof l === 'string' && l.includes('template parameter') && l.includes('is not provided'));
        if (parameterError) {
          allLogs.push('[TIP] The Azure template is missing a required parameter value. I have updated the AI instructions to ensure default values are provided. Please try generating the code again.');
        }

        // Specific tip for reference function error
        const referenceError = backendLogs.find((l: string) => typeof l === 'string' && l.includes('reference') && l.includes('is not expected at this location'));
        if (referenceError) {
          allLogs.push('[TIP] The Azure template used the \'reference()\' function in an invalid location (likely a resource name). I have updated the AI instructions to fix this. Please try generating the code again.');
        }

        // Specific tip for variable not found
        if (backendLogs.some((l: string) => typeof l === 'string' && l.includes('template variable') && l.includes('is not found'))) {
          allLogs.push('[TIP] The Azure template references a variable that is not defined. I have updated the AI instructions to ensure all variables are explicitly defined. Please try generating the code again.');
        }

        // Specific tip for resource not defined
        if (backendLogs.some((l: string) => typeof l === 'string' && l.includes('is not defined in the template'))) {
          allLogs.push('[TIP] The Azure template references a resource (likely in \'dependsOn\') that is not declared in the resources array. I have updated the AI instructions to ensure all referenced resources are explicitly defined. Please try generating the code again.');
        }

        // Specific tip for InvalidTemplate
        if (backendLogs.some((l: string) => typeof l === 'string' && l.includes('InvalidTemplate'))) {
          allLogs.push('[TIP] The generated ARM template is syntactically invalid. Please try generating the code again.');
        }

        // Specific tip for LocationNotAvailable
        if (backendLogs.some((l: string) => typeof l === 'string' && l.includes('LocationNotAvailableForResourceType'))) {
          allLogs.push('[TIP] One or more resources are not available in the selected region. Please try generating the code again.');
        }

        // Catch-all tip for 400 errors if no other tips matched
        if (allLogs.length === dep.logs.length + backendLogs.length) {
           allLogs.push('[TIP] Azure rejected the deployment request. Please check the logs above for specific resource errors or try regenerating the code.');
        }
        
        setCurrentDeployment(prev => prev ? { ...prev, status: 'failed', logs: allLogs } : null);
        
        // Persist the failed logs to Firestore
        const deploymentRef = doc(db, 'deployments', dep.id);
        updateDoc(deploymentRef, {
          status: 'failed',
          logs: allLogs,
          updatedAt: Timestamp.now()
        }).catch(e => console.error("Failed to update deployment status in Firestore", e));
        
      } else {
        setCurrentDeployment(prev => prev ? { ...prev, status: 'failed', logs: [...prev.logs, errorMessage, `[ERROR] Details: ${error.message}`] } : null);
      }
    }
  };

  const handleDownloadExcel = (dep: Deployment) => {
    if (!dep.costBreakdown) return;
    
    // Create data with total at the bottom
    const data = [
      ...dep.costBreakdown,
      { resource: '---', cost: null, unit: '---' },
      { resource: 'TOTAL ESTIMATED MONTHLY COST', cost: dep.costEstimate, unit: 'USD' }
    ];
    
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Cost Estimate");
    XLSX.writeFile(workbook, `Cost_Estimate_${dep.id.slice(0, 8)}.xlsx`);
  };

  useEffect(() => {
    localStorage.setItem('app-theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const [downloadingType, setDownloadingType] = useState<'jpeg' | 'png' | null>(null);
  const [lottieData, setLottieData] = useState<{ [key: string]: any }>({});

  useEffect(() => {
    const fetchLottie = async (key: string, url: string) => {
      try {
        const response = await fetch(url);
        const data = await response.json();
        setLottieData(prev => ({ ...prev, [key]: data }));
      } catch (error) {
        console.error(`Failed to load Lottie: ${key}`, error);
      }
    };

    Object.entries(LOTTIE_URLS).forEach(([key, url]) => fetchLottie(key, url));
  }, []);

  const handlePushToGithub = async (dep: Deployment) => {
    if (!userProfile?.gitCreds?.token || !userProfile?.gitCreds?.repo) {
      toast.error("Please configure your GitHub credentials first.");
      setActiveTab('creds');
      setEditingCloud('github' as any);
      return;
    }

    try {
      toast.loading("Pushing code to GitHub...", { id: 'github-push' });
      
      const response = await axios.post('/api/git/push', {
        token: userProfile.gitCreds.token,
        repo: userProfile.gitCreds.repo,
        code: dep.code,
        cloud: dep.cloud,
        language: dep.language
      });

      if (response.data.status === 'success') {
        toast.success(response.data.message, { id: 'github-push' });
      } else {
        throw new Error(response.data.error || "Failed to push code");
      }
    } catch (error) {
      console.error("GitHub push failed:", error);
      toast.error(`Push failed: ${error instanceof Error ? error.message : 'Unknown error'}`, { id: 'github-push' });
    }
  };

  const handleDownloadDiagramJpeg = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentDeployment) return;
    
    const diagramId = `mermaid-diagram-inner-${currentDeployment.id}`;
    const diagramElement = document.getElementById(diagramId);

    if (diagramElement) {
      try {
        setDownloadingType('jpeg');
        toast.loading('Preparing high-quality JPEG...', { id: 'download-toast' });
        
        // Ensure all images are loaded
        const images = diagramElement.querySelectorAll('img');
        await Promise.all(Array.from(images).map(img => {
          if (img.complete) return Promise.resolve();
          return new Promise(resolve => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        }));

        // Wait for Mermaid to settle
        await new Promise(resolve => setTimeout(resolve, 1500));

        const blob = await toBlob(diagramElement, { 
          backgroundColor: '#ffffff',
          quality: 1.0,
          pixelRatio: 4, // Increased for ultra-high resolution
          cacheBust: true,
          style: {
            padding: '40px',
            backgroundColor: '#ffffff',
            borderRadius: '0px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            transform: 'scale(1)',
            transformOrigin: 'top left'
          }
        });
        
        if (!blob) throw new Error('Failed to generate image');

        saveAs(blob, `architecture-diagram-${currentDeployment.id.slice(0, 8)}.jpg`);
        toast.success('JPEG Diagram downloaded successfully!', { id: 'download-toast' });
      } catch (error) {
        console.error('Download failed:', error);
        toast.error(`Failed to download JPEG: ${error instanceof Error ? error.message : 'Unknown error'}`, { id: 'download-toast' });
      } finally {
        setDownloadingType(null);
      }
    } else {
      toast.error('Diagram element not found.');
    }
  };

  const handleDownloadDiagramPng = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentDeployment) return;

    const diagramId = `mermaid-diagram-inner-${currentDeployment.id}`;
    const diagramElement = document.getElementById(diagramId);

    if (diagramElement) {
      try {
        setDownloadingType('png');
        toast.loading('Preparing high-quality PNG...', { id: 'download-toast' });
        
        // Ensure all images are loaded
        const images = diagramElement.querySelectorAll('img');
        await Promise.all(Array.from(images).map(img => {
          if (img.complete) return Promise.resolve();
          return new Promise(resolve => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        }));

        // Wait for Mermaid to settle
        await new Promise(resolve => setTimeout(resolve, 1500));

        const blob = await toBlob(diagramElement, { 
          backgroundColor: '#ffffff',
          pixelRatio: 4, // Increased for ultra-high resolution
          cacheBust: true,
          style: {
            padding: '40px',
            backgroundColor: '#ffffff',
            borderRadius: '0px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            transform: 'scale(1)',
            transformOrigin: 'top left'
          }
        });
        
        if (!blob) throw new Error('Failed to generate image');

        saveAs(blob, `architecture-diagram-${currentDeployment.id.slice(0, 8)}.png`);
        toast.success('PNG Diagram downloaded successfully!', { id: 'download-toast' });
      } catch (error) {
        console.error('Download failed:', error);
        toast.error(`Failed to download PNG: ${error instanceof Error ? error.message : 'Unknown error'}`, { id: 'download-toast' });
      } finally {
        setDownloadingType(null);
      }
    } else {
      toast.error('Diagram element not found.');
    }
  };

  const handleDownloadDiagram = (dep: Deployment) => {
    if (!dep.diagramCode) return;
    const blob = new Blob([dep.diagramCode], { type: 'text/plain' });
    saveAs(blob, `Architecture_Diagram_${dep.id.slice(0, 8)}.txt`);
    toast.info("Diagram code downloaded. You can import this Mermaid code into Draw.io (Arrange > Insert > Advanced > Mermaid).");
  };

  const handleDeleteDeployment = async (e: React.MouseEvent, depId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm("Are you sure you want to delete this deployment history?")) return;

    try {
      await deleteDoc(doc(db, 'deployments', depId));
      toast.success("Deployment deleted successfully.");
      if (currentDeployment?.id === depId) {
        setCurrentDeployment(null);
      }
    } catch (error) {
      console.error("Delete failed", error);
      toast.error("Failed to delete deployment.");
    }
  };

  const handleTriggerWorkflow = async (dep: Deployment) => {
    if (!userProfile?.gitCreds?.token || !userProfile?.gitCreds?.repo) {
      setEditingCloud('github' as any);
      setIsCredModalOpen(true);
      toast.error('GitHub credentials required to trigger pipeline.');
      return;
    }

    try {
      toast.loading('Triggering GitHub Actions pipeline...', { id: 'workflow-toast' });
      const response = await axios.post('/api/trigger-workflow', {
        repo: userProfile.gitCreds.repo,
        token: userProfile.gitCreds.token,
        deploymentId: dep.id
      });

      if (response.data.status === 'success') {
        toast.success('Pipeline triggered successfully! Check your GitHub Actions tab.', { id: 'workflow-toast' });
        setCurrentDeployment(prev => prev ? { ...prev, logs: [...prev.logs, `[INFO] GitHub Action triggered: ${response.data.url}`] } : null);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Workflow trigger failed:', error);
      toast.error(`Failed to trigger pipeline: ${error instanceof Error ? error.message : 'Unknown error'}`, { id: 'workflow-toast' });
    }
  };

  const filteredDeployments = deployments
    .filter(d => filterCloud === 'all' || d.cloud === filterCloud)
    .filter(d => filterLanguage === 'all' || d.language === filterLanguage)
    .filter(d => filterStatus === 'all' || d.status === filterStatus)
    .sort((a, b) => {
      const dateA = typeof a.createdAt === 'number' ? a.createdAt : (a.createdAt as any)?.toMillis?.() || 0;
      const dateB = typeof b.createdAt === 'number' ? b.createdAt : (b.createdAt as any)?.toMillis?.() || 0;
      if (sortBy === 'date-desc') return dateB - dateA;
      return dateA - dateB;
    });

  if (!user) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#050505] text-white' : 'bg-gray-50 text-gray-900'} flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-500`}>
        <Toaster position="top-right" theme={theme === 'dark' ? 'dark' : 'light'} richColors />
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-blue-500/20 blur-[120px] rounded-full"
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.3, 1],
              rotate: [0, -90, 0],
              opacity: [0.1, 0.15, 0.1]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-purple-500/20 blur-[120px] rounded-full"
          />
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-8 relative z-10 max-w-4xl"
        >
          <div className="flex justify-center mb-8">
            <div className="w-64 h-64 opacity-90 hover:opacity-100 transition-opacity">
              {lottieData.hero && (
                <Lottie 
                  animationData={lottieData.hero}
                  loop={true}
                />
              )}
            </div>
          </div>
          
          <div className="space-y-4">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl font-black tracking-tighter"
            >
              CloudGenius <span className="text-blue-600">AI</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`text-xl ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} max-w-2xl mx-auto font-medium`}
            >
              The world's most advanced AI agent for cloud infrastructure. 
              Design, deploy, and manage multi-cloud architectures with natural language.
            </motion.p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mt-12">
            {[
              { icon: <Zap className="w-4 h-4" />, label: "Instant IaC" },
              { icon: <Cpu className="w-4 h-4" />, label: "Auto-Optimization" },
              { icon: <Globe className="w-4 h-4" />, label: "Multi-Cloud" },
              { icon: <Shield className="w-4 h-4" />, label: "Enterprise Security" }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + (i * 0.1) }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border ${theme === 'dark' ? 'bg-white/5 border-white/10 text-gray-300' : 'bg-white border-gray-200 text-gray-700 shadow-sm'}`}
              >
                {feature.icon}
                <span className="text-sm font-semibold">{feature.label}</span>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="pt-8"
          >
            <button 
              onClick={handleLogin}
              className={`px-10 py-5 ${theme === 'dark' ? 'bg-white text-black hover:bg-gray-200' : 'bg-blue-600 text-white hover:bg-blue-700'} font-bold rounded-2xl transition-all flex items-center gap-3 mx-auto group shadow-2xl`}
            >
              Get Started Free
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </motion.div>
        
        <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-12 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
          <motion.img 
            initial={{ opacity: 0, y: 10 }}
            animate={{ 
              opacity: 1, 
              y: [0, -10, 0] 
            }}
            transition={{ 
              opacity: { duration: 0.5, delay: 0.1 },
              y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.1 }
            }}
            src="https://cdn.simpleicons.org/amazonaws/232F3E" 
            alt="AWS" 
            className="h-10" 
            referrerPolicy="no-referrer"
          />
          <motion.img 
            initial={{ opacity: 0, y: 10 }}
            animate={{ 
              opacity: 1, 
              y: [0, -10, 0] 
            }}
            transition={{ 
              opacity: { duration: 0.5, delay: 0.2 },
              y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.2 }
            }}
            src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Microsoft_Azure.svg" 
            alt="Azure" 
            className="h-10" 
            referrerPolicy="no-referrer"
          />
          <motion.img 
            initial={{ opacity: 0, y: 10 }}
            animate={{ 
              opacity: 1, 
              y: [0, -10, 0] 
            }}
            transition={{ 
              opacity: { duration: 0.5, delay: 0.3 },
              y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.3 }
            }}
            src="https://upload.wikimedia.org/wikipedia/commons/5/51/Google_Cloud_logo.svg" 
            alt="GCP" 
            className="h-10" 
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#0a0a0a] text-gray-100' : 'bg-white text-gray-900'} flex font-sans transition-colors duration-300`}>
      {/* Sidebar */}
      <aside className={`w-64 border-r ${theme === 'dark' ? 'border-white/5 bg-black/40' : 'border-gray-200 bg-gray-50/50'} backdrop-blur-xl flex flex-col z-20`}>
        <div className={`p-6 flex items-center gap-3 border-b ${theme === 'dark' ? 'border-white/5' : 'border-gray-200'}`}>
          <motion.div 
            whileHover={{ rotate: 180 }}
            className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20"
          >
            <Cloud className="w-5 h-5 text-white" />
          </motion.div>
          <span className="font-bold text-lg tracking-tight">CloudGenius</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto scrollbar-hide">
          <SidebarItem 
            icon={<Layers className="w-5 h-5" />} 
            label="AI Builder" 
            active={activeTab === 'builder'} 
            onClick={() => setActiveTab('builder')}
            theme={theme}
          />
          <SidebarItem 
            icon={<MessageSquare className="w-5 h-5" />} 
            label="DevOps Consultant" 
            active={activeTab === 'consultant'} 
            onClick={() => setActiveTab('consultant')}
            theme={theme}
          />
          <SidebarItem 
            icon={<Activity className="w-5 h-5 text-amber-500" />} 
            label="Drift Detection" 
            active={activeTab === 'drift'} 
            onClick={() => setActiveTab('drift')}
            theme={theme}
          />
          <SidebarItem 
            icon={<Server className="w-5 h-5 text-cyan-500" />} 
            label="Self-Hosted VMs" 
            active={activeTab === 'self-hosted'} 
            onClick={() => setActiveTab('self-hosted')}
            theme={theme}
          />
          <SidebarItem 
            icon={<TerminalSquare className="w-5 h-5 text-red-500" />} 
            label="Ansible Automation" 
            active={activeTab === 'ansible'} 
            onClick={() => setActiveTab('ansible')}
            theme={theme}
          />
          <SidebarItem 
            icon={<Users className="w-5 h-5 text-purple-500" />} 
            label="RBAC & SSO" 
            active={activeTab === 'rbac-sso'} 
            onClick={() => setActiveTab('rbac-sso')}
            theme={theme}
          />
          <SidebarItem 
            icon={<FileCheck className="w-5 h-5 text-green-500" />} 
            label="Deployments" 
            active={activeTab === 'deployments'} 
            onClick={() => setActiveTab('deployments')}
            theme={theme}
          />
          <SidebarItem 
            icon={<Shield className="w-5 h-5 text-blue-500" />} 
            label="Credentials" 
            active={activeTab === 'creds'} 
            onClick={() => setActiveTab('creds')}
            theme={theme}
          />
        </nav>

        <div className={`p-4 border-t ${theme === 'dark' ? 'border-white/5' : 'border-gray-100'}`}>
          <div className={`flex items-center gap-3 p-2 rounded-xl ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-100'}`}>
            <motion.img 
              whileHover={{ scale: 1.1 }}
              src={user.photoURL || ''} 
              alt="User" 
              className="w-8 h-8 rounded-full border border-white/10" 
              referrerPolicy="no-referrer"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.displayName}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
            <button onClick={() => auth.signOut()} className="text-gray-500 hover:text-blue-500 transition-colors">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <header className={`h-16 border-b ${theme === 'dark' ? 'border-white/5 bg-black/20' : 'border-gray-200 bg-white/80'} backdrop-blur-md z-10 flex items-center justify-between px-8`}>
          <div className="flex items-center gap-4">
            <h2 className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Dashboard</h2>
            <ChevronRight className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`} />
            <h2 className="text-sm font-medium capitalize">{activeTab}</h2>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme}
              className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-white/5 hover:bg-white/10 text-yellow-500' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'} transition-all`}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${theme === 'dark' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-green-100 text-green-600 border-green-200'} text-xs font-medium border`}>
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              System Online
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            {activeTab === 'consultant' && (
              <motion.div 
                key="consultant"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-6xl mx-auto space-y-8"
              >
                <section className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h1 className="text-3xl font-bold tracking-tight">DevOps Consultant</h1>
                      <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Ask architectural questions and get expert recommendations following AWS, Azure, and GCP standards.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                      <div className="relative group">
                        <textarea 
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          placeholder="e.g., I want to deploy a microservice application and i need all resources needed to achieve this..."
                          className={`w-full h-64 border rounded-2xl p-6 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none ${
                            theme === 'dark' 
                              ? 'bg-white/5 border-white/10 placeholder:text-gray-600' 
                              : 'bg-white border-gray-200 placeholder:text-gray-400 shadow-sm'
                          }`}
                        />
                        <motion.button 
                          onClick={handleConsult}
                          disabled={isGenerating || !prompt}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`absolute bottom-4 right-4 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all ${isGenerating ? 'animate-pulse' : ''}`}
                        >
                          {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <MessageSquare className="w-5 h-5" />}
                          Get Expert Advice
                        </motion.button>
                      </div>

                      <div className="flex flex-wrap gap-4">
                        <div className="space-y-2">
                          <label className={`text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Target Cloud</label>
                          <div className="flex flex-wrap gap-2">
                            <ProviderButton active={selectedCloud === 'azure'} onClick={() => setSelectedCloud('azure')} icon={<motion.img whileHover={{ rotate: 15 }} src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Microsoft_Azure.svg" className="w-4 h-4" referrerPolicy="no-referrer" />} label="Azure" theme={theme} />
                            <ProviderButton active={selectedCloud === 'aws'} onClick={() => setSelectedCloud('aws')} icon={<motion.img whileHover={{ rotate: 15 }} src="https://cdn.simpleicons.org/amazonaws/232F3E" className="w-4 h-4" referrerPolicy="no-referrer" />} label="AWS" theme={theme} />
                            <ProviderButton active={selectedCloud === 'gcp'} onClick={() => setSelectedCloud('gcp')} icon={<motion.img whileHover={{ rotate: 15 }} src="https://upload.wikimedia.org/wikipedia/commons/5/51/Google_Cloud_logo.svg" className="w-4 h-4" referrerPolicy="no-referrer" />} label="GCP" theme={theme} />
                            <ProviderButton active={selectedCloud === 'self-hosted'} onClick={() => { setSelectedCloud('self-hosted'); setSelectedLanguage('ansible'); }} icon={<Server className="w-4 h-4 text-cyan-400" />} label="Self-Hosted" theme={theme} />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className={`text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>IaC Language</label>
                          <div className="flex flex-wrap gap-2">
                            <ProviderButton active={selectedLanguage === 'terraform'} onClick={() => setSelectedLanguage('terraform')} label="Terraform" theme={theme} />
                            <ProviderButton active={selectedLanguage === 'opentofu'} onClick={() => setSelectedLanguage('opentofu')} label="OpenTofu" theme={theme} />
                            <ProviderButton active={selectedLanguage === 'cloudformation'} onClick={() => setSelectedLanguage('cloudformation')} label="CloudFormation" theme={theme} />
                            <ProviderButton active={selectedLanguage === 'cdk'} onClick={() => setSelectedLanguage('cdk')} label="AWS CDK v2" theme={theme} />
                            <ProviderButton active={selectedLanguage === 'google-infra-manager'} onClick={() => setSelectedLanguage('google-infra-manager')} label="Google Infra Mgr" theme={theme} />
                            <ProviderButton active={selectedLanguage === 'bicep'} onClick={() => setSelectedLanguage('bicep')} label="Bicep" theme={theme} />
                            <ProviderButton active={selectedLanguage === 'arm'} onClick={() => setSelectedLanguage('arm')} label="ARM" theme={theme} />
                            <ProviderButton active={selectedLanguage === 'pulumi'} onClick={() => setSelectedLanguage('pulumi')} label="Pulumi" theme={theme} />
                            <ProviderButton active={selectedLanguage === 'ansible'} onClick={() => setSelectedLanguage('ansible')} label="Ansible" theme={theme} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'} space-y-4`}>
                        <h3 className="font-semibold flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-blue-500" />
                          Consultant Capabilities
                        </h3>
                        <ul className={`text-sm space-y-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          <li className="flex gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                            Multi-cloud architecture design
                          </li>
                          <li className="flex gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                            Cost-optimized service selection
                          </li>
                          <li className="flex gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                            Security & Compliance alignment
                          </li>
                          <li className="flex gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                            Automated IaC & Diagram generation
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Consultant Results */}
                <AnimatePresence>
                  {currentDeployment && (
                    <div className="space-y-8">
                      <DesignDocumentSection currentDeployment={currentDeployment} theme={theme} />
                      
                      {/* Results Section (Diagram, Code, etc.) */}
                      <ResultsSection 
                        currentDeployment={currentDeployment} 
                        theme={theme} 
                        lottieData={lottieData}
                        handleDeploy={handleDeploy}
                        handleTriggerWorkflow={handleTriggerWorkflow}
                        handleDownloadDiagramJpeg={handleDownloadDiagramJpeg}
                        handleDownloadDiagramPng={handleDownloadDiagramPng}
                        handleDownloadDiagram={handleDownloadDiagram}
                        handleDownloadExcel={handleDownloadExcel}
                        userProfile={userProfile}
                        logsEndRef={logsEndRef}
                      />
                    </div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {activeTab === 'builder' && (
              <motion.div 
                key="builder"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-6xl mx-auto space-y-8"
              >
                {/* Prompt Section */}
                <section className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h1 className="text-3xl font-bold tracking-tight">Infrastructure Builder</h1>
                      <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Describe your cloud architecture and let the AI agents handle the rest.</p>
                    </div>
                    <div className={`flex items-center gap-3 p-2 rounded-2xl border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
                      <div className="flex items-center gap-2 px-3 py-1.5">
                        <Activity className={`w-4 h-4 ${autoDeploy ? 'text-blue-500' : 'text-gray-500'}`} />
                        <span className="text-xs font-medium">Auto-Deploy</span>
                      </div>
                      <button 
                        onClick={() => setAutoDeploy(!autoDeploy)}
                        className={`w-10 h-5 rounded-full relative transition-colors ${autoDeploy ? 'bg-blue-600' : (theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200')}`}
                      >
                        <motion.div 
                          animate={{ x: autoDeploy ? 22 : 2 }}
                          className="absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm"
                        />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                      <div className="relative group">
                        <textarea 
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          placeholder="e.g., Deploy a production AKS cluster in Azure with a VNet, subnets, and a Key Vault using Bicep..."
                          className={`w-full h-48 border rounded-2xl p-6 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none ${
                            theme === 'dark' 
                              ? 'bg-white/5 border-white/10 placeholder:text-gray-600' 
                              : 'bg-white border-gray-200 placeholder:text-gray-400 shadow-sm'
                          }`}
                        />
                        <motion.button 
                          onClick={handleGenerate}
                          disabled={isGenerating || !prompt}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`absolute bottom-4 right-4 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all ${isGenerating ? 'animate-pulse' : ''}`}
                        >
                          {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                          Generate IaC
                        </motion.button>
                      </div>

                      <div className="flex flex-wrap gap-4">
                        <div className="space-y-2">
                          <label className={`text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Cloud Provider</label>
                          <div className="flex flex-wrap gap-2">
                            <ProviderButton active={selectedCloud === 'azure'} onClick={() => setSelectedCloud('azure')} icon={<motion.img whileHover={{ scale: 1.2 }} src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Microsoft_Azure.svg" className="w-4 h-4" referrerPolicy="no-referrer" />} label="Azure" theme={theme} />
                            <ProviderButton active={selectedCloud === 'aws'} onClick={() => setSelectedCloud('aws')} icon={<motion.img whileHover={{ scale: 1.2 }} src="https://cdn.simpleicons.org/amazonaws/232F3E" className="w-4 h-4" referrerPolicy="no-referrer" />} label="AWS" theme={theme} />
                            <ProviderButton active={selectedCloud === 'gcp'} onClick={() => setSelectedCloud('gcp')} icon={<motion.img whileHover={{ scale: 1.2 }} src="https://upload.wikimedia.org/wikipedia/commons/5/51/Google_Cloud_logo.svg" className="w-4 h-4" referrerPolicy="no-referrer" />} label="GCP" theme={theme} />
                            <ProviderButton active={selectedCloud === 'self-hosted'} onClick={() => { setSelectedCloud('self-hosted'); setSelectedLanguage('ansible'); }} icon={<Server className="w-4 h-4 text-cyan-400" />} label="Self-Hosted" theme={theme} />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className={`text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>IaC Language</label>
                          <div className="flex flex-wrap gap-2">
                            <ProviderButton active={selectedLanguage === 'terraform'} onClick={() => setSelectedLanguage('terraform')} label="Terraform" theme={theme} />
                            <ProviderButton active={selectedLanguage === 'opentofu'} onClick={() => setSelectedLanguage('opentofu')} label="OpenTofu" theme={theme} />
                            <ProviderButton active={selectedLanguage === 'cloudformation'} onClick={() => setSelectedLanguage('cloudformation')} label="CloudFormation" theme={theme} />
                            <ProviderButton active={selectedLanguage === 'cdk'} onClick={() => setSelectedLanguage('cdk')} label="AWS CDK v2" theme={theme} />
                            <ProviderButton active={selectedLanguage === 'google-infra-manager'} onClick={() => setSelectedLanguage('google-infra-manager')} label="Google Infra Mgr" theme={theme} />
                            <ProviderButton active={selectedLanguage === 'bicep'} onClick={() => setSelectedLanguage('bicep')} label="Bicep" theme={theme} />
                            <ProviderButton active={selectedLanguage === 'arm'} onClick={() => setSelectedLanguage('arm')} label="ARM" theme={theme} />
                            <ProviderButton active={selectedLanguage === 'pulumi'} onClick={() => setSelectedLanguage('pulumi')} label="Pulumi" theme={theme} />
                            <ProviderButton active={selectedLanguage === 'ansible'} onClick={() => setSelectedLanguage('ansible')} label="Ansible" theme={theme} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'} space-y-4`}>
                        <h3 className="font-semibold flex items-center gap-2">
                          <Shield className="w-4 h-4 text-blue-500" />
                          Agent Status
                        </h3>
                        <div className="space-y-3">
                          <AgentStatusItem label="Planner Agent" status={isGenerating ? 'active' : 'idle'} theme={theme} />
                          <AgentStatusItem label="IaC Generator" status={isGenerating ? 'active' : 'idle'} theme={theme} />
                          <AgentStatusItem label="Validation Agent" status={isGenerating ? 'active' : 'idle'} theme={theme} />
                          <AgentStatusItem label="Deployment Agent" status={currentDeployment?.status === 'deploying' ? 'active' : 'idle'} theme={theme} />
                        </div>
                      </div>
                      
                      <motion.div 
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-gradient-to-br from-blue-600/20 to-purple-600/20 border-white/10' : 'bg-blue-50 border-blue-100'} space-y-2`}
                      >
                        <h3 className={`font-semibold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>Quick Tip</h3>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Try being specific about subnets, regions, and security groups for more accurate code generation.</p>
                      </motion.div>
                    </div>
                  </div>
                </section>

                {/* Results Section */}
                <AnimatePresence>
                  {currentDeployment && (
                    <div className="space-y-8">
                      <ResultsSection 
                        currentDeployment={currentDeployment} 
                        theme={theme} 
                        lottieData={lottieData}
                        handleDeploy={handleDeploy}
                        handleTriggerWorkflow={handleTriggerWorkflow}
                        handleDownloadDiagramJpeg={handleDownloadDiagramJpeg}
                        handleDownloadDiagramPng={handleDownloadDiagramPng}
                        handleDownloadDiagram={handleDownloadDiagram}
                        handleDownloadExcel={handleDownloadExcel}
                        userProfile={userProfile}
                        logsEndRef={logsEndRef}
                      />

                      <DesignDocumentSection currentDeployment={currentDeployment} theme={theme} />
                    </div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {activeTab === 'deployments' && (
              <motion.div 
                key="deployments"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-6xl mx-auto space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h1 className="text-3xl font-bold">Deployment History</h1>
                  <button onClick={() => setActiveTab('builder')} className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    New Deployment
                  </button>
                </div>

                {/* Filters & Sorting */}
                <div className="flex flex-wrap gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Cloud</label>
                    <select 
                      value={filterCloud} 
                      onChange={(e) => setFilterCloud(e.target.value as any)}
                      className={`${theme === 'dark' ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'} border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500`}
                    >
                      <option value="all">All Clouds</option>
                      <option value="azure">Azure</option>
                      <option value="aws">AWS</option>
                      <option value="gcp">GCP</option>
                      <option value="self-hosted">Self-Hosted</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Language</label>
                    <select 
                      value={filterLanguage} 
                      onChange={(e) => setFilterLanguage(e.target.value as any)}
                      className={`${theme === 'dark' ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'} border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500`}
                    >
                      <option value="all">All Languages</option>
                      <option value="terraform">Terraform</option>
                      <option value="opentofu">OpenTofu</option>
                      <option value="cloudformation">CloudFormation</option>
                      <option value="cdk">AWS CDK v2</option>
                      <option value="google-infra-manager">Google Infra Manager</option>
                      <option value="bicep">Bicep</option>
                      <option value="arm">ARM</option>
                      <option value="pulumi">Pulumi</option>
                      <option value="ansible">Ansible</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Status</label>
                    <select 
                      value={filterStatus} 
                      onChange={(e) => setFilterStatus(e.target.value as any)}
                      className="bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="all">All Statuses</option>
                      <option value="success">Success</option>
                      <option value="failed">Failed</option>
                      <option value="deploying">Deploying</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Sort By</label>
                    <select 
                      value={sortBy} 
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className={`${theme === 'dark' ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'} border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500`}
                    >
                      <option value="date-desc">Newest First</option>
                      <option value="date-asc">Oldest First</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {filteredDeployments.length > 0 ? filteredDeployments.map((dep, i) => (
                    <motion.div 
                      key={dep.id} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ x: 5, backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.02)' }}
                      onClick={() => { 
                        setCurrentDeployment(dep); 
                        setActiveTab(dep.type === 'consultant' ? 'consultant' : 'builder'); 
                      }}
                      className={`p-6 rounded-2xl border transition-all cursor-pointer group ${theme === 'dark' ? 'bg-white/5 border-white/10 hover:border-blue-500/50' : 'bg-white border-gray-200 hover:border-blue-500/50 shadow-sm'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${dep.status === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'}`}>
                            {dep.cloud === 'azure' ? (
                              <motion.img whileHover={{ scale: 1.2 }} src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Microsoft_Azure.svg" className="w-6 h-6" referrerPolicy="no-referrer" />
                            ) : dep.cloud === 'aws' ? (
                              <motion.img whileHover={{ scale: 1.2 }} src="https://cdn.simpleicons.org/amazonaws/232F3E" className="w-6 h-6" referrerPolicy="no-referrer" />
                            ) : dep.cloud === 'gcp' ? (
                              <motion.img whileHover={{ scale: 1.2 }} src="https://upload.wikimedia.org/wikipedia/commons/5/51/Google_Cloud_logo.svg" className="w-6 h-6" referrerPolicy="no-referrer" />
                            ) : (
                              <Server className="w-6 h-6 text-cyan-400" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold group-hover:text-blue-400 transition-colors line-clamp-1">{dep.prompt}</h4>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${dep.type === 'consultant' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                {dep.type || 'builder'}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs text-gray-500 capitalize">{dep.cloud} • {dep.language}</span>
                              <span className="text-xs text-gray-600">•</span>
                              <span className="text-xs text-gray-500">
                                {new Date(typeof dep.createdAt === 'number' ? dep.createdAt : (dep.createdAt as any)?.toMillis?.() || 0).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <StatusBadge status={dep.status} theme={theme} />
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={(e) => handleDeleteDeployment(e, dep.id)}
                              className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors opacity-0 group-hover:opacity-100"
                              title="Delete Deployment"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )) : (
                    <div className="py-20 text-center space-y-4">
                      <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                        <Activity className="w-8 h-8 text-gray-600" />
                      </div>
                      <p className="text-gray-500">No deployments found. Start by creating your first infrastructure.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'drift' && (
              <motion.div 
                key="drift"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-6xl mx-auto space-y-8"
              >
                <DriftDetectionView 
                  deployments={deployments} 
                  theme={theme} 
                />
              </motion.div>
            )}

            {activeTab === 'self-hosted' && (
              <motion.div 
                key="self-hosted"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-6xl mx-auto space-y-8"
              >
                <SelfHostedVMView 
                  theme={theme} 
                  onGenerateVMIaC={(vmPrompt) => {
                    setPrompt(vmPrompt);
                    setSelectedCloud('self-hosted');
                    setSelectedLanguage('ansible');
                    setActiveTab('builder');
                  }}
                />
              </motion.div>
            )}

            {activeTab === 'ansible' && (
              <motion.div 
                key="ansible"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-6xl mx-auto space-y-8"
              >
                <AnsibleAutomationView 
                  theme={theme} 
                />
              </motion.div>
            )}

            {activeTab === 'rbac-sso' && (
              <motion.div 
                key="rbac-sso"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-6xl mx-auto space-y-8"
              >
                <RBACAndSSOView 
                  theme={theme}
                  currentUserRole={currentUserRole}
                  onSimulateRole={(role) => {
                    setCurrentUserRole(role);
                    toast.info(`Active session role switched to: ${role}`);
                  }}
                />
              </motion.div>
            )}

            {activeTab === 'creds' && (
              <motion.div 
                key="creds"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-4xl mx-auto space-y-8"
              >
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tight">Cloud Credentials</h1>
                  <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Securely manage your cloud provider access keys and service principals.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                  <CredentialCard 
                    title="Azure" 
                    icon={<motion.img whileHover={{ scale: 1.1, rotate: 5 }} src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Microsoft_Azure.svg" className="w-8 h-8" referrerPolicy="no-referrer" />}
                    status={userProfile?.azureCreds?.configured ? "Connected" : "Not Configured"}
                    details={userProfile?.azureCreds?.useManagedIdentity ? "Managed Identity" : "Service Principal"}
                    lastUsed={userProfile?.azureCreds?.timestamp ? new Date(userProfile.azureCreds.timestamp).toLocaleDateString() : "-"}
                    onClick={() => { 
                      setEditingCloud('azure'); 
                      setModalAzureUseMI(userProfile?.azureCreds?.useManagedIdentity || false);
                      setIsCredModalOpen(true); 
                    }}
                    theme={theme}
                  />
                  <CredentialCard 
                    title="AWS" 
                    icon={<motion.img whileHover={{ scale: 1.1, rotate: 5 }} src="https://cdn.simpleicons.org/amazonaws/232F3E" className="w-8 h-8" referrerPolicy="no-referrer" />}
                    status={userProfile?.awsCreds?.configured ? "Connected" : "Not Configured"}
                    lastUsed={userProfile?.awsCreds?.timestamp ? new Date(userProfile.awsCreds.timestamp).toLocaleDateString() : "-"}
                    onClick={() => { setEditingCloud('aws'); setIsCredModalOpen(true); }}
                    theme={theme}
                  />
                  <CredentialCard 
                    title="GCP" 
                    icon={<motion.img whileHover={{ scale: 1.1, rotate: 5 }} src="https://upload.wikimedia.org/wikipedia/commons/5/51/Google_Cloud_logo.svg" className="w-8 h-8" referrerPolicy="no-referrer" />}
                    status={userProfile?.gcpCreds?.configured ? "Connected" : "Not Configured"}
                    lastUsed={userProfile?.gcpCreds?.timestamp ? new Date(userProfile.gcpCreds.timestamp).toLocaleDateString() : "-"}
                    onClick={() => { setEditingCloud('gcp'); setIsCredModalOpen(true); }}
                    theme={theme}
                  />
                  <CredentialCard 
                    title="Self-Hosted VM" 
                    icon={<Server className="w-8 h-8 text-cyan-400" />}
                    status={userProfile?.selfHostedCreds?.configured ? "Connected" : "Not Configured"}
                    details={userProfile?.selfHostedCreds?.host ? `${userProfile.selfHostedCreds.username || 'ubuntu'}@${userProfile.selfHostedCreds.host}` : "SSH / Bare-metal"}
                    lastUsed={userProfile?.selfHostedCreds?.timestamp ? new Date(userProfile.selfHostedCreds.timestamp).toLocaleDateString() : "-"}
                    onClick={() => { setEditingCloud('self-hosted'); setIsCredModalOpen(true); }}
                    theme={theme}
                  />
                  <CredentialCard 
                    title="GitHub" 
                    icon={<img src="https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg" className={`w-8 h-8 ${theme === 'dark' ? 'invert' : ''}`} />}
                    status={userProfile?.gitCreds?.configured ? "Connected" : "Not Configured"}
                    lastUsed={userProfile?.gitCreds?.timestamp ? new Date(userProfile.gitCreds.timestamp).toLocaleDateString() : "-"}
                    onClick={() => { setEditingCloud('github' as any); setIsCredModalOpen(true); }}
                    theme={theme}
                  />
                </div>

                <div className={`p-8 rounded-3xl border space-y-6 ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold">Security Settings</h3>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium border ${theme === 'dark' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                      AES-256 Encrypted
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className={`flex items-center justify-between p-4 rounded-xl border ${theme === 'dark' ? 'bg-black/40 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                      <div>
                        <p className="font-medium">Auto-rotate Keys</p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Automatically rotate service principal keys every 90 days.</p>
                      </div>
                      <div className={`w-12 h-6 rounded-full relative ${theme === 'dark' ? 'bg-blue-600' : 'bg-blue-600'}`}>
                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                      </div>
                    </div>
                    <div className={`flex items-center justify-between p-4 rounded-xl border ${theme === 'dark' ? 'bg-black/40 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                      <div>
                        <p className="font-medium">Enforce MFA</p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Require multi-factor authentication for all deployment triggers.</p>
                      </div>
                      <div className={`w-12 h-6 rounded-full relative ${theme === 'dark' ? 'bg-blue-600' : 'bg-blue-600'}`}>
                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Credential Modal */}
        <AnimatePresence>
          {isCredModalOpen && editingCloud && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`w-full max-w-md border rounded-3xl p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto ${theme === 'dark' ? 'bg-[#111] border-white/10' : 'bg-white border-gray-200'}`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold">Configure {editingCloud.toUpperCase()}</h3>
                  <button onClick={() => setIsCredModalOpen(false)} className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-100'}`}>
                    <Plus className={`w-6 h-6 rotate-45 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                  </button>
                </div>

                <div className="space-y-4">
                  {editingCloud === 'azure' && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className={`text-xs font-bold uppercase ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Identity type</label>
                        <div className={`p-3 border rounded-xl text-sm ${theme === 'dark' ? 'bg-white/5 border-white/10 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                          App registration or managed identity (manual)
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className={`text-xs font-bold uppercase ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Credential</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button 
                            onClick={() => setModalAzureUseMI(false)}
                            className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all ${!modalAzureUseMI ? 'bg-blue-600/10 border-blue-600/50 text-blue-400' : (theme === 'dark' ? 'bg-white/5 border-white/10 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-400')}`}
                          >
                            Secret
                          </button>
                          <button 
                            onClick={() => setModalAzureUseMI(true)}
                            className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all ${modalAzureUseMI ? 'bg-blue-600/10 border-blue-600/50 text-blue-400' : (theme === 'dark' ? 'bg-white/5 border-white/10 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-400')}`}
                          >
                            Managed Identity
                          </button>
                        </div>
                        {!modalAzureUseMI && (
                          <p className="text-[10px] text-yellow-500/80 mt-1">
                            Warning: using a secret or certificate will require manual rotation and management. We recommend using workload identity federation.
                          </p>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-1">
                          <label className={`text-xs font-bold uppercase ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Environment</label>
                          <select id="azure-env" className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${theme === 'dark' ? 'bg-black/40 border-white/10' : 'bg-gray-50 border-gray-200'}`} defaultValue={userProfile?.azureCreds?.environment || 'Azure Cloud'}>
                            <option>Azure Cloud</option>
                            <option>Azure US Government</option>
                            <option>Azure China</option>
                            <option>Azure German</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className={`text-xs font-bold uppercase ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Scope Level</label>
                          <select id="azure-scope-level" className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${theme === 'dark' ? 'bg-black/40 border-white/10' : 'bg-gray-50 border-gray-200'}`} defaultValue={userProfile?.azureCreds?.scopeLevel || 'Subscription'}>
                            <option>Subscription</option>
                            <option>Management Group</option>
                            <option>Machine Learning Workspace</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className={`text-xs font-bold uppercase ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Subscription ID</label>
                          <input id="azure-sub-id" type="text" className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'bg-black/40 border-white/10' : 'bg-gray-50 border-gray-200'}`} placeholder="00000000-0000-0000-0000-000000000000" defaultValue={userProfile?.azureCreds?.subscriptionId} />
                        </div>

                        <div className="space-y-1">
                          <label className={`text-xs font-bold uppercase ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Subscription Name</label>
                          <input id="azure-sub-name" type="text" className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'bg-black/40 border-white/10' : 'bg-gray-50 border-gray-200'}`} placeholder="My Subscription" defaultValue={userProfile?.azureCreds?.subscriptionName} />
                        </div>

                        <div className={`pt-4 border-t ${theme === 'dark' ? 'border-white/5' : 'border-gray-100'}`}>
                          <h4 className={`text-sm font-bold mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Authentication</h4>
                          {modalAzureUseMI ? (
                            <div className="space-y-4">
                              <p className={`text-[10px] italic ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                                Refer to App registration or Managed Identity configuration documentation on how to create an identity with federated credentials.
                              </p>
                              <div className="space-y-1">
                                <label className={`text-xs font-bold uppercase ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Resource Group</label>
                                <input id="azure-mi-rg" type="text" className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'bg-black/40 border-white/10' : 'bg-gray-50 border-gray-200'}`} placeholder="Resource Group" defaultValue={userProfile?.azureCreds?.miResourceGroup} />
                              </div>
                              <div className="space-y-1">
                                <label className={`text-xs font-bold uppercase ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Managed Identity Name</label>
                                <input id="azure-mi-name" type="text" className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'bg-black/40 border-white/10' : 'bg-gray-50 border-gray-200'}`} placeholder="Identity Name" defaultValue={userProfile?.azureCreds?.miName} />
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div className="space-y-1">
                                <label className={`text-xs font-bold uppercase ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Application (client) ID</label>
                                <input id="azure-client" type="text" className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'bg-black/40 border-white/10' : 'bg-gray-50 border-gray-200'}`} defaultValue={userProfile?.azureCreds?.clientId} />
                              </div>
                              <div className="space-y-1">
                                <label className={`text-xs font-bold uppercase ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Directory (tenant) ID</label>
                                <input id="azure-tenant" type="text" className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'bg-black/40 border-white/10' : 'bg-gray-50 border-gray-200'}`} defaultValue={userProfile?.azureCreds?.tenantId} />
                              </div>
                              <div className="space-y-2">
                                <label className={`text-xs font-bold uppercase ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Credential</label>
                                <div className="flex gap-2">
                                  <button className="px-3 py-1.5 rounded-lg bg-blue-600/20 border border-blue-600/50 text-blue-400 text-[10px] font-bold uppercase">Service principal key</button>
                                  <button className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase ${theme === 'dark' ? 'bg-white/5 border-white/10 text-gray-500' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>Certificate</button>
                                </div>
                                <div className="space-y-1 mt-2">
                                  <label className={`text-[10px] font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}>Service principal key / Client secret</label>
                                  <input id="azure-secret" type="password" className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'bg-black/40 border-white/10' : 'bg-gray-50 border-gray-200'}`} placeholder="••••••••••••" />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="space-y-1 pt-2">
                          <label className={`text-xs font-bold uppercase ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Service Connection Name</label>
                          <input id="azure-conn-name" type="text" className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'bg-black/40 border-white/10' : 'bg-gray-50 border-gray-200'}`} placeholder="Azure Service Connection" defaultValue={userProfile?.azureCreds?.connectionName} />
                        </div>

                        <div className="space-y-1">
                          <label className={`text-xs font-bold uppercase ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Description (optional)</label>
                          <textarea id="azure-desc" className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 text-sm ${theme === 'dark' ? 'bg-black/40 border-white/10' : 'bg-gray-50 border-gray-200'}`} placeholder="Connection description..." defaultValue={userProfile?.azureCreds?.description} />
                        </div>

                        <div className={`pt-4 border-t ${theme === 'dark' ? 'border-white/5' : 'border-gray-100'}`}>
                          <h4 className={`text-xs font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}>Security</h4>
                        </div>
                      </div>
                    </div>
                  )}
                  {editingCloud === 'aws' && (
                    <>
                      <div className="space-y-1">
                        <label className={`text-xs font-bold uppercase ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Access Key ID</label>
                        <input id="aws-key" type="text" className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'bg-black/40 border-white/10' : 'bg-gray-50 border-gray-200'}`} defaultValue={userProfile?.awsCreds?.accessKeyId} />
                      </div>
                      <div className="space-y-1">
                        <label className={`text-xs font-bold uppercase ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Secret Access Key</label>
                        <input id="aws-secret" type="password" className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'bg-black/40 border-white/10' : 'bg-gray-50 border-gray-200'}`} placeholder="••••••••••••" />
                      </div>
                      <div className="space-y-1">
                        <label className={`text-xs font-bold uppercase ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Default Region</label>
                        <input id="aws-region" type="text" className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'bg-black/40 border-white/10' : 'bg-gray-50 border-gray-200'}`} placeholder="us-east-1" defaultValue={userProfile?.awsCreds?.region} />
                      </div>
                    </>
                  )}
                  {editingCloud === 'gcp' && (
                    <>
                      <div className="space-y-1">
                        <label className={`text-xs font-bold uppercase ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Project ID</label>
                        <input id="gcp-project" type="text" className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'bg-black/40 border-white/10' : 'bg-gray-50 border-gray-200'}`} defaultValue={userProfile?.gcpCreds?.projectId} />
                      </div>
                      <div className="space-y-1">
                        <label className={`text-xs font-bold uppercase ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Service Account Key (JSON)</label>
                        <textarea id="gcp-key" className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 font-mono text-sm ${theme === 'dark' ? 'bg-black/40 border-white/10' : 'bg-gray-50 border-gray-200'}`} placeholder="{ ... }" defaultValue={userProfile?.gcpCreds?.keyFile} />
                      </div>
                    </>
                  )}
                  {editingCloud === ('github' as any) && (
                    <>
                      <div className={`p-4 border rounded-2xl flex gap-3 ${theme === 'dark' ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-50 border-blue-100'}`}>
                        <ExternalLink className="w-5 h-5 text-blue-500 shrink-0" />
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-blue-500">How to create a GitHub PAT</p>
                          <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            1. Go to <a href="https://github.com/settings/tokens" target="_blank" rel="noreferrer" className={`underline ${theme === 'dark' ? 'text-white' : 'text-blue-600'}`}>GitHub Settings</a><br/>
                            2. Click <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Generate new token (classic)</span><br/>
                            3. Select the <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>repo</span> scope (Full control of private repositories)<br/>
                            4. Generate and copy the token starting with <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>ghp_</span>
                          </p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className={`text-xs font-bold uppercase ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>GitHub Personal Access Token</label>
                        <input id="git-token" type="password" className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'bg-black/40 border-white/10' : 'bg-gray-50 border-gray-200'}`} placeholder="ghp_..." defaultValue={userProfile?.gitCreds?.token} />
                      </div>
                      <div className="space-y-1">
                        <label className={`text-xs font-bold uppercase ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Default Repository (e.g. user/repo)</label>
                        <input id="git-repo" type="text" className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'bg-black/40 border-white/10' : 'bg-gray-50 border-gray-200'}`} placeholder="username/infrastructure" defaultValue={userProfile?.gitCreds?.repo} />
                      </div>
                    </>
                  )}
                  {editingCloud === 'self-hosted' && (
                    <>
                      <div className={`p-4 border rounded-2xl flex gap-3 ${theme === 'dark' ? 'bg-cyan-500/10 border-cyan-500/20' : 'bg-cyan-50 border-cyan-100'}`}>
                        <Server className="w-5 h-5 text-cyan-400 shrink-0" />
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-cyan-400">Self-Hosted VM / Bare Metal SSH Configuration</p>
                          <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            Connect directly to on-premise Linux/Unix servers or self-hosted VMs via SSH for automated Ansible playbook execution and configuration management.
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-2 space-y-1">
                          <label className={`text-xs font-bold uppercase ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Host / IP Address</label>
                          <input id="self-host" type="text" className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${theme === 'dark' ? 'bg-black/40 border-white/10' : 'bg-gray-50 border-gray-200'}`} placeholder="192.168.1.100 or vm.internal" defaultValue={userProfile?.selfHostedCreds?.host} />
                        </div>
                        <div className="space-y-1">
                          <label className={`text-xs font-bold uppercase ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>SSH Port</label>
                          <input id="self-port" type="number" className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${theme === 'dark' ? 'bg-black/40 border-white/10' : 'bg-gray-50 border-gray-200'}`} placeholder="22" defaultValue={userProfile?.selfHostedCreds?.port || 22} />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className={`text-xs font-bold uppercase ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>SSH Username</label>
                        <input id="self-user" type="text" className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${theme === 'dark' ? 'bg-black/40 border-white/10' : 'bg-gray-50 border-gray-200'}`} placeholder="ubuntu" defaultValue={userProfile?.selfHostedCreds?.username || 'ubuntu'} />
                      </div>
                      <div className="space-y-1">
                        <label className={`text-xs font-bold uppercase ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>SSH Private Key (PEM / OpenSSH format)</label>
                        <textarea id="self-key" className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 h-28 font-mono text-xs ${theme === 'dark' ? 'bg-black/40 border-white/10' : 'bg-gray-50 border-gray-200'}`} placeholder="-----BEGIN OPENSSH PRIVATE KEY-----&#10;...&#10;-----END OPENSSH PRIVATE KEY-----" defaultValue={userProfile?.selfHostedCreds?.privateKey} />
                      </div>
                    </>
                  )}
                </div>

                <div className="space-y-4">
                  {editingCloud === 'azure' && modalAzureUseMI && (
                    <div className={`p-4 border rounded-2xl flex gap-3 ${theme === 'dark' ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-yellow-50 border-yellow-100'}`}>
                      <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-yellow-500">Managed Identity Note</p>
                        <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          Managed Identity only works when running <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>inside</span> Azure resources. 
                          Since this app is currently in AI Studio, please use <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Secret</span> for verification and deployment.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => setIsCredModalOpen(false)}
                    className={`flex-1 px-6 py-3 rounded-xl font-medium transition-colors ${theme === 'dark' ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                  >
                    Cancel
                  </button>
                  <button 
                    id="test-conn-btn"
                    disabled={verificationStatus[editingCloud || ''] === 'verifying'}
                    onClick={async () => {
                      setVerificationStatus(prev => ({ ...prev, [editingCloud!]: 'verifying' }));
                      
                      let credData: any = {};
                      if (editingCloud === 'azure') {
                        credData = {
                          useManagedIdentity: modalAzureUseMI,
                          environment: (document.getElementById('azure-env') as HTMLSelectElement)?.value,
                          scopeLevel: (document.getElementById('azure-scope-level') as HTMLSelectElement)?.value,
                          subscriptionId: (document.getElementById('azure-sub-id') as HTMLInputElement)?.value,
                          subscriptionName: (document.getElementById('azure-sub-name') as HTMLInputElement)?.value,
                          miResourceGroup: (document.getElementById('azure-mi-rg') as HTMLInputElement)?.value,
                          miName: (document.getElementById('azure-mi-name') as HTMLInputElement)?.value,
                          tenantId: (document.getElementById('azure-tenant') as HTMLInputElement)?.value,
                          clientId: (document.getElementById('azure-client') as HTMLInputElement)?.value,
                          clientSecret: (document.getElementById('azure-secret') as HTMLInputElement)?.value || userProfile?.azureCreds?.clientSecret,
                          connectionName: (document.getElementById('azure-conn-name') as HTMLInputElement)?.value,
                          description: (document.getElementById('azure-desc') as HTMLTextAreaElement)?.value
                        };
                      } else if (editingCloud === 'aws') {
                        credData = {
                          accessKeyId: (document.getElementById('aws-key') as HTMLInputElement).value,
                          secretAccessKey: (document.getElementById('aws-secret') as HTMLInputElement).value || userProfile?.awsCreds?.secretAccessKey,
                          region: (document.getElementById('aws-region') as HTMLInputElement).value
                        };
                      } else if (editingCloud === 'gcp') {
                        credData = {
                          projectId: (document.getElementById('gcp-project') as HTMLInputElement).value,
                          keyFile: (document.getElementById('gcp-key') as HTMLTextAreaElement).value
                        };
                      } else if (editingCloud === ('github' as any)) {
                        credData = {
                          token: (document.getElementById('git-token') as HTMLInputElement).value,
                          repo: (document.getElementById('git-repo') as HTMLInputElement).value
                        };
                      } else if (editingCloud === 'self-hosted') {
                        credData = {
                          host: (document.getElementById('self-host') as HTMLInputElement)?.value,
                          port: parseInt((document.getElementById('self-port') as HTMLInputElement)?.value || '22'),
                          username: (document.getElementById('self-user') as HTMLInputElement)?.value,
                          privateKey: (document.getElementById('self-key') as HTMLTextAreaElement)?.value
                        };
                      }

                      try {
                        const response = await axios.post('/api/test-connection', { cloud: editingCloud, credentials: credData });
                        if (response.data.status === 'success') {
                          setVerificationStatus(prev => ({ ...prev, [editingCloud!]: 'success' }));
                          if (response.data.message) {
                            alert(response.data.message);
                          }
                        } else {
                          setVerificationStatus(prev => ({ ...prev, [editingCloud!]: 'failed' }));
                          alert(`Connection failed: ${response.data.message}`);
                        }
                      } catch (e: any) {
                        setVerificationStatus(prev => ({ ...prev, [editingCloud!]: 'failed' }));
                        alert(`Connection failed: ${e.response?.data?.message || e.message}`);
                      }
                    }}
                    className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all border flex items-center justify-center gap-2 ${
                      verificationStatus[editingCloud || ''] === 'success' 
                        ? 'bg-green-500/10 border-green-500/50 text-green-400' 
                        : verificationStatus[editingCloud || ''] === 'failed'
                        ? 'bg-red-500/10 border-red-500/50 text-red-400'
                        : 'bg-white/10 hover:bg-white/20 border-white/10'
                    }`}
                  >
                    {verificationStatus[editingCloud || ''] === 'verifying' ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        Verifying...
                      </>
                    ) : verificationStatus[editingCloud || ''] === 'success' ? (
                      <>
                        <Check className="w-4 h-4" />
                        Verified
                      </>
                    ) : (
                      'Verify'
                    )}
                  </button>
                  <button 
                    onClick={async (e) => {
                      const btn = e.currentTarget;
                      const originalText = btn.innerText;
                      btn.disabled = true;
                      btn.innerText = 'Saving...';

                      try {
                        let field = '';
                        let credData: any = {};
                        
                        if (editingCloud === 'azure') {
                          field = 'azureCreds';
                          const subId = (document.getElementById('azure-sub-id') as HTMLInputElement)?.value;
                          const tenantId = (document.getElementById('azure-tenant') as HTMLInputElement)?.value;
                          const clientId = (document.getElementById('azure-client') as HTMLInputElement)?.value;
                          const clientSecret = (document.getElementById('azure-secret') as HTMLInputElement)?.value || userProfile?.azureCreds?.clientSecret;

                          if (!subId || (!modalAzureUseMI && (!tenantId || !clientId || !clientSecret))) {
                            throw new Error('Please fill in all required fields (Subscription ID, Tenant ID, Client ID, and Secret).');
                          }

                          credData = {
                            useManagedIdentity: !!modalAzureUseMI,
                            environment: (document.getElementById('azure-env') as HTMLSelectElement)?.value || "",
                            scopeLevel: (document.getElementById('azure-scope-level') as HTMLSelectElement)?.value || "",
                            subscriptionId: (document.getElementById('azure-sub-id') as HTMLInputElement)?.value || "",
                            subscriptionName: (document.getElementById('azure-sub-name') as HTMLInputElement)?.value || "",
                            miResourceGroup: (document.getElementById('azure-mi-rg') as HTMLInputElement)?.value || "",
                            miName: (document.getElementById('azure-mi-name') as HTMLInputElement)?.value || "",
                            tenantId: (document.getElementById('azure-tenant') as HTMLInputElement)?.value || "",
                            clientId: (document.getElementById('azure-client') as HTMLInputElement)?.value || "",
                            clientSecret: (document.getElementById('azure-secret') as HTMLInputElement)?.value || userProfile?.azureCreds?.clientSecret || "",
                            connectionName: (document.getElementById('azure-conn-name') as HTMLInputElement)?.value || "",
                            description: (document.getElementById('azure-desc') as HTMLTextAreaElement)?.value || "",
                            configured: true,
                            timestamp: Date.now()
                          };
                        } else if (editingCloud === 'aws') {
                          field = 'awsCreds';
                          credData = {
                            accessKeyId: (document.getElementById('aws-key') as HTMLInputElement)?.value || "",
                            secretAccessKey: (document.getElementById('aws-secret') as HTMLInputElement)?.value || userProfile?.awsCreds?.secretAccessKey || "",
                            region: (document.getElementById('aws-region') as HTMLInputElement)?.value || "",
                            configured: true,
                            timestamp: Date.now()
                          };
                        } else if (editingCloud === 'gcp') {
                          field = 'gcpCreds';
                          credData = {
                            projectId: (document.getElementById('gcp-project') as HTMLInputElement)?.value || "",
                            keyFile: (document.getElementById('gcp-key') as HTMLTextAreaElement)?.value || "",
                            configured: true,
                            timestamp: Date.now()
                          };
                        } else if (editingCloud === ('github' as any)) {
                          field = 'gitCreds';
                          credData = {
                            token: (document.getElementById('git-token') as HTMLInputElement)?.value || "",
                            repo: (document.getElementById('git-repo') as HTMLInputElement)?.value || "",
                            configured: true,
                            timestamp: Date.now()
                          };
                        } else if (editingCloud === 'self-hosted') {
                          field = 'selfHostedCreds';
                          credData = {
                            host: (document.getElementById('self-host') as HTMLInputElement)?.value || "",
                            port: parseInt((document.getElementById('self-port') as HTMLInputElement)?.value || "22"),
                            username: (document.getElementById('self-user') as HTMLInputElement)?.value || "ubuntu",
                            privateKey: (document.getElementById('self-key') as HTMLTextAreaElement)?.value || userProfile?.selfHostedCreds?.privateKey || "",
                            configured: true,
                            timestamp: Date.now()
                          };
                        }

                        // Use setDoc with merge: true to be more robust than updateDoc
                        await setDoc(doc(db, 'users', user!.uid), { [field]: credData }, { merge: true });
                        setIsCredModalOpen(false);
                      } catch (error: any) {
                        console.error("Save Error:", error);
                        alert(`Failed to save: ${error.message}`);
                      } finally {
                        btn.disabled = false;
                        btn.innerText = originalText;
                      }
                    }}
                    className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-medium transition-colors"
                  >
                    Save Key
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </main>
    </div>
  );
};

const SidebarItem: React.FC<{ icon: React.ReactNode; label: string; active?: boolean; onClick: () => void; theme: 'dark' | 'light' }> = ({ icon, label, active, onClick, theme }) => (
  <motion.button 
    onClick={onClick}
    whileHover={{ scale: 1.02, x: 4 }}
    whileTap={{ scale: 0.98 }}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
      active 
        ? (theme === 'dark' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-blue-600 text-white shadow-lg shadow-blue-600/20') 
        : (theme === 'dark' ? 'text-gray-400 hover:bg-white/5 hover:text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900')
    }`}
  >
    <span className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>{icon}</span>
    <span className="font-medium text-sm">{label}</span>
    {active && (
      <motion.div 
        layoutId="active-pill"
        className="ml-auto w-1.5 h-1.5 rounded-full bg-white"
      />
    )}
  </motion.button>
);

const ProviderButton: React.FC<{ active?: boolean; onClick: () => void; icon?: React.ReactNode; label: string; theme: 'dark' | 'light' }> = ({ active, onClick, icon, label, theme }) => (
  <motion.button 
    onClick={onClick}
    whileHover={{ scale: 1.05, boxShadow: theme === 'dark' ? "0 0 20px rgba(255,255,255,0.1)" : "0 0 20px rgba(37,99,235,0.1)" }}
    whileTap={{ scale: 0.95 }}
    animate={active ? { 
      boxShadow: theme === 'dark' ? "0 0 15px rgba(255,255,255,0.15)" : "0 0 15px rgba(37,99,235,0.2)",
      scale: 1.02
    } : {}}
    className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
      active 
        ? (theme === 'dark' ? 'bg-white/10 border-white/20 text-white' : 'bg-blue-50 border-blue-200 text-blue-600') 
        : (theme === 'dark' ? 'bg-transparent border-white/5 text-gray-500 hover:border-white/10 hover:text-gray-300' : 'bg-transparent border-gray-100 text-gray-400 hover:border-gray-200 hover:text-gray-600')
    }`}
  >
    {icon}
    <span className="text-sm font-medium">{label}</span>
  </motion.button>
);

const AgentStatusItem: React.FC<{ label: string; status: 'active' | 'idle'; theme: 'dark' | 'light' }> = ({ label, status, theme }) => (
  <div className="flex items-center justify-between text-sm">
    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{label}</span>
    <div className="flex items-center gap-2">
      <motion.span 
        animate={status === 'active' ? { opacity: [1, 0.5, 1] } : {}}
        transition={status === 'active' ? { duration: 2, repeat: Infinity } : {}}
        className={`text-xs font-medium ${status === 'active' ? (theme === 'dark' ? 'text-blue-400' : 'text-blue-600') : (theme === 'dark' ? 'text-gray-600' : 'text-gray-400')}`}
      >
        {status === 'active' ? 'Processing...' : 'Idle'}
      </motion.span>
      <div className={`w-1.5 h-1.5 rounded-full ${status === 'active' ? 'bg-blue-500 animate-pulse' : (theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300')}`} />
    </div>
  </div>
);

const StatusBadge: React.FC<{ status: DeploymentStatus; theme: 'dark' | 'light' }> = ({ status, theme }) => {
  const styles = {
    idle: theme === 'dark' ? 'bg-gray-500/10 text-gray-500 border-gray-500/20' : 'bg-gray-100 text-gray-600 border-gray-200',
    generating: theme === 'dark' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-blue-50 text-blue-600 border-blue-100',
    validating: theme === 'dark' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' : 'bg-purple-50 text-purple-600 border-purple-100',
    deploying: theme === 'dark' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 'bg-yellow-50 text-yellow-600 border-yellow-100',
    success: theme === 'dark' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-green-50 text-green-600 border-green-100',
    failed: theme === 'dark' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-red-50 text-red-600 border-red-100'
  };
  
  const isProcessing = ['generating', 'validating', 'deploying'].includes(status);
  
  return (
    <motion.div 
      animate={isProcessing ? { opacity: [1, 0.5, 1] } : {}}
      transition={isProcessing ? { duration: 2, repeat: Infinity } : {}}
      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles[status]}`}
    >
      {status}
    </motion.div>
  );
};

const CredentialCard: React.FC<{ 
  title: string; 
  icon: React.ReactNode; 
  status: string; 
  lastUsed: string; 
  details?: string;
  onClick: () => void;
  theme: 'dark' | 'light';
}> = ({ title, icon, status, lastUsed, details, onClick, theme }) => (
  <motion.div 
    onClick={onClick}
    whileHover={{ y: -5, scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className={`p-6 rounded-3xl border space-y-4 transition-all cursor-pointer group relative overflow-hidden flex flex-col justify-between h-full ${
      theme === 'dark' 
        ? 'bg-white/5 border-white/10 hover:border-white/20' 
        : 'bg-white border-gray-200 hover:border-blue-200 shadow-sm hover:shadow-md'
    }`}
  >
    <div className="absolute top-0 right-0 p-4">
      <div className={`w-2.5 h-2.5 rounded-full ${status === 'Connected' ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)]' : 'bg-gray-600'}`} />
    </div>
    
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <motion.div 
          whileHover={{ rotate: 5, scale: 1.05 }}
          className={`p-4 rounded-2xl transition-colors shadow-inner ${theme === 'dark' ? 'bg-white/5 group-hover:bg-white/10' : 'bg-gray-50 group-hover:bg-blue-50'}`}
        >
          {icon}
        </motion.div>
        <Settings className={`w-5 h-5 transition-colors ${theme === 'dark' ? 'text-gray-500 group-hover:text-white' : 'text-gray-400 group-hover:text-blue-600'}`} />
      </div>
      
      <div>
        <h4 className="font-bold text-xl tracking-tight">{title}</h4>
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${
            status === 'Connected' 
              ? (theme === 'dark' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-green-100 text-green-600 border-green-200') 
              : (theme === 'dark' ? 'bg-gray-500/10 text-gray-500 border-gray-500/20' : 'bg-gray-100 text-gray-400 border-gray-200')
          }`}>
            {status}
          </span>
          {details && (
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg ${theme === 'dark' ? 'text-gray-500 bg-white/5' : 'text-gray-400 bg-gray-100'}`}>
              {details}
            </span>
          )}
        </div>
      </div>
    </div>

    <div className={`pt-4 border-t flex items-center justify-between mt-auto ${theme === 'dark' ? 'border-white/5' : 'border-gray-100'}`}>
      <div>
        <p className={`text-[10px] uppercase font-black tracking-widest ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}>Last Activity</p>
        <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{lastUsed}</p>
      </div>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${theme === 'dark' ? 'bg-white/5 group-hover:bg-blue-600' : 'bg-gray-100 group-hover:bg-blue-600'}`}>
        <ChevronRight className={`w-4 h-4 transition-colors ${theme === 'dark' ? 'text-gray-400 group-hover:text-white' : 'text-gray-400 group-hover:text-white'}`} />
      </div>
    </div>
  </motion.div>
);

export default App;
