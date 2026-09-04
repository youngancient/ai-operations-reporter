# Koya Vantage - AI Operations Reporter

Koya Vantage is an executive-level, AI-driven operations dashboard built to aggregate, analyze, and beautifully present cross-departmental KPI metrics. It is designed to consume data from a centralized backend pipeline (n8n + Supabase) and uses Claude AI to provide actionable intelligence, risk assessments, and executive summaries.

## 🚀 Tech Stack

- **Framework:** Next.js 15 (App Router, Server Components)
- **Styling:** Tailwind CSS (Minimalist, modern, executive aesthetic)
- **Database / Realtime:** Supabase (PostgreSQL + WebSockets)
- **Data Pipeline & AI Orchestration:** n8n (Webhooks, Data Transformation, Claude AI integration)
- **UI Components:** Sonner (Toast notifications), Lucide React (Icons)

## ✨ Key Features

- **Intelligent Metric Grouping:** Dynamically groups related metrics (e.g., Revenue by Lead Source) into single, unified cards with clean breakdown lists. Automatically handles new data sources without hardcoding.
- **Actionable AI Intelligence:** Dedicated panels for Executive Summaries, Risk & Anomaly detection, and Recommended Actions powered by AI analysis of the raw metrics.
- **Non-Intrusive Realtime Sync:** Subscribes to Supabase `postgres_changes` via WebSockets. Instead of jarring "rug-pull" page refreshes, it presents a polite, sticky toast letting the executive know new data is ready to be viewed.
- **Race-Condition Safe "Rerun":** Heavy pipeline executions gracefully block the UI with progressive loading states while safely absorbing any straggling WebSocket events to prevent duplicate notifications.
- **Custom Date Ranges:** Fully supports standard periods (Last 30 Days, YTD) alongside a UX-optimized native calendar picker for custom range generation.

## ⚙️ Environment Setup

Create a `.env.local` file in the root of your project with the following variables:

```env
# Authentication
EXECUTIVE_PASSWORD=your_secure_dashboard_password

# Supabase (Realtime & Data Fetching)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# n8n Pipeline
# NOTE: Use the Production Webhook URL, and ensure the workflow is active in n8n.
# The webhook node MUST be configured to "Respond: When Last Node Finishes".
N8N_WEBHOOK_URL
```

## 🛠️ Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser. You will be prompted to enter the `EXECUTIVE_PASSWORD` to view the dashboard.

## 🗄️ Database Schema Expectations

The dashboard expects data to be populated in the following Supabase tables:
- `metrics`: Standard KPI numeric data (e.g., `metric_name`, `metric_value`, `department`).
- `ai_insights`: Textual analysis provided by Claude (e.g., `insight_type`, `content`, `confidence`).
- `data_quality_warnings`: Issues detected during pipeline ingestion (e.g., missing data, anomalies).
- `workflow_runs`: Logs of the n8n pipeline executions to track data freshness.

*Note: Ensure "Realtime" is enabled on all the above tables in your Supabase dashboard for the frontend WebSocket listener to function correctly.*
