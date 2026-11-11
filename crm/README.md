# 🏠 Gharpayy CRM — Full Stack Lead Management System

A production-style CRM dashboard for PG/Real Estate reservation startups. Built with **React + Vite + Tailwind CSS** (frontend) and **Node.js + Express + MongoDB** (backend).

---

## 🌟 Architecture & Operating Modes

Gharpayy CRM operates with two cleanly separated, distinct modes:

### 1. 🚀 Direct Guest / Demo Mode (Default)
- **Zero-Barrier Access**: Opening the root URL `/` opens the Gharpayy CRM dashboard immediately.
- **No Login Wall**: Visitors can freely explore all CRM modules (Dashboard, Leads, Pipeline, Schedule, Calendar, Analytics, Inbox, Marketplace, Supply Hub, Outreach) using realistic PG/Real Estate mock data.
- **Offline & Backend Resilient**: Functions smoothly even when MongoDB or the backend server is offline.
- **Safe Sandbox**: In-memory demo updates never contaminate production user databases.

### 2. 🔐 Authenticated Live Mode (MongoDB + JWT)
- **Seamless Account Transition**: Visitors can open **Sign In** or **Register** at any time from the account section in the Sidebar or Navbar.
- **Real JWT Authentication**: Real user credentials securely hashed with `bcryptjs` and verified with HMAC-SHA256 JWT tokens.
- **Real Database Persistence**: Full CRUD persistence for leads, scheduled visits, and team agents directly in MongoDB.
- **Role-Based Access Control (RBAC)**: Secure access rules distinguishing Sales Agents and System Admins.
- **Easy Sign Out**: Logging out instantly returns the user to Guest Mode with clean state isolation.

---

## ✨ Modules & Features

- **Operations Dashboard** — Live lead queue ranked by priority (`HOT`, `WARM`, `COLD`) with live triage stats.
- **Lead Management** — Comprehensive CRUD directory with search, stage/location/agent filters, and pagination.
- **Kanban Pipeline** — Interactive board across stages (`New` → `Contacted` → `Visit Scheduled` → `Negotiation` → `Booked` → `Lost`).
- **Visit Scheduling** — Schedule PG tours, assign field agents, track upcoming & overdue visits.
- **Calendar View** — Monthly calendar mapping scheduled visits and lead tour dates.
- **Analytics & Trends** — Visualizations for lead growth, stage breakdown, acquisition sources, and field agent performance.
- **Outreach Hub** — Bulk campaign sender across WhatsApp, SMS, and Email.
- **Supply Hub** — PG inventory and bed availability tracker.
- **Marketplace** — Third-party integrations (IndiaMART, 99acres, MagicBricks, Razorpay).
- **Inbox** — Actionable task triage queue with resolve/archive capabilities.
- **Theme System** — Dynamic Light & Dark Mode with SaaS UI aesthetics.

---

## 🚀 Quick Start

### Option 1: Demo Exploration (Instant)
Simply open the web application at `/` or open `GharpayyeCRM.html` in any browser.

### Option 2: Full Stack Development (with live backend + MongoDB)

**Prerequisites:** Node.js 18+, MongoDB (local or Atlas cluster)

```bash
# 1. Install dependencies
cd server && npm install
cd ../client && npm install

# 2. Configure backend environment
# Edit server/.env (see server/.env.example)
# Set MONGO_URI=mongodb+srv://... and JWT_SECRET=...

# 3. Run automated test suite
cd ../server && npm test

# 4. Start servers
# Server on http://localhost:5000
npm run dev

# In another terminal: Client on http://localhost:5173
cd ../client
npm run dev
```

---

## ⚙️ Environment Variables

### Backend (`server/.env`)
| Variable | Description | Default |
|---|---|---|
| `PORT` | Backend port | `5000` |
| `MONGO_URI` | MongoDB connection URI | `mongodb://localhost:27017/gharpayy_crm` |
| `JWT_SECRET` | Secret key for JWT signing | `gharpayy_secret_2024` |
| `CLIENT_URL` | Allowed frontend origin for CORS | `http://localhost:5173` |

### Frontend (`client/.env`)
| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | Production backend API base URL (e.g. on Render/Vercel) | `/api` (uses Vite proxy locally) |

---

## 🌐 API Endpoints

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/health` | Health & database connectivity check | Public |
| POST | `/api/auth/signup` | Register real user account | Public |
| POST | `/api/auth/login` | Authenticate with credentials & receive JWT | Public |
| GET | `/api/auth/me` | Fetch authenticated user profile | Authenticated |
| GET | `/api/leads` | List leads (filtered by agent/status/location) | Authenticated |
| POST | `/api/leads` | Create new lead in database | Authenticated |
| PUT / PATCH | `/api/leads/:id` | Update lead details / stage | Authenticated |
| DELETE | `/api/leads/:id` | Delete lead | Admin Only |
| GET | `/api/leads/stats` | Pipeline & conversion analytics | Authenticated |
| GET | `/api/visits` | List scheduled property visits | Authenticated |
| POST | `/api/visits` | Schedule property visit | Authenticated |
| PUT / PATCH | `/api/visits/:id` | Update visit status (Completed/Cancelled) | Authenticated |
| DELETE | `/api/visits/:id` | Delete visit record | Admin Only |
| GET | `/api/users` | List team members | Authenticated |
| POST | `/api/users` | Add team member | Admin Only |

---

## 🔒 Role-Based Permissions

| Action | Sales Agent | System Admin | Guest Mode |
|---|:---:|:---:|:---:|
| Direct Demo Dashboard Access | ✅ | ✅ | ✅ |
| Explore CRM modules | ✅ | ✅ | ✅ |
| View assigned leads | ✅ | ✅ | ✅ (All demo leads) |
| View all leads | ❌ (Own assigned) | ✅ | ✅ |
| Add & update leads | ✅ | ✅ | ✅ (In-memory) |
| Delete leads | ❌ | ✅ | ✅ (In-memory) |
| Schedule visits | ✅ | ✅ | ✅ (In-memory) |
| Access Analytics | ❌ | ✅ | ✅ (Demo trends) |
| Save to MongoDB | ✅ | ✅ | ❌ |

---

## 🧪 Testing

Run backend validation, authentication, and endpoint security tests:
```bash
cd server
npm test
```

Build the production frontend bundle:
```bash
cd client
npm run build
```

---

Built for **Gharpayy · Arena Infrastructure** 🏠
