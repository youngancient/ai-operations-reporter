Recommended Tech Stack & Infrastructure
This dashboard is highly data-driven and relies on secure database reads. The following stack is recommended for performance, security, and developer velocity:

Core Framework: Next.js (App Router).

Why: Allows for Server-Side Rendering (SSR) of the standard metrics via React Server Components. This means the dashboard loads instantly with data already populated, avoiding cascading loading spinners on initial page load.

CORS Solution: Next.js Route Handlers (/app/api/generate-report/route.ts) act as a secure proxy. The frontend calls the Next.js API, and the Next.js API securely POSTs to the n8n webhook, completely bypassing browser CORS restrictions.

Database Client: @supabase/ssr

Why: The official Next.js package for Supabase. It safely handles cookies and server-side fetching, working seamlessly with Postgres Row Level Security (RLS).

Styling & UI Components: Tailwind CSS paired with shadcn/ui.

Why: Provides highly customizable, accessible components (date pickers, metric cards, data tables) without the bloat of heavy component libraries.

Data Visualization: Recharts

Why: A composable charting library built on React components, perfect for rendering the historical trend data from the metrics table.

3. UI/UX & Design Guidelines
Because this dashboard presents dense analytical data and AI insights, clarity and typographic hierarchy are the top priorities.

Primary Typography: Plus Jakarta Sans

Usage: Use for all headings, metric numbers, and UI labels.

Developer Note: Enable tabular-nums in Tailwind (font-variant-numeric: tabular-nums) for the metric values. This ensures that numbers align perfectly vertically in tables and don't physically "jitter" when live data updates.

Secondary Typography (Optional): Inter or Roboto (for dense paragraph text in the ai_insights content where readability at small sizes is critical).

Semantic Trend Colors:
The Claude AI node outputs specific enum values for trends. The UI must map these strictly to a semantic color palette:

improved: Emerald/Green (e.g., Tailwind text-emerald-600) — Note: Map this to the context. A higher win rate is green, but a higher time-to-hire might need to be red.

declined: Rose/Red (e.g., Tailwind text-rose-600)

stable: Slate/Gray (e.g., Tailwind text-slate-500)

insufficient_data: Amber/Yellow (e.g., Tailwind text-amber-500)

Loading States (Critical UX):
Because a custom n8n webhook run takes 4 to 37 seconds, a simple spinner is not enough.

Use Skeleton Loaders mimicking the shape of the metric cards and insight panels.

Include a progressive status message (e.g., *"Fetching latest records..." → "Claude is analyzing trends...") to prevent users from abandoning the page, assuming it has frozen.