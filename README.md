# AI Workforce Dashboard

> A real-time monitoring system for student-led project teams — built for coordinators who need visibility, not bureaucracy.

This is a full-stack web application with two separate portals: one for **admins** (faculty coordinators) and one for **students**. The idea is simple — coordinators get a live view of what every student is doing, and students have a clean workspace to log their activities. No approval chains. No bottlenecks. Just transparent monitoring.

---

## What This System Does

Rather than acting as an approval pipeline, this dashboard is purely a **monitoring and recording tool**. Here's the philosophy behind it:

- Students log their movements, leaves, and daily plans on their own
- Admins see everything in real time — attendance, active passes, project progress, leave records
- Status labels like *Active*, *Upcoming*, and *Past* are computed automatically from timestamps — not manually assigned
- Projects move to history when they hit 100% completion and an admin confirms it

---

## Portals at a Glance

### 🎓 Student Portal (`localhost:5173`)

What students can do:

| Page | Purpose |
|---|---|
| **Dashboard** | See today's attendance summary, active movement pass, current project status, and recent updates |
| **Daily Plan** | Log and view their day-wise activity schedule |
| **Weekly Calendar** | A visual overview of the week's planned sessions |
| **Movement Pass** | Create a pass for leaving the workspace (library, lab, IECC, etc.) and view their pass history |
| **P-Skills** | Track personal skill development progress across different tracks |
| **Attendance** | View their slot-by-slot attendance timeline for any given date |
| **Leave** | Log a leave record with dates, times, and reason — viewable by admins |
| **Profile** | View their own profile details |

---

### 👑 Admin Portal (`localhost:5174`)

What coordinators can see:

| Page | Purpose |
|---|---|
| **Dashboard** | High-level overview — today's attendance, active movement passes, project completion status, and live team updates |
| **Attendance** | Full daily attendance matrix for all students with slot-level breakdown |
| **Assign** | Create and manage team projects, assign tasks, and track completion rates. Projects automatically archive to history when marked complete at 100% |
| **Students** | Complete student roster with search, filters, and profile details |
| **Movement Pass** | View all active, upcoming, and expired movement passes across all students |
| **Leaves** | View all leave records with date range and reason — filtered by upcoming, active, or past |
| **Manage Admins** | Manage admin and faculty coordinator accounts |

---

## Tech Stack

```
apps/
├── backend/          Node.js + Express REST API
├── frontend/
│   ├── admin/        React (Vite) — Admin Portal
│   └── user/         React (Vite) — Student Portal

database/
├── schema/           SQL table definitions
├── migrations/       Schema change scripts
└── seeds/            Sample seed data
```

**Backend:**
- Node.js with Express-style routing
- PostgreSQL via `node-postgres` (`pg`)
- JWT authentication with role-based access (`ADMIN` / `STUDENT`)
- Timezone-aware date handling (IST/Asia Kolkata) throughout

**Frontend (both portals):**
- React 18 + Vite
- Vanilla CSS with a custom design system (no Tailwind dependency)
- Lucide icons
- `date-fns` for all date formatting and comparisons

---

## Getting Started

### Prerequisites

- Node.js v18+
- PostgreSQL running locally
- Three terminal windows (one for each service)

### 1. Set up the database

Create a PostgreSQL database and run the schema from `database/schema/`.

### 2. Configure environment variables

Create a `.env` file inside `apps/backend/`:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ai_workforce_dasboard
DB_USER=postgres
DB_PASSWORD=your_password_here
JWT_SECRET=your_jwt_secret_here
```

> ⚠️ Never commit this file. It's already in `.gitignore`.

### 3. Install dependencies

Run this from the project root, then inside each app:

```bash
# Backend
cd apps/backend
npm install

# Admin portal
cd apps/frontend/admin
npm install

# Student portal
cd apps/frontend/user
npm install
```

### 4. Start all three services

**Terminal 1 — Backend API:**
```bash
cd apps/backend
npm run dev
# Runs on http://localhost:5000
```

**Terminal 2 — Admin Portal:**
```bash
cd apps/frontend/admin
npm run dev
# Runs on http://localhost:5174
```

**Terminal 3 — Student Portal:**
```bash
cd apps/frontend/user
npm run dev
# Runs on http://localhost:5173
```

---

## How Status Labels Work

Status across the system (movement passes, leaves, projects) is always **computed from timestamps** — nothing is manually set by an admin:

| Status | Meaning |
|---|---|
| **Upcoming** | The record's start time is in the future |
| **Active** | Currently within the time window |
| **Past / Expired** | The end time has already passed |
| **Completed** | Project reached 100% and was confirmed by admin |

---

## Notable Technical Details

**Timezone handling** — PostgreSQL stores timestamps as UTC. The backend and frontend both apply IST (Asia/Kolkata) offsets explicitly so that dates don't accidentally shift at midnight for Indian users.

**Movement pass conflicts** — If a student tries to create a pass that overlaps with an existing one for the same day, the backend returns a `409 Conflict` before saving.

**Project completion flow** — When a team's overall task completion rate hits 100%, the admin sees a confirmation banner. Only after confirming does the project get archived to the completed history tab.

**No approval loops** — Leaves and movement passes are logged by students and visible to admins. There are no approval or rejection actions anywhere in the system by design.

---

## Project Structure (simplified)

```
apps/backend/src/
├── controllers/      Request handlers
├── routes/           API route definitions
├── services/         Business logic
├── repositories/     Database queries
├── middleware/        Auth & validation middleware
├── validators/        Input validation
└── db/               Database connection & config

apps/frontend/admin/src/
├── pages/            Dashboard, Attendance, Assign, Students, Passes, Leaves, Admins
├── components/       Shared UI components
└── services/         API call wrappers

apps/frontend/user/src/
├── pages/            Dashboard, DailyPlan, WeeklyCalendar, MovementPass, PSkills, Attendance, Leave, Profile
├── components/       Shared UI components
└── services/         API call wrappers
```

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

---

*Built for real coordinators managing real students — designed to give visibility without adding friction.*
