# CloudGenius AI

> **Agentic AI platform for generating, validating, estimating, diagramming, and deploying cloud infrastructure across Azure, AWS, and GCP using natural language.**

CloudGenius AI transforms natural language prompts into production-grade Infrastructure as Code (IaC) and executes real-world deployments directly against major Cloud Service Providers (CSPs). Powered by a coordinated 6-agent Gemini AI pipeline, it provides architectural design documents, dependency graphs, deployable IaC templates, interactive architecture diagrams, line-item cost estimations, and automated GitHub Actions CI/CD workflows.

---

## 🌟 Key Features

- **Multi-Cloud Support**: Deploy to **Microsoft Azure**, **Amazon Web Services (AWS)**, and **Google Cloud Platform (GCP)**.
- **Multiple IaC Formats**: Generate clean, modular code in **Terraform** (`.tf`), **Azure Bicep** (`.bicep`), **ARM Template JSON** (`.json`), or **Pulumi** (`.ts`).
- **Real Cloud Deployment Engine**: Direct server-side deployment to cloud APIs:
  - **Azure Resource Manager (ARM)**: Submits ARM templates directly via Azure SDK with support for Service Principal or Managed Identity authentication.
  - **AWS CloudFormation**: Provisions CloudFormation stacks directly using AWS SDK and STS verification.
  - **GCP Resource Manager**: Validates projects and prepares automated deployment scripts.
- **6-Agent Autonomous Pipeline**: Multi-agent collaboration handles solution consulting, planning, code generation, cost estimation, architecture diagramming, and CI/CD workflow generation.
- **Free Tier & Quota Optimization**: Built-in awareness of subscription limits, defaulting to basic/free SKUs (e.g., `B1`, `Standard_B1s`, `Standard_LRS`) to prevent quota rejections on free or trial accounts.
- **Granular Deployment Diagnostics**: On Azure deployment failures, the engine audits Azure Deployment Operations to report which resources succeeded and which failed, paired with actionable fix recommendations.
- **Interactive Visual Architecture Diagrams**: Generates Mermaid.js flowcharts rendered with official cloud service icons, interactive zoom/pan controls, and high-resolution (4K) PNG/JPEG downloads.
- **Cost Estimation & Excel Export**: Line-item monthly cost projections in USD with one-click export to Microsoft Excel (`.xlsx`).
- **GitHub Integration & CI/CD**: Push generated code directly to your GitHub repository and trigger GitHub Actions workflows with a single click.
- **Export Options**: Download IaC files packaged into a `.zip` archive containing a custom README, download Solution Design Documents in Markdown, and export cost spreadsheets.
- **Modern UI**: Full Dark/Light theme switching, reactive log streaming, toast alerts, and celebratory animations.

---

## 🤖 The Multi-Agent AI Pipeline

When you submit an infrastructure request (or consult the DevOps architect), CloudGenius AI orchestrates six specialized AI agents sequentially:

```
                  ┌───────────────────────────────┐
                  │      User Prompt / Intent     │
                  └──────────────┬────────────────┘
                                 │
                                 ▼
                   [Agent 1: Solution Consultant]
                   • Well-Architected alignment
                   • Service selection rationale
                   • Generates Solution Design (.md)
                                 │
                                 ▼
                   [Agent 2: Architecture Planner]
                   • Dependency graph mapping
                   • Quota & Free-tier constraints
                   • Step-by-step resource blueprint
                                 │
                                 ▼
                     [Agent 3: IaC Generator]
                   • Syntactically valid IaC
                   • Strict naming & parameters
                   • Azure ARM/Bicep/TF/Pulumi
                                 │
         ┌───────────────────────┼───────────────────────┐
         ▼                       ▼                       ▼
[Agent 4: Cost Estimator] [Agent 5: Diagram Agent] [Agent 6: Validation & CI/CD]
 • USD monthly estimate   • Mermaid.js flowchart   • Syntax & security audit
 • Line-item breakdown    • Official cloud icons   • GitHub Actions workflow
 • Excel spreadsheet      • 4K PNG/JPEG export     • Ready for automated apply
```

### Agent Roles

1. **Solution Consultant Agent**:
   - Analyzes business requirements and technical challenges.
   - Recommends services according to the AWS/Azure/GCP Well-Architected Framework.
   - Provides architecture strategy (serverless, microservices, hub-and-spoke) and official documentation references.
   - Generates an exportable **Solution Design Document** in Markdown.

2. **Senior Cloud Architect Planner Agent**:
   - Deconstructs requirements into a topological resource list.
   - Resolves dependencies (e.g., VNET -> Subnet -> Network Interface -> VM).
   - Enforces regional constraints and free-tier compatibility rules.

3. **IaC Generator Agent**:
   - Generates production-ready Terraform, Bicep, ARM JSON, or Pulumi code.
   - Injects required parameters with safe defaults.
   - Enforces CSP-specific naming rules (e.g., Key Vault 3-24 alphanumeric characters, lowercase alphanumeric storage account names with `uniqueString`).
   - Ensures explicit nested resource IDs (e.g., Private DNS Zone Virtual Network Links).

4. **Cloud Cost Estimator Agent**:
   - Computes estimated monthly recurring costs in USD.
   - Generates a per-service cost breakdown.
   - Exports formatted reports to `.xlsx` files.

5. **Architecture Diagram Agent**:
   - Creates a structured Mermaid.js flowchart with logical boundaries (Region, VPC, Subnets).
   - Embeds cloud service icons (AWS, Azure, GCP compute, storage, networking).
   - Supports interactive pan, zoom, and high-DPI image exports.

6. **Validation & CI/CD Agent**:
   - Validates generated templates for syntax errors and security best practices.
   - Automatically writes a turnkey GitHub Actions workflow (`.github/workflows/deploy.yml`) supporting `workflow_dispatch` and `push` triggers.

---

## ☁️ Supported Clouds & IaC Languages

| Feature / Platform | Microsoft Azure | Amazon Web Services | Google Cloud Platform |
| :--- | :--- | :--- | :--- |
| **Supported IaC** | Bicep, ARM, Terraform, Pulumi | CloudFormation, Terraform, Pulumi | Terraform, Pulumi |
| **Direct Deployment** | Real-time via Azure ARM SDK | CloudFormation Stack Deployment | Project verification & script runner |
| **Auth Methods** | Service Principal (Client Secret), Managed Identity | AWS Access Key + Secret (STS verification) | Service Account Key JSON |
| **Supported Clouds** | Global Azure, US Gov, China, Germany | Standard AWS Regions | Standard GCP Projects |
| **Auto-Conversion** | Automatic compilation to ARM JSON for deployment | CloudFormation template integration | Exportable Terraform modules |

---

## 🛡️ Free Tier & Quota Safeguards

To prevent deployments from failing on free Azure subscriptions or restricted accounts, CloudGenius AI includes automated quota intelligence:

- **Minimal SKU Defaults**:
  - **App Service**: Automatically selects `F1` (Free) or `B1` (Basic).
  - **Virtual Machines**: Defaults to `Standard_B1s` or `Standard_B2s` (burstable instances).
  - **Databases**: Uses `Basic` tier or smallest flexible server compute.
  - **Storage**: Uses `Standard_LRS` (Locally Redundant Storage).
  - **Kubernetes (AKS)**: Enforces minimum single-node clusters with small VM sizes to stay within vCPU limits, letting Azure pick default supported versions automatically.
- **Detailed Resource Audit on Failure**:
  If a deployment fails (for example, hitting a compute quota midway through), the backend calls the Azure Deployment Operations API:
  - Identifies and lists all resources that **succeeded** before the failure.
  - pinpoints the exact resource that failed and extracts deep error codes.
  - Displays contextual troubleshooting tips (e.g., expired client secrets, missing IAM Contributor permissions, naming length violations).

---

## 🏗️ Technical Architecture & Stack

### Frontend
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom Dark/Light modes
- **Animations**: `motion/react`, `lottie-react`, `canvas-confetti`
- **Diagrams**: `mermaid` with custom HTML icon rendering and `react-zoom-pan-pinch`
- **Exports**: `html-to-image` (high-DPI canvas capture), `xlsx` (Excel generation), `jszip` + `file-saver` (ZIP bundle generation)
- **UI Feedback**: `sonner` toast notifications

### Backend
- **Server**: Express.js running on Node.js / TypeScript (`server.ts`)
- **SDK Integrations**:
  - `@azure/identity` & `@azure/arm-resources` & `@azure/arm-resourcesdeployments`
  - `aws-sdk` (STS & CloudFormation)
  - `@google-cloud/resource-manager`
  - `octokit` (GitHub REST API)
- **AI Core**: `@google/genai` (Gemini Flash model)

### Database & Authentication
- **Authentication**: Firebase Authentication (Google Sign-In)
- **Database**: Cloud Firestore (stores user credentials securely in user profiles, along with deployment histories and real-time logs)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm** or **bun**
- **Gemini API Key**: For AI orchestration
- **Cloud Credentials** (Optional, for deploying live infrastructure):
  - Azure Service Principal (Client ID, Client Secret, Tenant ID, Subscription ID)
  - AWS IAM User (Access Key ID, Secret Access Key, Region)
  - GCP Service Account Key JSON

### Environment Variables Setup

Create a `.env` file in the root directory based on `.env.example`:

```env
# Gemini API Key (Required for AI generation)
GEMINI_API_KEY="your-gemini-api-key"

# Application URL (Auto-populated in cloud environments)
APP_URL="http://localhost:3000"
```

### Installation & Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server (runs full-stack Express + Vite on port 3000):
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

4. Build for production:
   ```bash
   npm run build
   ```

5. Run linting & type checks:
   ```bash
   npm run lint
   ```

---

## 🔑 Cloud Credentials Configuration

Navigate to the **Credentials** tab inside CloudGenius AI to configure access:

### Microsoft Azure
1. Register an application in **Microsoft Entra ID** (formerly Azure AD).
2. Create a **Client Secret** under *Certificates & secrets*.
3. Assign the **Contributor** role to your App Registration at the Subscription scope (*Subscriptions -> Access control (IAM) -> Add role assignment*).
4. In CloudGenius AI, input:
   - **Subscription ID**
   - **Tenant ID**
   - **Client ID**
   - **Client Secret**
   - Select Cloud Environment (**Azure Cloud**, **Azure US Government**, **Azure China**, or **Azure Germany**).
5. Click **Test Connection** to verify access before deploying.

### Amazon Web Services (AWS)
1. Create an IAM user in AWS with programmatic access.
2. Attach policies for `CloudFormationFullAccess` and required service creation permissions.
3. In CloudGenius AI, input:
   - **AWS Access Key ID**
   - **AWS Secret Access Key**
   - **Default Region** (e.g., `us-east-1`, `eu-west-1`)
4. Click **Test Connection** to run STS caller identity verification.

### Google Cloud Platform (GCP)
1. Create a Service Account in the Google Cloud Console.
2. Grant necessary roles (e.g., `Editor` or specific service admins).
3. Generate and download a Service Account Key in JSON format.
4. Paste the entire JSON file contents and enter your **Project ID**.

### GitHub Integration
1. Generate a **Personal Access Token (classic)** with `repo` and `workflow` scopes.
2. Enter your token and target repository (format: `owner/repo` or full URL).
3. Test connection to verify repository push and workflow dispatch access.

---

## 📁 Repository Structure

```
├── .env.example              # Environment variable definitions
├── firebase-blueprint.json   # Firestore database schema & collections
├── firestore.rules           # Firestore security rules
├── index.html                # Application entry HTML
├── metadata.json             # Applet metadata & permissions
├── package.json              # Dependencies & npm scripts
├── server.ts                 # Express backend, Cloud SDKs & deployment endpoints
├── src/
│   ├── App.tsx               # Primary UI: Multi-agent flow, tabs, diagrams & logs
│   ├── firebase.ts           # Firebase SDK initialization
│   ├── types.ts              # Global TypeScript interfaces & data models
│   ├── index.css             # Tailwind CSS entry point
│   ├── main.tsx              # React DOM entry point
│   └── components/
│       └── ErrorBoundary.tsx # React error boundary component
└── tsconfig.json             # TypeScript configuration
```

---

## 🔒 Security Best Practices

- **Zero Client-Side Secrets**: Cloud deployments, GitHub API requests, and credential tests execute on the Express backend (`server.ts`). Secret keys and tokens are never exposed in browser requests.
- **Firestore Security Rules**: User credentials and deployment histories are partitioned by `userId`, preventing unauthorized cross-user access.
- **Sanitized Naming**: Automatic generation of collision-free, randomized suffixes prevents predictable naming attacks and satisfies cloud provider uniqueness rules.
