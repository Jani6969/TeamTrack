# TeamTrack – Weekly Team Reporting & Analytics Platform (Frontend)

TeamTrack is an enterprise-grade weekly team reporting, managerial review, and engineering analytics platform built with **Next.js (App Router)**, **React**, **TypeScript**, **Tailwind CSS**, and **Recharts**.

It interfaces directly with the Node.js/Express/MongoDB REST API backend to deliver a seamless SaaS workflow for engineers, team leads, and managers.

---

## 🌟 Key Features

### For Team Members (`TEAM_MEMBER`)
- **Interactive Multi-Section Report Builder:**
  - Section 1: Week start & end dates
  - Section 2: Project selector loaded from backend
  - Section 3: Dynamic tasks table (task name, priority, planned %, actual %, status, hours, deliverables)
  - Section 4: Planned goals for next week
  - Section 5: Blockers & challenges with "Key Issue" designation
  - Section 6: Achievements & wins with "Key Highlight" designation
  - Section 7: Hours worked breakdown (dev, testing, meetings, docs, other)
  - Section 8: Notes & demo URLs
- **Draft & Submission Controls:**
  - Save progress as `DRAFT` at any time without locking.
  - Submit with confirmation dialog &rarr; status updates to `SUBMITTED`.
- **Correction & Revision Workflow:**
  - Prominent amber alert when a report has `NEEDS_CORRECTION` status.
  - Direct display of the manager's feedback comment.
  - One-click "Edit & Resubmit" to address comments and return to `SUBMITTED`.
- **Personal Report History:**
  - Filterable by status and searchable by project/deliverable with clean pagination.

### For Engineering Managers (`MANAGER` / `ADMIN`)
- **Executive Analytics Dashboard:**
  - High-level KPIs: Total Reports Submitted, Submission Compliance Rate (%), Pending Review, Needs Correction, Approved, Open Blockers.
  - **4 Interactive Recharts Visualizations:**
    1. *Task Completion Trend* (Line chart over time)
    2. *Report Status by Team Member* (Stacked bar chart)
    3. *Workload by Project* (Horizontal bar chart)
    4. *Time Spent by Task Type* (Pie chart of dev, testing, meetings, docs, other)
  - **Real-Time Activity Feed:** Audit timeline of recent submissions, reviews, approvals, and revision requests.
- **Team Submissions Manager:**
  - Filter by status (`SUBMITTED`, `NEEDS_CORRECTION`, `APPROVED`), project, and employee.
  - Complete read-only inspection (managers cannot alter the developer's report content).
  - One-click **Approve Report** with optional approval note.
  - **Request Changes Modal** with mandatory feedback comment.
- **Team Directory & Member Profiles:**
  - Member submission compliance metrics and historical report archives.
- **Project & User Administration:**
  - Project CRUD (Name, description, active status).
  - User Directory and role adjustment (`TEAM_MEMBER` &harr; `MANAGER`).

### Global Features
- **Ask WorkPulse AI Floating Copilot:** Instant answering widget for reporting guidelines, sprint workload queries, and blocker highlights.
- **Role Guards & Route Security:** Prevents unauthorized URL access on the client while backend middleware enforces authoritative RBAC.
- **Responsive UI:** Tailored for desktop, laptop, tablet, and mobile with accessible sidebar drawers.

---

## 🛠 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS, Lucide React Icons
- **Charts:** Recharts
- **Forms & Validation:** React Hook Form, Zod
- **Networking:** Axios with JWT Bearer token interceptor
- **State Management:** React Context (`AuthContext`, `ToastContext`)

---

## 📂 Project Structure

```text
FrontEnd/
├── src/
│   ├── app/
│   │   ├── layout.tsx                    # Root layout with Auth & Toast providers
│   │   ├── page.tsx                      # Root entry & role-based redirect
│   │   ├── globals.css                   # Tailwind directives & custom animations
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx            # Login with quick-fill demo buttons
│   │   │   └── register/page.tsx         # User registration with validation
│   │   ├── dashboard/page.tsx            # Team member dashboard
│   │   ├── reports/
│   │   │   ├── page.tsx                  # My Reports list with filters & pagination
│   │   │   ├── new/page.tsx              # Multi-section weekly report builder
│   │   │   └── [id]/
│   │   │       ├── page.tsx              # Read-only document view + review history
│   │   │       └── edit/page.tsx         # Edit draft or revise needs-correction report
│   │   ├── manager/
│   │   │   ├── dashboard/page.tsx        # Manager analytics dashboard with 4 charts
│   │   │   ├── reports/
│   │   │   │   ├── page.tsx              # All team reports with filtering
│   │   │   │   └── [id]/review/page.tsx  # Manager review & decision station
│   │   │   └── team/
│   │   │       ├── page.tsx              # Team members directory
│   │   │       └── [id]/page.tsx         # Individual member profile & history
│   │   └── admin/
│   │       ├── projects/page.tsx         # Project CRUD management
│   │       └── users/page.tsx            # User directory & role assignment
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx               # Role-aware responsive navigation sidebar
│   │   │   ├── Header.tsx                # Header bar with user profile & mobile toggle
│   │   │   └── AppShell.tsx              # Layout wrapper with RoleGuard & AI Assistant
│   │   ├── ui/
│   │   │   ├── StatusBadge.tsx           # Badges for DRAFT, SUBMITTED, NEEDS_CORRECTION, APPROVED
│   │   │   ├── PriorityBadge.tsx         # Task priority and status badges
│   │   │   ├── StatCard.tsx              # Metric cards with icons and trend badges
│   │   │   ├── Modal.tsx                 # Accessible dialog component
│   │   │   ├── ConfirmDialog.tsx         # Action confirmation prompts
│   │   │   ├── Pagination.tsx            # Reusable page navigation
│   │   │   └── LoadingSkeleton.tsx       # Skeleton loaders for cards and tables
│   │   ├── reports/
│   │   │   └── ReportForm.tsx            # 8-section weekly report builder
│   │   ├── auth/
│   │   │   └── RoleGuard.tsx             # Client-side role route guard
│   │   └── ai/
│   │       └── AIAssistantModal.tsx      # Floating "Ask WorkPulse AI" copilot drawer
│   │
│   ├── context/
│   │   ├── AuthContext.tsx               # Auth state, login/logout, user session
│   │   └── ToastContext.tsx              # Toast alert notification system
│   ├── lib/
│   │   ├── api.ts                        # Axios instance with Bearer token interceptor
│   │   └── utils.ts                      # Date formatting & classNames merger
│   ├── services/
│   │   ├── authService.ts                # Auth API service
│   │   ├── reportService.ts              # Member report API service
│   │   ├── managerService.ts             # Manager review API service
│   │   ├── projectService.ts             # Projects API service
│   │   ├── dashboardService.ts           # Dashboard analytics API service
│   │   └── userService.ts                # Users & roles API service
│   └── types/
│       └── index.ts                      # Complete TypeScript definitions
│
├── .env.local                            # NEXT_PUBLIC_API_URL=http://localhost:5000/api
├── next.config.mjs                       # Next.js configuration
├── tailwind.config.ts                    # Tailwind theme customization
├── tsconfig.json                         # TypeScript configuration
└── package.json                          # Scripts & dependencies
```

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js** >= 18.0.0
- **TeamTrack Backend** running on `http://localhost:5000`

### 2. Installation
```bash
cd E:\TeamTrack\FrontEnd
npm install
```

### 3. Environment Variables
Verify or edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 4. Running Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 👥 Demo Test Accounts

You can log in manually or use the **Quick-Fill buttons** on the login page:

| Role | Email | Password | Allowed Access |
| :--- | :--- | :--- | :--- |
| **Manager** | `manager@example.com` | `Password123` | Manager Dashboard, Team Reports, Reviews, Projects, Users |
| **Team Member 1** | `member1@example.com` | `Password123` | Member Dashboard, My Reports, Report Builder, Resubmit |
| **Team Member 2** | `member2@example.com` | `Password123` | Member Dashboard, My Reports, Report Builder, Resubmit |

---

## 🔄 End-to-End Workflow Demonstration

```text
[Team Member: member1@example.com]
1. Navigate to /reports/new
2. Fill 8 sections -> Click "Save Draft" (Status: DRAFT)
3. Click "Submit Report" -> Confirm (Status: SUBMITTED)

[Manager: manager@example.com]
4. Log in -> /manager/dashboard displays updated KPIs & charts
5. Open /manager/reports -> Click "Review Now"
6. Click "Request Changes" -> Enter feedback -> Send (Status: NEEDS_CORRECTION)

[Team Member: member1@example.com]
7. Log in -> Dashboard shows prominent "Needs Correction" feedback banner
8. Open /reports/[id]/edit -> Revise actual hours / tasks
9. Click "Resubmit Report" (Status: SUBMITTED)

[Manager: manager@example.com]
10. Open /manager/reports/[id]/review -> Click "Approve Report" (Status: APPROVED)
11. Report is locked, deliverables signed off, and review audit trail saved!
```

---

## 🏗️ Production Build
```bash
npm run build
npm start
```
