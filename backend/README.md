# Weekly Report Generator & Team Dashboard - Backend API

A clean, simple, and maintainable RESTful API built with **Node.js**, **Express.js**, and **MongoDB (Mongoose)** for managing weekly team progress reports, reviews, and analytics dashboards.

Designed specifically to be clean, modular, and easy to explain during technical interviews without unnecessary abstractions or complex design patterns.

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Prerequisites & Installation](#prerequisites--installation)
5. [Environment Variables](#environment-variables)
6. [Database Setup & Seeding](#database-setup--seeding)
7. [Running the Server](#running-the-server)
8. [Testing & Verification](#testing--verification)
9. [Pre-Seeded Test Accounts](#pre-seeded-test-accounts)
10. [API Reference (Endpoint Table)](#api-reference-endpoint-table)
11. [Core Architecture & Interview Concepts](#core-architecture--interview-concepts)
    - [How JWT Authentication Works](#how-jwt-authentication-works)
    - [How `authMiddleware` Works](#how-authmiddleware-works)
    - [How `roleMiddleware` (RBAC) Works](#how-rolemiddleware-rbac-works)
    - [How Report Ownership Is Enforced](#how-report-ownership-is-enforced)
    - [How Report Status Transitions Work](#how-report-status-transitions-work)
    - [How the Correction & Review Workflow Works](#how-the-correction--review-workflow-works)
    - [How Pagination & Filtering Work](#how-pagination--filtering-work)
    - [How Dashboard Aggregations Work](#how-dashboard-aggregations-work)

---

## 🚀 Project Overview

The **Weekly Report Generator & Team Dashboard** allows team members to submit weekly engineering reports detailing completed tasks, planned work, deliverables, actual vs planned hours, and blockers. Engineering managers can review submissions, approve them, or request corrections with targeted feedback, as well as visualize team productivity trends on an analytical dashboard.

---

## 🛠 Tech Stack

- **Runtime:** Node.js (v18+)
- **Framework:** Express.js (v4.x)
- **Database:** MongoDB & Mongoose ODM
- **Authentication:** JSON Web Tokens (jsonwebtoken) & bcryptjs for password hashing
- **Validation:** express-validator
- **Security & Config:** cors, dotenv
- **Testing:** Jest & Supertest

---

## 📂 Project Structure

```text
backend/
│
├── src/
│   ├── config/
│   │   └── db.js                    # MongoDB Mongoose connection
│   │
│   ├── controllers/
│   │   ├── authController.js        # Register, login, me
│   │   ├── userController.js        # Manager user CRUD & role assignment
│   │   ├── reportController.js      # Member & manager report workflows
│   │   ├── projectController.js     # Project management
│   │   └── dashboardController.js   # Analytics & MongoDB aggregation queries
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js        # JWT extraction and req.user verification
│   │   ├── roleMiddleware.js        # Role-based access control (RBAC)
│   │   └── errorMiddleware.js       # Central error handling, 404, & validation
│   │
│   ├── models/
│   │   ├── User.js                  # User schema with bcrypt pre-save hook
│   │   ├── Project.js               # Project schema
│   │   ├── Report.js                # Weekly report schema with task items
│   │   └── Review.js                # Manager review & correction history
│   │
│   ├── routes/
│   │   ├── authRoutes.js            # /api/auth routes
│   │   ├── userRoutes.js            # /api/users routes (Manager only)
│   │   ├── reportRoutes.js          # /api/reports & /api/manager/reports
│   │   ├── projectRoutes.js         # /api/projects routes
│   │   └── dashboardRoutes.js       # /api/dashboard routes (Manager only)
│   │
│   ├── utils/
│   │   └── generateToken.js         # JWT signing helper
│   │
│   ├── seed/
│   │   └── seedData.js              # Database seeder with realistic test data
│   │
│   └── app.js                       # Express app configuration & middleware
│
├── tests/
│   └── rbac.test.js                 # Automated tests for RBAC & report ownership
│
├── server.js                        # Server entry point
├── package.json                     # Scripts & dependencies
├── .env.example                     # Environment template
├── .env                             # Local environment variables
└── README.md                        # Documentation
```

---

## 📦 Prerequisites & Installation

### 1. Prerequisites
- **Node.js** installed (`node -v` >= 18)
- **MongoDB** running locally on port 27017, or a MongoDB Atlas connection URI.

### 2. Install Dependencies
```bash
cd backend
npm install
```

---

## ⚙️ Environment Variables

Create a `.env` file in the `backend` directory (or use `.env.example` as a template):

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/weekly-report-system
JWT_SECRET=teamtrack_secret_jwt_key_development_2026
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```

---

## 🗄️ Database Setup & Seeding

The application includes an automated seeder script that populates realistic demo data:
- **1 Manager**
- **4 Team Members**
- **5 Active Projects**
- **10 Weekly Reports** across 4 weeks with diverse statuses (`DRAFT`, `SUBMITTED`, `NEEDS_CORRECTION`, `APPROVED`)
- **Review History** records attached to reviewed reports

Run the seed command:
```bash
npm run seed
```

---

## 🏃 Running the Server

### Development Mode (with hot-reload via nodemon):
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

The API will listen at: `http://localhost:5000`

---

## 🧪 Testing & Verification

Run the automated test suite using Jest and Supertest:
```bash
npm test
```

The test suite validates:
- [x] Team members cannot access manager dashboards (returns `403 Forbidden`).
- [x] Team members cannot access other team members' reports (returns `403 Forbidden`).
- [x] Team members can access their own reports (returns `200 OK`).
- [x] Managers can access manager dashboards and reports (returns `200 OK`).
- [x] Unauthenticated requests are rejected (returns `401 Unauthorized`).

---

## 👥 Pre-Seeded Test Accounts

| Role | Name | Email | Password |
| :--- | :--- | :--- | :--- |
| **MANAGER** | Sarah Connor | `manager@example.com` | `Password123` |
| **TEAM_MEMBER** | Alex Johnson | `member1@example.com` | `Password123` |
| **TEAM_MEMBER** | Beth Smith | `member2@example.com` | `Password123` |
| **TEAM_MEMBER** | Carlos Diaz | `member3@example.com` | `Password123` |
| **TEAM_MEMBER** | Diana Prince | `member4@example.com` | `Password123` |

---

## 📡 API Reference (Endpoint Table)

All endpoints expecting authentication require the standard HTTP header:
`Authorization: Bearer <your_jwt_token>`

### 1. Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new user with name, email, password, optional role |
| `POST` | `/api/auth/login` | Public | Login with email & password, returns JWT and user profile |
| `GET` | `/api/auth/me` | Authenticated | Get current authenticated user profile |

### 2. Projects (`/api/projects`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/projects` | Authenticated | List all active projects |
| `POST` | `/api/projects` | Manager only | Create a new project |
| `PUT` | `/api/projects/:id` | Manager only | Update project details |
| `DELETE` | `/api/projects/:id` | Manager only | Delete a project |

### 3. Team Member Reports (`/api/reports`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/reports` | Team Member | Create a new draft report for the week |
| `GET` | `/api/reports/my` | Team Member | Get current user's report history (paginated) |
| `GET` | `/api/reports/:id` | Owner / Manager | Get single report (ownership verified) |
| `PUT` | `/api/reports/:id` | Owner only | Edit report (allowed only in `DRAFT` or `NEEDS_CORRECTION`) |
| `POST` | `/api/reports/:id/submit` | Owner only | Submit report for review (`DRAFT` &rarr; `SUBMITTED`) |
| `POST` | `/api/reports/:id/resubmit`| Owner only | Resubmit corrected report (`NEEDS_CORRECTION` &rarr; `SUBMITTED`) |
| `GET` | `/api/reports/:id/reviews` | Owner / Manager | Get manager review feedback and history |

### 4. Manager Reports (`/api/manager/reports`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/manager/reports` | Manager only | View all team reports (supports status, user, project filters & pagination) |
| `GET` | `/api/manager/reports/:id`| Manager only | View any team member's report |
| `POST` | `/api/manager/reports/:id/approve` | Manager only | Approve report (`SUBMITTED` &rarr; `APPROVED`) |
| `POST` | `/api/manager/reports/:id/request-correction` | Manager only | Request correction with comment (`SUBMITTED` &rarr; `NEEDS_CORRECTION`) |

### 5. Dashboard Analytics (`/api/dashboard`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/dashboard/summary` | Manager only | High-level KPIs: compliance rate, pending reports, blockers |
| `GET` | `/api/dashboard/task-trend` | Manager only | Completed, in-progress, and not-started tasks over weeks |
| `GET` | `/api/dashboard/status-by-member` | Manager only | Per-member report status breakdown |
| `GET` | `/api/dashboard/workload-by-project` | Manager only | Total logged hours and task count per project |
| `GET` | `/api/dashboard/time-by-task-type` | Manager only | Cumulative hours categorized (dev, testing, meetings, etc.) |
| `GET` | `/api/dashboard/recent-activity` | Manager only | Timeline of recent reviews, submissions, and approvals |

### 6. User Management (`/api/users`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users` | Manager only | List all registered users |
| `GET` | `/api/users/:id` | Manager only | Get specific user by ID |
| `PUT` | `/api/users/:id/role` | Manager only | Promote or change user role (`TEAM_MEMBER` / `MANAGER`) |
| `DELETE` | `/api/users/:id` | Manager only | Remove user account (prevented on self) |

---

## 🧠 Core Architecture & Interview Concepts

### How JWT Authentication Works
1. When a user logs in via `POST /api/auth/login`, we check their password using `bcrypt.compare()`.
2. Upon successful authentication, we create a JSON Web Token (JWT) containing a signed payload:
   ```javascript
   { userId: user._id, role: user.role }
   ```
3. The token is cryptographically signed using `JWT_SECRET` and set to expire in 7 days (`JWT_EXPIRES_IN`).
4. The client includes this token in the header of future requests:
   `Authorization: Bearer <token>`

### How `authMiddleware` Works
- Inspects `req.headers.authorization`.
- Validates that the header begins with `Bearer `.
- Calls `jwt.verify(token, process.env.JWT_SECRET)`.
- If valid, queries MongoDB for `User.findById(decoded.userId).select('-password')`.
- Attaches the verified user instance to `req.user` and calls `next()`.
- If the token is expired, tampered with, or the user no longer exists, it immediately halts execution with a `401 Unauthorized` JSON response.

### How `roleMiddleware` (RBAC) Works
- Factory function: `requireRole(...allowedRoles)`
- Never trusts any role claim passed from the client request body or query params.
- Reads `req.user.role` which was loaded directly from MongoDB by `authMiddleware`.
- If `req.user.role` is included in `allowedRoles`, execution proceeds.
- Otherwise, returns `403 Forbidden` with `"Access denied. Requires one of the following roles: ..."`.

### How Report Ownership Is Enforced
- In `reportController.js`:
  ```javascript
  if (req.user.role !== 'MANAGER' && report.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'You are not authorized to access this report'
    });
  }
  ```
- When editing or submitting, even a manager cannot edit a member's report content (managers can only review, approve, or request corrections).
- This prevents horizontal privilege escalation (User A modifying User B's report).

### How Report Status Transitions Work
The lifecycle strictly allows:
```text
      [Create Report]
             ↓
          [DRAFT]
             ↓ (Submit)
        [SUBMITTED] ─────────────┐
        │         ▲              │
(Approve)│         │(Resubmit)    │(Request Correction)
        ▼         │              ▼
    [APPROVED]    └─── [NEEDS_CORRECTION]
```
- A team member cannot edit content once a report is `SUBMITTED` or `APPROVED`.
- `APPROVED` reports are locked and cannot transition back to `DRAFT` or `SUBMITTED`.
- Only reports in `SUBMITTED` status can be approved or sent back for correction by a manager.

### How the Correction & Review Workflow Works
1. A manager reviews a `SUBMITTED` report via `POST /api/manager/reports/:id/request-correction` providing a mandatory comment explaining what needs fixing.
2. The report's status changes to `NEEDS_CORRECTION`, and a new document is inserted into the `Review` collection with `action: "REQUEST_CORRECTION"`.
3. The team member is now permitted to edit the report content again.
4. Once revised, the member calls `POST /api/reports/:id/resubmit`, which updates the status back to `SUBMITTED` and refreshes `submittedAt`.
5. The manager can then approve it via `POST /api/manager/reports/:id/approve`.

### How Pagination & Filtering Work
- Routes accept query parameters: `page`, `limit`, `status`, `userId`, `projectId`, `startDate`, `endDate`.
- Example: `skip = (page - 1) * limit;`
- Query uses `Model.find(filter).skip(skip).limit(limit)`.
- `Model.countDocuments(filter)` calculates the exact total matching records.
- The response returns `totalPages: Math.ceil(total / limit)`.

### How Dashboard Aggregations Work
MongoDB aggregation pipelines are used for fast, readable reporting:
- `$unwind: '$tasks'` flattens task sub-arrays to compute task completion trends across dates.
- `$group` with conditional sums (`$cond`) counts reports per status and aggregates hours across categories (`development`, `testing`, `meetings`, `documentation`, `other`).
- `$lookup` performs joins with `users` and `projects` collections to attach readable names to summary charts.
