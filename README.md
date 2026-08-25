# Ref Conveyors — Project Management & Job Card System

Internal tool tracking job cards from design through dispatch — one place to
see every job's status, root-cause delays, and per-task progress.

## Stack

- Plain HTML/CSS/JS, no build step — served directly by GitHub Pages from `main`.
- [Supabase](https://supabase.com) — Postgres database, auth, and (later) storage.
- Live at: https://pm.refconveyors.net

## Pages

- `index.html` — sign in
- `signup.html` — create an account (first-time setup)
- `dashboard.html` — every job, status, and progress (Owner / PC view); the
  "+ New Project" button opens a modal that creates a job from a product
  template — there's no separate new-job page
- `job.html?id=...` — one job's task list, mark tasks completed
- `purchase.html` — purchase targets per job (not built yet)
- `my-tasks.html` — a supervisor's own assigned tasks (not built yet)
- `settings.html` — Supervisors tab (add/remove supervisors, backed by the
  `supervisors` table) and Job No. Prefixes tab (edit each product type's
  job-number prefix)

## Job numbers

Job numbers are generated automatically, not typed in — the New Project
modal has no Job No. field. On submit it calls the `next_job_no(product_type_id)`
Postgres function (security definer, atomic via an update...returning on
`product_types.next_seq`), which returns `<prefix>-0001`-style numbers using
each product type's `code_prefix` (editable on the Settings → Job No.
Prefixes tab). Current prefixes: Flat Belt Conveyor → BLC, CW Lift → CWL,
Drum Lift → DWL, Overhead Conveyor → OHC.

## Database

Schema lives in Supabase project `ref-conveyors-pm-tool` (ap-south-1). Core
tables: `profiles`, `product_types`, `task_templates`, `jobs`, `job_tasks`,
`purchase_items`, `supervisors`. `task_templates` for "Flat Belt Conveyor" is
seeded from the company's real job card sheet — other product types are
still awaiting their templates. `jobs.supervisor_id` references
`supervisors`, not `profiles` — supervisors are a simple name list managed
from Settings, separate from login accounts.

## First-time setup

1. Go to `signup.html` and create the first account (role: Owner).
2. If sign-in fails right after signup, "Confirm email" may be switched on
   for this Supabase project — turn it off under Authentication → Providers
   → Email in the Supabase dashboard for now (internal tool, known users).
