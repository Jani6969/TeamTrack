const Report = require('../models/Report');
const Project = require('../models/Project');
const User = require('../models/User');
const Review = require('../models/Review');

const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
const FALLBACK_MODELS = ['gemini-3.5-flash', 'gemini-flash-latest'];

/**
 * Low-level caller to Google Gemini REST API
 */
async function callGemini(contents, systemInstruction = '', model = DEFAULT_MODEL) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured in backend environment variables.');
  }

  const modelsToTry = [model, ...FALLBACK_MODELS.filter((m) => m !== model)];
  let lastError = null;

  for (const currentModel of modelsToTry) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${process.env.GEMINI_API_KEY}`;
      
      const payload = {
        contents,
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 2048
        }
      };

      if (systemInstruction) {
        payload.systemInstruction = {
          parts: [{ text: systemInstruction }]
        };
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errText = await response.text();
        console.warn(`Gemini API error with model ${currentModel} (${response.status}):`, errText);
        
        if (response.status === 429) {
          lastError = new Error('Google Gemini rate limit reached (Free Tier limit: 15 req/min). Please wait a moment and try again.');
        } else {
          lastError = new Error(`Gemini API error (${response.status}): ${errText}`);
        }
        continue; // Try next model fallback
      }

      const data = await response.json();
      const candidate = data.candidates?.[0];
      const text = candidate?.content?.parts?.map((p) => p.text).filter(Boolean).join('\n') || '';

      if (text) {
        return {
          text,
          model: currentModel,
          usage: data.usageMetadata
        };
      }
    } catch (err) {
      console.warn(`Call failed for model ${currentModel}:`, err.message);
      lastError = err;
    }
  }

  throw lastError || new Error('Failed to generate response from Gemini API.');
}

/**
 * Builds dynamic grounded context (RAG) from MongoDB database
 * Enforces role-based privacy:
 *  - Managers: Full visibility over all team members, projects, blockers, hours & reviews
 *  - Team Members: Visibility over their own reports & active project guidelines
 */
async function buildContext(currentUser) {
  const isManager = currentUser.role === 'MANAGER';

  // 1. Fetch active projects
  const projects = await Project.find({ isActive: true }).select('name description').lean();

  if (isManager) {
    // 2. Fetch all team members
    const teamMembers = await User.find({ role: 'TEAM_MEMBER' }).select('name email').lean();

    // 3. Fetch recent reports (last 30 days) across all team members
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const reports = await Report.find({
      weekStart: { $gte: thirtyDaysAgo }
    })
      .populate('user', 'name email')
      .populate('project', 'name')
      .sort({ weekStart: -1 })
      .lean();

    // 4. Summarize reports into structured token-efficient text
    const structuredReports = reports.map((r) => {
      const taskSummaries = (r.tasks || []).map(
        (t) => `  - [${t.status}] ${t.taskName} (${t.actualPercentage || 0}% complete, ${t.actualHours || 0}h, Priority: ${t.priority || 'MEDIUM'}, Deliverable: ${t.deliverable || 'N/A'})`
      ).join('\n');

      const totalHours =
        (r.hoursWorked?.development || 0) +
        (r.hoursWorked?.testing || 0) +
        (r.hoursWorked?.meetings || 0) +
        (r.hoursWorked?.documentation || 0) +
        (r.hoursWorked?.other || 0);

      return `Report ID: ${r._id}
Author: ${r.user?.name || 'Unknown'} (${r.user?.email || 'N/A'})
Project: ${r.project?.name || 'Unassigned'}
Week: ${r.weekStart ? new Date(r.weekStart).toISOString().split('T')[0] : 'N/A'} to ${r.weekEnd ? new Date(r.weekEnd).toISOString().split('T')[0] : 'N/A'}
Status: ${r.status}
Total Hours Logged: ${totalHours}h (Dev: ${r.hoursWorked?.development || 0}h, Test: ${r.hoursWorked?.testing || 0}h, Meet: ${r.hoursWorked?.meetings || 0}h, Doc: ${r.hoursWorked?.documentation || 0}h)
Achievements: ${r.achievements || 'None specified'} ${r.keyAchievement ? `(Key: ${r.keyAchievement})` : ''}
Blockers: ${r.blockers || 'None specified'} ${r.keyBlocker ? `(Key Blocker: ${r.keyBlocker})` : ''}
Latest Manager Feedback: ${r.latestReviewComment || 'None'}
Tasks:
${taskSummaries || '  - No granular tasks listed'}`;
    }).join('\n\n---\n\n');

    return {
      role: 'MANAGER',
      userContext: `User: ${currentUser.name} (Role: Manager)`,
      projects: projects.map((p) => `- ${p.name}: ${p.description}`).join('\n'),
      teamMembers: teamMembers.map((m) => `- ${m.name} (${m.email})`).join('\n'),
      reportsData: structuredReports
    };
  } else {
    // Team member view - scoped to their own reports
    const myReports = await Report.find({ user: currentUser._id })
      .populate('project', 'name')
      .sort({ weekStart: -1 })
      .limit(10)
      .lean();

    const structuredReports = myReports.map((r) => {
      const taskSummaries = (r.tasks || []).map(
        (t) => `  - [${t.status}] ${t.taskName} (${t.actualPercentage || 0}% complete, ${t.actualHours || 0}h)`
      ).join('\n');

      return `Week: ${r.weekStart ? new Date(r.weekStart).toISOString().split('T')[0] : 'N/A'} to ${r.weekEnd ? new Date(r.weekEnd).toISOString().split('T')[0] : 'N/A'}
Project: ${r.project?.name || 'N/A'}
Status: ${r.status}
Achievements: ${r.achievements || 'None'}
Blockers: ${r.blockers || 'None'}
Manager Review: ${r.latestReviewComment || 'None'}
Tasks:
${taskSummaries}`;
    }).join('\n\n---\n\n');

    return {
      role: 'TEAM_MEMBER',
      userContext: `User: ${currentUser.name} (Role: Team Member)`,
      projects: projects.map((p) => `- ${p.name}: ${p.description}`).join('\n'),
      reportsData: structuredReports
    };
  }
}

/**
 * Handle Conversational Q&A
 */
async function processChatMessage(currentUser, userMessage, conversationHistory = []) {
  const context = await buildContext(currentUser);

  const systemInstruction = `You are TeamTrack AI Copilot, an intelligent, concise, and helpful assistant built into the TeamTrack Weekly Reporting & Team Dashboard application.

CURRENT USER CONTEXT:
${context.userContext}

ACTIVE PROJECTS IN SYSTEM:
${context.projects}

${context.role === 'MANAGER' ? `TEAM MEMBERS:\n${context.teamMembers}\n\nTEAM REPORTS & RECENT ACTIVITY (GROUND TRUTH DATABASE):\n${context.reportsData}` : `USER'S PERSONAL REPORT HISTORY:\n${context.reportsData}`}

GUIDELINES:
1. Always base your answers on the provided Ground Truth Database context whenever answering questions about team members, projects, tasks, blocker statuses, hours, and weekly reports.
2. If asked about a project or developer that has blockers or uncompleted tasks, cite specific details (e.g. specific task names, percentages, key blockers like Kafka timeouts or sandbox latency).
3. If information is not present in the data, clearly state so without inventing fabricated statistics.
4. Format responses using clean GitHub Markdown (bolding key terms, bullet points, headers where appropriate). Keep responses organized and readable.
5. If the user is a manager, you can provide executive advice on addressing blockers, balancing workload, or approving/rejecting reports.
6. If the user is a team member, help them draft tasks, articulate blockers, review hours, and understand submission expectations.`;

  // Build Gemini contents array from conversation history
  const contents = [];

  // Add recent history turns (limit to last 6 messages for token efficiency)
  const recentHistory = (conversationHistory || []).slice(-6);
  for (const msg of recentHistory) {
    contents.push({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    });
  }

  // Add current message
  contents.push({
    role: 'user',
    parts: [{ text: userMessage }]
  });

  const response = await callGemini(contents, systemInstruction);
  return {
    reply: response.text,
    model: response.model
  };
}

/**
 * Generate AI-Powered Team Summary & Executive Intelligence Report
 */
async function generateTeamSummary(currentUser) {
  if (currentUser.role !== 'MANAGER') {
    throw new Error('Team intelligence summary is only accessible to managers.');
  }

  const context = await buildContext(currentUser);

  const systemInstruction = `You are the Chief AI Intelligence Officer for TeamTrack. Your role is to analyze weekly engineering reports, task progress, blocker alerts, and workload distribution to generate a high-impact Executive Team Summary.`;

  const prompt = `Analyze all team reports and project metrics provided below and produce a structured Executive Team Intelligence Summary.

DATABASE CONTEXT:
Active Projects:
${context.projects}

Team Members:
${context.teamMembers}

Weekly Reports Data:
${context.reportsData}

FORMAT YOUR RESPONSE IN CLEAN MARKDOWN WITH THESE EXACT SECTIONS:
### 1. 🚀 Executive Overview
A 2-3 sentence high-level summary of overall team momentum, sprint health, and delivery pace.

### 2. ✅ Completed Work & Major Achievements
Key deliverables and milestones completed across active projects with author credit.

### 3. ⚠️ Recurring Blockers & Bottlenecks
Critical blockers impacting delivery, technical debt, third-party dependency delays, and unresolved issues.

### 4. ⚖️ Workload & Capacity Analysis
Evaluation of hours logged, task density across team members, and any workload imbalances or overtime risks.

### 5. 💡 Actionable Manager Recommendations
3-4 concrete steps the manager should take this week to unblock team members, streamline reviews, and optimize project allocations.`;

  const contents = [
    {
      role: 'user',
      parts: [{ text: prompt }]
    }
  ];

  const response = await callGemini(contents, systemInstruction);
  return {
    summary: response.text,
    generatedAt: new Date(),
    model: response.model
  };
}

/**
 * Get dynamic smart suggestions based on real database state
 */
async function getSuggestedPrompts(currentUser) {
  if (currentUser.role === 'MANAGER') {
    return [
      'What did the team work on last week?',
      'Which projects currently have open blockers?',
      'Are there any workload imbalances across team members?',
      'Summarize Carlos Diaz and Alex Johnson’s progress',
      'What are the critical items awaiting manager review?'
    ];
  } else {
    return [
      'What are my key tasks for this week?',
      'How do I write a good blocker description?',
      'What was the manager feedback on my last report?',
      'How are hours categorized between dev, testing, and meetings?'
    ];
  }
}

module.exports = {
  callGemini,
  buildContext,
  processChatMessage,
  generateTeamSummary,
  getSuggestedPrompts
};
