Frontend Integration Brief — AI Operations Reporter
1. Overview
The backend is an n8n pipeline that gathers Sales, Project Delivery, and People Ops data for a reporting period, computes metrics vs. the prior comparable period, has an LLM (Claude) write a trend analysis, and stores everything in a Supabase (Postgres) database.

The frontend has a clean read/write split:

Reads: query Supabase tables directly (this is 99% of the UI).
Writes/refresh: POST to an n8n orchestrator webhook to generate a new report.
The frontend and the workflow never talk directly — they meet at the database.

        reads (fast, direct)
Frontend ───────────────────────► Supabase (Postgres)
     │                                  ▲
     │ POST /ops-report (refresh)       │ writes
     ▼                                  │
 n8n Orchestrator ──► Reporter pipeline ┘
        ▲
 Weekly schedule (Mon 06:00) precomputes standard periods
2. Reading data (Supabase)
Use the Supabase JS client (@supabase/supabase-js) or the REST API. All report data is keyed by period and grouped per run via run_id.

Tables
Every table has a id uuid primary key. Most have created_at timestamptz default now() (row insert time).

metrics — KPI values (drives cards & charts)

id (uuid), created_at (timestamptz)
period_key, period_start (date), period_end (date)
department (nullable — set for per-department breakdowns, null for company-wide)
metric_name (e.g. sales.win_rate, delivery.blocked_projects, people_ops.time_to_hire_days)
metric_value (numeric)
run_id
Uniqueness: (period_start, period_end, metric_name, coalesce(department,'')). One current row per date range + metric + department; re-running the same range overwrites in place (idempotent). Not keyed by run_id.
ai_insights — narrative panels

id (uuid), created_at (timestamptz)
period_key, period_start, period_end
insight_type — one of: executive_summary, sales_trend, delivery_trend, people_ops_trend, risks_and_anomalies, recommended_actions
content (text) — see parsing note below
based_on_metrics (jsonb, nullable)
run_id
Uniqueness: (period_start, period_end, insight_type).
data_quality_warnings — data-issue badges/list

id (uuid), created_at (timestamptz)
period_key, period_start, period_end, source (nullable), record_id (nullable), issue, run_id
Uniqueness: (period_start, period_end, coalesce(source,''), coalesce(record_id,''), issue).
workflow_runs — run log / "last updated"

id (uuid)
run_id (unique), execution_id, status (default 'success'), run_timestamp (timestamptz)
reporting_period, period_start, period_end, warnings_count (integer)
raw_records — drill-down/detail

id (uuid), created_at (timestamptz)
source, source_record_id, record_date (date, nullable), department (nullable), data (jsonb), data_issues (text[]), run_id
Uniqueness: (source, source_record_id).
error_logs — pipeline failure log (written by the error-handler workflow, not the reporter)

id (uuid)
execution_id, workflow_name, execution_url, failed_node, error_message, error_timestamp (timestamptz)
Useful if you want to surface "last run failed" status in the UI.
Parsing note for ai_insights.content
executive_summary → plain text, render as-is.
sales_trend, delivery_trend, people_ops_trend → JSON string; JSON.parse to { trend, commentary }. trend is one of improved | declined | stable | insufficient_data.
risks_and_anomalies, recommended_actions → JSON string of a string array; JSON.parse to string[].
Period keys
Standard periods: period_key = last_30_days, last_90_days, or ytd.
Custom: period_key = custom_<start>_<end> (e.g. custom_2026-01-01_2026-03-31).
Typical read flow
Because metrics, ai_insights, and data_quality_warnings are keyed by date range (not by run_id), re-running a period overwrites the same rows — there is only ever one current row set per date range. So you generally do not need to look up a run_id first; just query by the period's date range (or period_key).

Resolve the date range for the period you want:
Standard periods: filter by period_key (last_30_days | last_90_days | ytd).
Custom: filter by period_start + period_end (or period_key = custom_<start>_<end>).
Load metrics, ai_insights, data_quality_warnings for that range and render.
Optional: use workflow_runs (filter by reporting_period, order by run_timestamp desc) for a "last updated" timestamp and run status.
Note: period_key for standard periods (e.g. last_30_days) maps to a rolling date range that shifts each week when the schedule reruns. If you filter by period_key you always get the newest range for that label; if you filter by an explicit period_start/period_end you get that specific historical range.

3. Triggering a report (refresh / custom range)
Most of the time the frontend just reads — the three standard periods are precomputed every Monday at 06:00 (see Section 4). Trigger a run only for a custom date range or a manual "refresh now" button.

Endpoint: POST https://pod1.app.n8n.cloud/webhook/ops-report
Body (standard):
{ "selected_period": "last_30_days" }
(last_30_days | last_90_days | ytd)
Body (custom):
{ "selected_period": "custom", "period_start": "2026-01-01", "period_end": "2026-03-31" }
Validation: selected_period must be one of the four values; custom requires both dates (ISO YYYY-MM-DD).
Response (on success):
{ "status": "ok", "message": "Report generated and stored", "period": "last_30_days" }
Timing
The webhook blocks until the pipeline finishes. Typical run time is ~4–37 seconds (recent runs ~13s), so a synchronous call with a spinner is fine. Set a client timeout of ~60s to be safe. After the status: ok response, re-query Supabase for that period to load the fresh data.

4. Data freshness & live updates
What the schedule updates
The weekly schedule (Mondays 06:00) refreshes exactly the three standard periods: last_30_days, last_90_days, ytd. It never generates custom — custom ranges only ever come from a frontend-triggered webhook call.

How the frontend stays current
The workflow only writes to Supabase; it cannot push to the frontend. Whether the UI reflects new data depends on the read strategy you choose:

a) Manual / on-load (simplest)
Query Supabase on page load or on a "refresh" click. If the Monday job updates the DB while a page is already open, the user won't see it until they reload. This is the default unless you add (b) or (c).

b) Polling
Re-query every N seconds/minutes (or check workflow_runs for a newer run_id) and re-render on change. Simple, works everywhere, slightly wasteful.

c) Supabase Realtime (true live updates — recommended)
Subscribe to table changes; Supabase pushes inserts/updates over a websocket the moment they land — no refresh needed.

supabase
  .channel('reports')
  .on('postgres_changes',
      { event: '*', schema: 'public', table: 'metrics' },
      payload => { /* refetch or update UI */ })
  .subscribe()
Recommendation
Weekly precompute: use Realtime (or light polling) so the dashboard updates on its own Monday morning with no user action.
User-triggered custom run: the frontend already knows it fired the request, so it can just re-query after the webhook returns ok. Realtime is a nice-to-have here, not required.
Realtime must be enabled per-table in the Supabase dashboard for the tables you want to subscribe to.
5. Things to sort out before go-live (backend side)
Security / RLS: RLS is enabled on all tables with a public read (SELECT using (true)) policy — anyone with the anon key can read all rows, and there are no insert/update/delete policies for the anon role (writes happen server-side via the workflow's service credentials). Confirm public-read is acceptable for your data; if any of it is sensitive, tighten these policies or read through a server-side proxy.
CORS: calling the n8n webhook from the browser needs CORS handling; often cleaner to POST from your own backend/edge function.
Activation: the orchestrator (webhook + weekly schedule) must be published/active for the endpoint and precompute to work. (Currently not active.)
Realtime enablement: if using Supabase Realtime, enable it on the relevant tables.
6. Open questions for the frontend dev
Which periods/views are in scope for v1 (standard only, or custom ranges too)?
Read directly from Supabase in the browser, or via your own backend?
Custom range: synchronous refresh (spinner, ~60s max) or an async pattern?
Live updates: manual, polling, or Realtime?