# TeamTrack AI Assistant & Executive Team Intelligence Documentation

## 1. Overview & Capabilities

The **TeamTrack AI Assistant (Copilot)** is an AI-powered conversational assistant and executive intelligence engine integrated into the TeamTrack application. Powered by **Google Gemini 3.6 Flash** (with fallback resilience to `gemini-3.5-flash`), it enables engineering managers and team members to interact with team telemetry, sprint progress, blocker alerts, and workload analytics in real time.

### Core Capabilities:
- **Conversational Q&A for Managers**: Natural language querying over weekly engineering reports (e.g. *"What did the team work on last week?"*, *"Which developers reported Kafka timeouts?"*, *"What reports are currently in NEEDS_CORRECTION?"*).
- **AI-Generated Executive Team Summary**: One-click multi-project intelligence reports highlighting:
  - High-level sprint velocity & momentum
  - Major deliverables and achievements with author attribution
  - Recurring blockers, technical bottlenecks, and dependency risks
  - Workload balance analysis & capacity constraints
  - Actionable recommendations for managers
- **Interactive In-App Copilot Widget**: Modern floating drawer UI with Markdown rendering, live typing states, copy-to-clipboard, chat history reset, dynamic suggested prompt chips, and modal expansion.
- **Role-Based Privacy & Security**: Distinct context boundaries for **Managers** (full team visibility) and **Team Members** (own report drafts and submission guidelines).

---

## 2. Technical Architecture & Integration Approach

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Frontend (React)                 │
│  - AIAssistantModal (Floating Copilot Drawer)               │
│  - Manager Dashboard AI Intelligence Widget                 │
│  - MarkdownRenderer + Dynamic Prompt Chips                  │
└──────────────────────────────┬──────────────────────────────┘
                               │ Authenticated JWT Requests
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                  Express.js Backend API                     │
│  - aiRoutes (/api/ai/chat, /api/ai/summary, /suggestions)   │
│  - authMiddleware + roleMiddleware (RBAC)                   │
└──────────────────────────────┬──────────────────────────────┘
                               │
                ┌──────────────┴──────────────┐
                ▼                             ▼
┌───────────────────────────────┐ ┌───────────────────────────┐
│     MongoDB Ground Truth RAG  │ │  Google Gemini 3.6 Flash  │
│  - Active Projects & Scopes   │ │  - Direct REST v1beta API │
│  - Weekly Reports & Hours     │ │  - Structured Prompting   │
│  - Tasks, Statuses & Blockers │ │  - Exponential Fallback   │
│  - Manager Review History     │ │  - Low-latency generation │
└───────────────────────────────┘ └───────────────────────────┘
```

### Integration Approach:
1. **Lightweight Retrieval-Augmented Generation (RAG)**:
   - When a query is initiated, the backend dynamically queries MongoDB for active projects, team members, recent weekly reports (tasks, priorities, percentages, actual hours, achievements, blockers, manager review comments), and dashboard metrics.
   - The structured data is converted into a token-efficient ground-truth context and injected into the LLM system prompt.
2. **Direct REST Integration with Resilience**:
   - Uses native `fetch` against Google Generative Language API (`/v1beta/models/gemini-3.6-flash:generateContent`).
   - Configured with `temperature: 0.2` and `maxOutputTokens: 2048` for fast, factual, and consistent responses without hallucinated statistics.
   - Automated fallback to alternative models (`gemini-3.5-flash`, `gemini-flash-latest`) if model availability or rate limits change.

---

## 3. Prompt Design & System Instructions

### System Prompt Design
The system prompt establishes the persona, strict grounding rules, and role constraints:

```markdown
You are TeamTrack AI Copilot, an intelligent, concise, and helpful assistant built into the TeamTrack Weekly Reporting & Team Dashboard application.

CURRENT USER CONTEXT:
User: Sarah Connor (Role: Manager)

ACTIVE PROJECTS IN SYSTEM:
- Mobile Banking App: Next-generation mobile banking experience...
- Customer Portal Redesign: Modern customer self-service dashboard...
- Analytics & Reporting Pipeline: Real-time telemetry...

TEAM REPORTS & RECENT ACTIVITY (GROUND TRUTH DATABASE):
[Structured list of reports, tasks, % completions, hours by type, deliverables, blockers, and review notes]

GUIDELINES:
1. Always base your answers on the provided Ground Truth Database context.
2. If asked about a project or developer that has blockers, cite specific details (e.g., Kafka timeout, Stripe sandbox webhook latency).
3. If information is not in the data, state so clearly without fabricating statistics.
4. Format responses using clean Markdown (bolding key terms, bullet points, headers).
5. If the user is a manager, provide executive advice on addressing blockers and workload imbalances.
```

### Executive Summary Prompt Structure
The executive summary prompt enforces a 5-section framework:
1. **Executive Overview**: High-level sprint health and delivery pace.
2. **Completed Work & Major Achievements**: Key deliverables completed across active projects with author attribution.
3. **Recurring Blockers & Bottlenecks**: Critical blockers, third-party dependency delays, and unresolved bugs.
4. **Workload & Capacity Analysis**: Analysis of dev vs. test hours, task distribution across developers, and potential burnout risks.
5. **Actionable Manager Recommendations**: Concrete next steps for the engineering manager.

---

## 4. Data Privacy, Access Control & Safety Guardrails

### 1. Role-Based Context Scoping (RBAC)
- **Managers (`ROLE === 'MANAGER'`)**: Have access to full team metrics, cross-project workload distributions, all submitted reports, and open blocker logs.
- **Team Members (`ROLE === 'TEAM_MEMBER'`)**: Context is strictly scoped to their own personal report submissions, drafts, and general project guidelines. They cannot inspect other individual developers' private submission notes or workload hours via the AI.

### 2. PII & Secret Isolation
- Passwords (bcrypt hashes), internal salts, and JWT secret tokens are stripped before any context is assembled.
- LLM calls contain only operational project metadata, task deliverables, logged hours, and reported blockers.

### 3. Hallucination Prevention
- The AI is explicitly instructed to cite ground-truth database records and report IDs.
- If a project or developer does not exist in the database, the assistant indicates that no corresponding records were found.

---

## 5. API Reference

### `POST /api/ai/chat`
- **Access**: Private (Authenticated Users)
- **Body**:
  ```json
  {
    "message": "What are the main blockers reported by the backend team?",
    "history": [
      { "role": "user", "content": "..." },
      { "role": "assistant", "content": "..." }
    ]
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "AI response generated successfully",
    "data": {
      "reply": "Based on recent weekly reports, the primary blockers are:\n1. **Kafka Stage Timeout**: Carlos Diaz reported broker timeouts...",
      "model": "gemini-3.6-flash"
    }
  }
  ```

### `POST /api/ai/summary`
- **Access**: Private (Managers Only)
- **Body**: `{}`
- **Response**:
  ```json
  {
    "success": true,
    "message": "Team intelligence summary generated successfully",
    "data": {
      "summary": "### 1. 🚀 Executive Overview\n...",
      "generatedAt": "2026-09-09T18:30:00.000Z",
      "model": "gemini-3.6-flash"
    }
  }
  ```

### `GET /api/ai/suggestions`
- **Access**: Private (Authenticated Users)
- **Response**: Returns dynamically generated query prompts tailored to the user's role.

---

## 6. Evaluation Scenarios & Example Q&A

### Scenario 1: Manager Queries Team Activity
- **Question**: *"What did the team work on last week?"*
- **AI Response**: Cites specific merged PRs and achievements:
  - Alex Johnson: Account summary dashboard with 60fps animations and SQLite caching on *Mobile Banking App*.
  - Beth Smith: Stripe webhook idempotency and Redis lock testing on *Payment Gateway Integration*.
  - Carlos Diaz: Kafka consumer configuration for transaction logs on *Analytics & Reporting Pipeline*.
  - Diana Prince: Helm charts deployment and zero-downtime rolling restart on *Cloud Infrastructure Migration*.

### Scenario 2: Blocker & Risk Detection
- **Question**: *"Which projects have recurring blockers?"*
- **AI Response**: Pinpoints the Kafka replica failover timeout on *Analytics & Reporting Pipeline* and Stripe sandbox test latency on *Payment Gateway Integration*, recommending specific manager interventions.

### Scenario 3: Workload & Capacity Review
- **Question**: *"Are there any workload imbalances across the team?"*
- **AI Response**: Breaks down total hours logged per developer across development, testing, meetings, and documentation, highlighting developers with heavy QA loads or high task density.
