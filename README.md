# TeamTrack – Setup Instructions & Documentation

Welcome to **TeamTrack**! This repository contains the complete full-stack solution for the **Weekly Report Generator & Team Dashboard** platform, consisting of a **Next.js (React/TypeScript)** frontend and a **Node.js (Express/MongoDB)** backend.

Follow the instructions below to install dependencies, configure the environment, run the database and seeding script, and launch both services.

---

## 📋 Table of Contents

1. [Prerequisites](#-prerequisites)
2. [1. Installing Dependencies](#1-installing-dependencies)
3. [2. Running the Database & Seeding](#2-running-the-database--seeding)
4. [3. Running the Backend](#3-running-the-backend)
5. [4. Running the Frontend](#4-running-the-frontend)
6. [Pre-Seeded Demo Accounts](#-pre-seeded-demo-accounts)
7. [Summary of Common Commands](#-summary-of-common-commands)

---

## ⚙️ Prerequisites

Before getting started, make sure you have installed:

- **Node.js** (v18.0.0 or higher) – [Download Node.js](https://nodejs.org/)
- **npm** (v9.0.0 or higher) – Bundled with Node.js
- **MongoDB Atlas** database access (cluster URI provided below) or an active internet connection to reach MongoDB Atlas.

---

## 1. Installing Dependencies

The project is split into two directories: `backend/` and `FrontEnd/`. Dependencies must be installed in each folder.

### 1.1 Backend Dependencies
Open your terminal and run:
```bash
cd backend
npm install
```

### 1.2 Frontend Dependencies
In a new terminal (or navigate from root):
```bash
cd FrontEnd
npm install
```

---

## 2. Running the Database & Seeding

### 2.1 MongoDB Database Configuration
This project is configured to use a cloud-hosted **MongoDB Atlas** cluster database:

```text
mongodb+srv://janithchamika20030411_db_user:Janith321@cluster0.jwki2ka.mongodb.net/?appName=Cluster0
```

Because MongoDB Atlas is hosted in the cloud, you do not need to install or run a local MongoDB instance on your machine. Simply make sure your environment has internet connectivity.

### 2.2 Configure Backend Environment (`backend/.env`)
Ensure your `backend/.env` file is configured with the MongoDB Atlas URI:
```env
PORT=5000
MONGODB_URI=mongodb+srv://janithchamika20030411_db_user:Janith321@cluster0.jwki2ka.mongodb.net/?appName=Cluster0
JWT_SECRET=teamtrack_secret_jwt_key_development_2026
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
GEMINI_API_KEY=AQ.Ab8RN6JbmjNdz0fF1gzJZisKHH6U4NdU3QycHtnILC18TloNnw
GEMINI_MODEL=gemini-3.6-flash
```

### 2.3 Seed the Database
To populate the database with realistic demo data (users, projects, multi-week reports, and review histories), run the seeder script from the `backend/` directory:

```bash
cd backend
npm run seed
```

> **What the seed script creates:**
> - 1 Engineering Manager (`manager@example.com`)
> - 4 Team Members (`member1@example.com` to `member4@example.com`)
> - 5 Active Projects (Cloud Infrastructure Migration, Payment Gateway, Mobile App, etc.)
> - 10 Weekly reports across multiple status cycles (`DRAFT`, `SUBMITTED`, `NEEDS_CORRECTION`, `APPROVED`)
> - Review feedback logs and audit history

---

## 3. Running the Backend

From the `backend/` directory, start the Express API server:

### Development Mode (with hot-reload via Nodemon):
```bash
cd backend
npm run dev
#before run this backend other running backend projects in pc should stop using ctrl+c
```

### Production Mode:
```bash
cd backend
npm start
```

The backend server will start at:
👉 **`http://localhost:5000`**  
Health check / API root is available at: **`http://localhost:5000/api`**

### Running Backend Automated Tests:
```bash
cd backend
npm test
```

---

## 4. Running the Frontend

### 4.1 Configure Frontend Environment (`FrontEnd/.env`)
Ensure `FrontEnd/.env` contains the API base URL:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 4.2 Start the Next.js Frontend

#### Development Mode:
```bash
cd FrontEnd
npm run dev
#before run this backend other running backend projects in pc should stop using ctrl+c.
```

The application will be accessible at:
👉 **`http://localhost:3000`**

#### Production Build & Launch:
```bash
cd FrontEnd
npm run build
npm start
```

---

## 👥 Pre-Seeded Demo Accounts

All accounts share the default password: **`Password123`**

| Role | Email | Password | Available Features & Permissions |
| :--- | :--- | :--- | :--- |
| **Manager** | `manager@example.com` | `Password123` | Executive Analytics Dashboard, Team Submissions Review, Approve/Request Changes, Project CRUD, User Management |
| **Team Member 1** | `member1@example.com` | `Password123` | Personal Dashboard, My Reports, 8-Section Weekly Report Builder, Edit Drafts, Resubmit Corrections |
| **Team Member 2** | `member2@example.com` | `Password123` | Personal Dashboard, My Reports, Report Builder |
| **Team Member 3** | `member3@example.com` | `Password123` | Personal Dashboard, My Reports, Report Builder |
| **Team Member 4** | `member4@example.com` | `Password123` | Personal Dashboard, My Reports, Report Builder |

> 💡 **Tip:** The frontend login page at [http://localhost:3000/login](http://localhost:3000/login) includes quick-fill buttons to log in with 1-click as Manager or Team Member.

---

## 📌 Summary of Common Commands

| Purpose | Directory | Command |
| :--- | :--- | :--- |
| **Install backend dependencies** | `backend/` | `npm install` |
| **Install frontend dependencies** | `FrontEnd/` | `npm install` |
| **Seed database** | `backend/` | `npm run seed` |
| **Run backend (dev)** | `backend/` | `npm run dev` |
| **Run backend tests** | `backend/` | `npm test` |
| **Run frontend (dev)** | `FrontEnd/` | `npm run dev` |
| **Build frontend for production** | `FrontEnd/` | `npm run build` |
