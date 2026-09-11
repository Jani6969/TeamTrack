export interface ReportPayload {
  weekStart: string;
  weekEnd: string;
  project: string;
  tasks: Array<{
    taskName: string;
    priority: string;
    plannedPercentage: number;
    actualPercentage: number;
    status: string;
    plannedHours: number;
    actualHours: number;
    deliverable?: string;
  }>;
  plannedTasks?: string;
  blockers?: string;
  keyBlocker?: string;
  achievements?: string;
  keyAchievement?: string;
  hoursWorked?: {
    development: number;
    testing: number;
    meetings: number;
    documentation: number;
    other: number;
  };
  notes?: string;
}

export interface ReportFilterParams {
  page?: number;
  limit?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
}
