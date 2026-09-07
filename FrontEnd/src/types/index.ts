export type UserRole = 'TEAM_MEMBER' | 'MANAGER' | 'ADMIN';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string;
  updatedAt?: string;
}

export type TaskStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED' | 'CANCELLED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface TaskItem {
  _id?: string;
  taskName: string;
  priority: TaskPriority;
  plannedPercentage: number;
  actualPercentage: number;
  status: TaskStatus;
  plannedHours: number;
  actualHours: number;
  deliverable?: string;
}

export interface HoursWorked {
  development: number;
  testing: number;
  meetings: number;
  documentation: number;
  other: number;
}

export interface Project {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type ReportStatus = 'DRAFT' | 'SUBMITTED' | 'NEEDS_CORRECTION' | 'APPROVED';

export interface Report {
  _id: string;
  user: User | string;
  weekStart: string;
  weekEnd: string;
  project: Project | string;
  tasks: TaskItem[];
  plannedTasks?: string;
  blockers?: string;
  keyBlocker?: string;
  achievements?: string;
  keyAchievement?: string;
  hoursWorked: HoursWorked;
  notes?: string;
  status: ReportStatus;
  latestReviewComment?: string;
  submittedAt?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  _id: string;
  report: string;
  reviewer: User;
  action: 'REQUEST_CORRECTION' | 'APPROVED';
  comment?: string;
  createdAt: string;
}

export interface DashboardSummary {
  totalReportsSubmitted: number;
  submissionComplianceRate: number;
  pendingReports: number;
  needsCorrection: number;
  approvedReports: number;
  draftReports: number;
  totalTeamMembers: number;
  openBlockers: number;
}

export interface TaskTrendItem {
  week: string;
  completed: number;
  inProgress: number;
  notStarted: number;
  totalTasks: number;
}

export interface MemberStatusItem {
  userId: string;
  name: string;
  email: string;
  totalReports: number;
  approved: number;
  submitted: number;
  needsCorrection: number;
  draft: number;
}

export interface ProjectWorkloadItem {
  projectId: string;
  projectName: string;
  reportCount: number;
  totalHours: number;
  totalTasks: number;
}

export interface TimeByTypeItem {
  development: number;
  testing: number;
  meetings: number;
  documentation: number;
  other: number;
  total: number;
}

export interface ActivityItem {
  id: string;
  action: string;
  comment: string;
  createdAt: string;
  reviewer: string;
  reportOwner: string;
  reportId: string;
  reportWeek: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  errors?: Array<{ field: string; message: string }>;
}

export interface PaginatedResponse<T> {
  reports?: T[];
  users?: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
