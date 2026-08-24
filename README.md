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
- `dashboard.html` — every job, status, and progress (Owner / PC view)
- `job.html?id=...` — one job's task list, mark tasks completed
- `new-job.html` — create a job from a product template (not built yet)
- `purchase.html` — purchase targets per job (not built yet)
- `my-tasks.html` — a supervisor's own assigned tasks (not built yet)

## Database

Schema lives in Supabase project `ref-conveyors-pm-tool` (ap-south-1). Core
tables: `profiles`, `product_types`, `task_templates`, `jobs`, `job_tasks`,
`purchase_items`. `task_templates` for "Flat Belt Conveyor" is seeded from
the company's real job card sheet — other product types are still awaiting
their templates.

## First-time setup

1. Go to `signup.html` and create the first account (role: Owner).
2. If sign-in fails right after signup, "Confirm email" may be switched on
   for this Supabase project — turn it off under Authentication → Providers
   → Email in the Supabase dashboard for now (internal tool, known users).
