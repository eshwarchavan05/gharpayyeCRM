# 🏠 Gharpayy CRM — Full Stack Lead Management System

A production-style CRM dashboard for PG/Real Estate reservation startups. Built with React + Vite + Tailwind CSS (frontend) and Node.js + Express + MongoDB (backend).

---

## ✨ Features

- **Operations Dashboard** — Live lead queue ranked by priority (HOT/WARM/COLD)
- **Lead Management** — Full CRUD table with search, filters & pagination
- **Kanban Pipeline** — Drag-and-drop across New → Contacted → Visit Scheduled → Negotiation → Booked → Lost
- **Visit Scheduling** — Schedule PG tours, assign agents, track overdue visits
- **Calendar View** — Monthly calendar with visit & lead events
- **Analytics** — Charts for leads, bookings, agent performance, source breakdown
- **Outreach** — Bulk WhatsApp/SMS/Email campaigns with lead selection
- **Supply Hub** — Property inventory with availability tracking
- **Marketplace** — Integrations marketplace (WhatsApp, IndiaMART, Razorpay, etc.)
- **Inbox** — Prioritized action items with resolve/archive
- **Theme System** — Dynamic Light & Dark Mode with modern SaaS UI constraints
- **JWT Authentication** — Login, Signup, protected routes, secure role-based access control (RBAC)
- **Demo Mode** — Works without MongoDB using realistic mock data

---

## 🚀 Quick Start

### Option 1: Single HTML File (Demo — No setup needed)
Open `GharpayyeCRM.html` in any browser. Works instantly with mock data.

### Option 2: Full Stack (with live backend + MongoDB)

**Prerequisites:** Node.js 18+, MongoDB (local or Atlas)

```bash
# 1. Clone / extract the project
cd gharpayy-crm

# 2. Install dependencies
cd server && npm install
cd ../client && npm install

# 3. Configure backend (edit server/.env)
#    Set MONGO_URI to your MongoDB connection string

# 4. Start both servers
cd ..
bash start.sh
```

Open: **http://localhost:5173**

---

## 🔐 Demo Login

Use the **"Demo Login"** button on the login screen — no credentials needed.

Or create your own account via `/signup`.

---

## 📁 Project Structure

```
gharpayy-crm/
├── GharpayyeCRM.html          # ← Single-file demo (open this!)
├── start.sh                   # Start both servers
│
├── client/                    # React frontend
│   ├── src/
│   │   ├── App.jsx            # Router + routes
│   │   ├── components/
│   │   │   ├── layout/        # Sidebar, Navbar, Layout
│   │   │   └── common/        # LeadRow, StatCard, Modals, ProtectedRoute
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx  # Today / operations view
│   │   │   ├── Leads.jsx      # Full leads table
│   │   │   ├── Pipeline.jsx   # Kanban board
│   │   │   ├── Schedule.jsx   # Visit scheduling
│   │   │   ├── CalendarPage.jsx
│   │   │   ├── Analytics.jsx  # Recharts dashboard
│   │   │   ├── Outreach.jsx   # Campaign sender
│   │   │   ├── SupplyHub.jsx  # Property inventory
│   │   │   ├── Marketplace.jsx
│   │   │   ├── Inbox.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Signup.jsx
│   │   ├── context/           # AuthContext (JWT + user state)
│   │   ├── services/          # Axios API client
│   │   └── utils/             # mockData, helpers
│
└── server/                    # Node.js backend
    ├── index.js               # Express app entry
    ├── models/
    │   ├── User.js            # { name, email, password, role }
    │   ├── Lead.js            # Full lead model with scoring
    │   └── Visit.js           # Visit scheduling model
    ├── routes/
    │   ├── auth.js            # POST /signup, POST /login
    │   ├── leads.js           # CRUD + /stats
    │   ├── visits.js          # CRUD visits
    │   └── users.js           # List/create agents
    └── middleware/
        └── auth.js            # JWT verification + adminOnly
```

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Create account |
| POST | `/api/auth/login` | Get JWT token |
| GET | `/api/leads` | List leads (with filters) |
| POST | `/api/leads` | Create lead |
| PUT | `/api/leads/:id` | Update lead |
| DELETE | `/api/leads/:id` | Delete lead |
| GET | `/api/leads/stats` | Analytics data |
| GET | `/api/visits` | List visits |
| POST | `/api/visits` | Schedule visit |
| PUT | `/api/visits/:id` | Update visit status |
| GET | `/api/users` | List team members |
| POST | `/api/users` | Create user (admin) |

---

## 🎨 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS |
| Routing | React Router v6 |
| Animations | Framer Motion |
| Charts | Recharts |
| Icons | Lucide React |
| Notifications | React Hot Toast |
| HTTP | Axios |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |

---

## 🏗️ MongoDB Atlas Setup

1. Create a free cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create a database user
3. Whitelist your IP (or 0.0.0.0/0 for all)
4. Copy connection string into `server/.env`:
   ```
   MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/gharpayy_crm
   ```

---

## 🔒 Role-Based Access

| Feature | Agent | Admin |
|---------|-------|-------|
| View own leads | ✅ | ✅ |
| View all leads | ❌ | ✅ |
| Add/edit leads | ✅ | ✅ |
| Delete leads | ❌ | ✅ |
| Manage agents | ❌ | ✅ |
| Analytics | ❌ | ✅ |
| Schedule visits | ✅ | ✅ |

---

Built for **Gharpayy · Arena Infrastructure** 🏠
