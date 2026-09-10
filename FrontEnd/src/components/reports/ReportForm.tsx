'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { getProjects } from '@/api/projects';
import {
  createReport,
  updateReport,
  submitReport,
  resubmitReport,
  ReportPayload,
} from '@/api/reports';
import { Project, Report, TaskItem, TaskPriority, TaskStatus } from '@/types';
import { useToast } from '@/context/ToastContext';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import {
  Calendar,
  FolderKanban,
  CheckSquare,
  Plus,
  Trash2,
  AlertTriangle,
  AlertCircle,
  Award,
  Clock,
  FileText,
  Save,
  Send,
  HelpCircle,
} from 'lucide-react';

interface ReportFormProps {
  initialData?: Report;
  isEditing?: boolean;
}

export function ReportForm({ initialData, isEditing = false }: ReportFormProps) {
  const router = useRouter();
  const { success: toastSuccess, error: toastError } = useToast();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Section 1: Week (Blank by default for new reports)
  const [weekStart, setWeekStart] = useState<string>(
    initialData?.weekStart
      ? new Date(initialData.weekStart).toISOString().split('T')[0]
      : ''
  );
  const [weekEnd, setWeekEnd] = useState<string>(
    initialData?.weekEnd
      ? new Date(initialData.weekEnd).toISOString().split('T')[0]
      : ''
  );

  // Section 2: Project (Blank by default for new reports)
  const [projectId, setProjectId] = useState<string>(
    typeof initialData?.project === 'object'
      ? initialData.project._id
      : initialData?.project || ''
  );

  // Section 3: Tasks (Blank by default for new reports)
  const [tasks, setTasks] = useState<TaskItem[]>(
    initialData?.tasks && initialData.tasks.length > 0
      ? initialData.tasks
      : [
          {
            taskName: '',
            priority: 'MEDIUM',
            plannedPercentage: 0,
            actualPercentage: 0,
            status: 'IN_PROGRESS',
            plannedHours: 0,
            actualHours: 0,
            deliverable: '',
          },
        ]
  );

  // Section 4: Planned Tasks for Next Week
  const [plannedTasks, setPlannedTasks] = useState(initialData?.plannedTasks || '');

  // Section 5: Blockers & Key Blocker
  const [blockerItems, setBlockerItems] = useState<string[]>(() => {
    if (!initialData?.blockers) return [''];
    const parts = initialData.blockers.split('\n').filter(Boolean);
    return parts.length > 0 ? parts : [''];
  });
  const [keyBlockerIndex, setKeyBlockerIndex] = useState<number>(() => {
    if (!initialData?.keyBlocker || !initialData.blockers) return 0;
    const parts = initialData.blockers.split('\n').filter(Boolean);
    const idx = parts.findIndex((p) => p.includes(initialData.keyBlocker!));
    return idx >= 0 ? idx : 0;
  });

  // Section 6: Achievements & Key Highlight
  const [achievementItems, setAchievementItems] = useState<string[]>(() => {
    if (!initialData?.achievements) return [''];
    const parts = initialData.achievements.split('\n').filter(Boolean);
    return parts.length > 0 ? parts : [''];
  });
  const [keyAchievementIndex, setKeyAchievementIndex] = useState<number>(() => {
    if (!initialData?.keyAchievement || !initialData.achievements) return 0;
    const parts = initialData.achievements.split('\n').filter(Boolean);
    const idx = parts.findIndex((p) => p.includes(initialData.keyAchievement!));
    return idx >= 0 ? idx : 0;
  });

  // Section 7: Hours Worked (Defaults to 0 for new reports)
  const [hours, setHours] = useState({
    development: initialData?.hoursWorked?.development ?? 0,
    testing: initialData?.hoursWorked?.testing ?? 0,
    meetings: initialData?.hoursWorked?.meetings ?? 0,
    documentation: initialData?.hoursWorked?.documentation ?? 0,
    other: initialData?.hoursWorked?.other ?? 0,
  });

  // Section 8: Notes & Useful Links
  const [notes, setNotes] = useState(initialData?.notes || '');

  // Submission / Loading states
  const [submittingDraft, setSubmittingDraft] = useState(false);
  const [submittingFinal, setSubmittingFinal] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projs = await getProjects();
        setProjects(projs);
        if (initialData?.project) {
          const id =
            typeof initialData.project === 'object'
              ? initialData.project._id
              : initialData.project;
          setProjectId(id);
        }
      } catch (err) {
        console.error('Failed to load projects:', err);
        toastError('Failed to load active projects from server');
      } finally {
        setLoadingProjects(false);
      }
    };
    fetchProjects();
  }, [initialData, toastError]);

  // Date change handlers with validation
  const handleWeekStartChange = (val: string) => {
    if (val && val > todayStr) {
      toastError('Future dates cannot be selected');
      setErrors((prev) => ({ ...prev, weekStart: 'Future dates cannot be selected' }));
      return;
    }
    if (val && weekEnd && val > weekEnd) {
      toastError('Start date cannot be after end date');
      setErrors((prev) => ({ ...prev, weekStart: 'Start date cannot be after end date' }));
      return;
    }
    setWeekStart(val);
    setErrors((prev) => {
      const next = { ...prev };
      delete next.weekStart;
      if (next.weekEnd === 'End date cannot be earlier than start date') delete next.weekEnd;
      return next;
    });
  };

  const handleWeekEndChange = (val: string) => {
    if (val && val > todayStr) {
      toastError('Future dates cannot be selected');
      setErrors((prev) => ({ ...prev, weekEnd: 'Future dates cannot be selected' }));
      return;
    }
    if (val && weekStart && val < weekStart) {
      toastError('End date cannot be before start date');
      setErrors((prev) => ({ ...prev, weekEnd: 'End date cannot be earlier than start date' }));
      return;
    }
    setWeekEnd(val);
    setErrors((prev) => {
      const next = { ...prev };
      delete next.weekEnd;
      if (next.weekStart === 'Start date cannot be after end date') delete next.weekStart;
      return next;
    });
  };

  const handleProjectChange = (val: string) => {
    setProjectId(val);
    if (val) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.projectId;
        return next;
      });
    }
  };

  // Task helpers
  const handleAddTask = () => {
    setTasks((prev) => [
      ...prev,
      {
        taskName: '',
        priority: 'MEDIUM',
        plannedPercentage: 0,
        actualPercentage: 0,
        status: 'IN_PROGRESS',
        plannedHours: 0,
        actualHours: 0,
        deliverable: '',
      },
    ]);
  };

  const handleUpdateTask = (index: number, field: keyof TaskItem, value: any) => {
    setTasks((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleRemoveTask = (index: number) => {
    if (tasks.length <= 1) {
      toastError('Report must include at least one task item');
      return;
    }
    setTasks((prev) => prev.filter((_, i) => i !== index));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[`task_${index}`];
      return next;
    });
  };

  // Blocker helpers
  const handleAddBlocker = () => setBlockerItems((prev) => [...prev, '']);
  const handleRemoveBlocker = (idx: number) => {
    setBlockerItems((prev) => prev.filter((_, i) => i !== idx));
    if (keyBlockerIndex === idx) setKeyBlockerIndex(0);
  };

  // Achievement helpers
  const handleAddAchievement = () => setAchievementItems((prev) => [...prev, '']);
  const handleRemoveAchievement = (idx: number) => {
    setAchievementItems((prev) => prev.filter((_, i) => i !== idx));
    if (keyAchievementIndex === idx) setKeyAchievementIndex(0);
  };

  // Construct payload
  const buildPayload = (): ReportPayload => {
    const validBlockers = blockerItems.map((b) => b.trim()).filter(Boolean);
    const validAchievements = achievementItems.map((a) => a.trim()).filter(Boolean);

    const keyBlocker = validBlockers[keyBlockerIndex] || validBlockers[0] || '';
    const keyAchievement = validAchievements[keyAchievementIndex] || validAchievements[0] || '';

    return {
      weekStart: new Date(weekStart).toISOString(),
      weekEnd: new Date(weekEnd).toISOString(),
      project: projectId,
      tasks: tasks.filter((t) => t.taskName.trim().length > 0),
      plannedTasks: plannedTasks.trim(),
      blockers: validBlockers.join('\n'),
      keyBlocker,
      achievements: validAchievements.join('\n'),
      keyAchievement,
      hoursWorked: hours,
      notes: notes.trim(),
    };
  };

  // Frontend validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!weekStart) {
      newErrors.weekStart = 'Week start date is required';
    } else if (weekStart > todayStr) {
      newErrors.weekStart = 'Future dates cannot be selected';
    }

    if (!weekEnd) {
      newErrors.weekEnd = 'Week end date is required';
    } else if (weekEnd > todayStr) {
      newErrors.weekEnd = 'Future dates cannot be selected';
    } else if (weekStart && weekEnd < weekStart) {
      newErrors.weekEnd = 'End date cannot be earlier than start date';
    }

    if (!projectId) {
      newErrors.projectId = 'Please select an active project';
    }

    if (tasks.length === 0) {
      newErrors.tasks = 'At least one task is required';
    } else {
      let hasEmptyTask = false;
      tasks.forEach((t, i) => {
        if (!t.taskName.trim()) {
          newErrors[`task_${i}`] = 'Task name is required';
          hasEmptyTask = true;
        }
        if (t.plannedPercentage < 0 || t.plannedPercentage > 100) {
          newErrors[`task_plan_pct_${i}`] = 'Must be 0-100%';
        }
        if (t.actualPercentage < 0 || t.actualPercentage > 100) {
          newErrors[`task_act_pct_${i}`] = 'Must be 0-100%';
        }
        if (t.plannedHours < 0) {
          newErrors[`task_plan_hrs_${i}`] = 'Hours must be ≥ 0';
        }
        if (t.actualHours < 0) {
          newErrors[`task_act_hrs_${i}`] = 'Hours must be ≥ 0';
        }
      });
      if (hasEmptyTask) {
        newErrors.tasks = 'Please provide a task name for all tasks';
      }
    }

    Object.entries(hours).forEach(([key, val]) => {
      if (Number(val) < 0) {
        newErrors[`hours_${key}`] = 'Hours cannot be negative';
      }
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const firstError = Object.values(newErrors)[0];
      toastError(firstError, 'Validation Required');
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return false;
    }

    return true;
  };

  // 1. Save as Draft
  const handleSaveDraft = async () => {
    if (!validateForm()) return;

    setSubmittingDraft(true);
    try {
      const payload = buildPayload();
      let saved: Report;
      if (isEditing && initialData?._id) {
        saved = await updateReport(initialData._id, payload);
        toastSuccess('Draft updated successfully');
      } else {
        saved = await createReport(payload);
        toastSuccess('Draft created successfully');
        router.replace(`/reports/${saved._id}/edit`);
      }
    } catch (err: any) {
      toastError(err.message || 'Failed to save draft');
    } finally {
      setSubmittingDraft(false);
    }
  };

  // 2. Initiate Submit (checks validation before dialog)
  const handleInitiateSubmit = () => {
    if (!validateForm()) return;
    setShowConfirmSubmit(true);
  };

  // 3. Final Submit / Resubmit
  const handleConfirmSubmit = async () => {
    setShowConfirmSubmit(false);
    if (!validateForm()) return;

    setSubmittingFinal(true);
    try {
      const payload = buildPayload();
      let targetId = initialData?._id;

      if (isEditing && targetId) {
        await updateReport(targetId, payload);
      } else {
        const created = await createReport(payload);
        targetId = created._id;
      }

      // If initial was NEEDS_CORRECTION, call resubmit endpoint; else submit
      if (initialData?.status === 'NEEDS_CORRECTION') {
        await resubmitReport(targetId);
        toastSuccess('Report resubmitted for manager review!');
      } else {
        await submitReport(targetId);
        toastSuccess('Report successfully submitted for manager review!');
      }

      router.push(`/reports/${targetId}`);
    } catch (err: any) {
      toastError(err.message || 'Failed to submit report');
    } finally {
      setSubmittingFinal(false);
    }
  };

  const totalHours =
    Number(hours.development || 0) +
    Number(hours.testing || 0) +
    Number(hours.meetings || 0) +
    Number(hours.documentation || 0) +
    Number(hours.other || 0);

  return (
    <div className="space-y-8 pb-12">
      {/* Confirmation Modal */}
      <ConfirmDialog
        isOpen={showConfirmSubmit}
        onClose={() => setShowConfirmSubmit(false)}
        onConfirm={handleConfirmSubmit}
        title="Submit Weekly Report"
        message="Are you sure you want to submit this weekly report for manager review? Once submitted, the report will be locked until reviewed."
        confirmText="Yes, Submit Report"
      />

      {/* Top Validation Error Banner */}
      {Object.keys(errors).length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 shadow-sm animate-slide-down flex items-start gap-3.5">
          <div className="p-2 rounded-xl bg-rose-100 text-rose-600 shrink-0 mt-0.5">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="flex-1 text-xs sm:text-sm">
            <div className="font-bold text-rose-950 text-sm mb-1">
              Please complete all required fields before proceeding:
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-rose-700 font-medium">
              {errors.weekStart && <li>{errors.weekStart}</li>}
              {errors.weekEnd && <li>{errors.weekEnd}</li>}
              {errors.projectId && <li>{errors.projectId}</li>}
              {errors.tasks && <li>{errors.tasks}</li>}
            </ul>
          </div>
        </div>
      )}

      {/* SECTION 1: Week Dates */}
      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-100">
          <div className="p-2 rounded-xl bg-brand-50 text-brand-600">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Section 1 – Reporting Week</h3>
            <p className="text-xs text-slate-500">Define the start and end dates for this report</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Week Start Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              required
              value={weekStart}
              max={weekEnd || todayStr}
              onChange={(e) => handleWeekStartChange(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:ring-2 transition-colors ${
                errors.weekStart
                  ? 'border-rose-400 bg-rose-50/20 text-rose-900 focus:ring-rose-500/20 focus:border-rose-500'
                  : 'border-slate-200 focus:ring-brand-500/20 focus:border-brand-500'
              }`}
            />
            {errors.weekStart && (
              <p className="text-xs text-rose-500 mt-1 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.weekStart}</span>
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Week End Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              required
              value={weekEnd}
              min={weekStart || undefined}
              max={todayStr}
              onChange={(e) => handleWeekEndChange(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:ring-2 transition-colors ${
                errors.weekEnd
                  ? 'border-rose-400 bg-rose-50/20 text-rose-900 focus:ring-rose-500/20 focus:border-rose-500'
                  : 'border-slate-200 focus:ring-brand-500/20 focus:border-brand-500'
              }`}
            />
            {errors.weekEnd && (
              <p className="text-xs text-rose-500 mt-1 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.weekEnd}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 2: Project / Category */}
      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-100">
          <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
            <FolderKanban className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Section 2 – Project / Category</h3>
            <p className="text-xs text-slate-500">Select the primary project you worked on this week</p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
            Active Project <span className="text-rose-500">*</span>
          </label>
          <select
            value={projectId}
            onChange={(e) => handleProjectChange(e.target.value)}
            disabled={loadingProjects}
            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white focus:ring-2 disabled:opacity-50 transition-colors ${
              errors.projectId
                ? 'border-rose-400 bg-rose-50/20 text-rose-900 focus:ring-rose-500/20 focus:border-rose-500'
                : 'border-slate-200 focus:ring-brand-500/20 focus:border-brand-500'
            }`}
          >
            {loadingProjects ? (
              <option value="">Loading projects...</option>
            ) : projects.length === 0 ? (
              <option value="">No projects available</option>
            ) : (
              <>
                <option value="">-- Select an active project --</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} {p.description ? `– ${p.description}` : ''}
                  </option>
                ))}
              </>
            )}
          </select>
          {errors.projectId && (
            <p className="text-xs text-rose-500 mt-1.5 font-medium flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.projectId}</span>
            </p>
          )}
        </div>
      </div>

      {/* SECTION 3: Dynamic Tasks Table */}
      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Section 3 – Tasks Completed</h3>
              <p className="text-xs text-slate-500">Log specific deliverables, completion %, and hours</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleAddTask}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-50 text-brand-700 hover:bg-brand-100 text-xs font-bold transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>

        {errors.tasks && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{errors.tasks}</span>
          </div>
        )}

        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-left text-xs min-w-[760px]">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-3 w-[26%]">Task Name *</th>
                <th className="py-3 px-3 w-[12%]">Priority</th>
                <th className="py-3 px-3 w-[12%]">Status</th>
                <th className="py-3 px-3 w-[10%]">Plan %</th>
                <th className="py-3 px-3 w-[10%]">Act %</th>
                <th className="py-3 px-3 w-[10%]">Plan Hrs</th>
                <th className="py-3 px-3 w-[10%]">Act Hrs</th>
                <th className="py-3 px-3 text-right">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tasks.map((task, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60">
                  <td className="py-3 px-3">
                    <input
                      type="text"
                      required
                      placeholder="e.g. Implement OAuth Flow"
                      value={task.taskName}
                      onChange={(e) => {
                        handleUpdateTask(idx, 'taskName', e.target.value);
                        if (e.target.value.trim() && errors[`task_${idx}`]) {
                          setErrors((prev) => {
                            const next = { ...prev };
                            delete next[`task_${idx}`];
                            return next;
                          });
                        }
                      }}
                      className={`w-full px-2.5 py-1.5 rounded-lg border text-xs focus:ring-2 transition-colors ${
                        errors[`task_${idx}`]
                          ? 'border-rose-400 bg-rose-50/20 text-rose-900 focus:ring-rose-500/20 focus:border-rose-500'
                          : 'border-slate-200 focus:ring-brand-500/20 focus:border-brand-500'
                      }`}
                    />
                    {errors[`task_${idx}`] && (
                      <p className="text-[10px] text-rose-500 mt-1 font-medium">{errors[`task_${idx}`]}</p>
                    )}
                    <input
                      type="text"
                      placeholder="Deliverable/PR link (optional)"
                      value={task.deliverable || ''}
                      onChange={(e) => handleUpdateTask(idx, 'deliverable', e.target.value)}
                      className="w-full mt-1 px-2.5 py-1 rounded-lg border border-slate-100 bg-slate-50 text-[11px] text-slate-600"
                    />
                  </td>
                  <td className="py-3 px-3">
                    <select
                      value={task.priority}
                      onChange={(e) => handleUpdateTask(idx, 'priority', e.target.value as TaskPriority)}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </td>
                  <td className="py-3 px-3">
                    <select
                      value={task.status}
                      onChange={(e) => handleUpdateTask(idx, 'status', e.target.value as TaskStatus)}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                    >
                      <option value="NOT_STARTED">Not Started</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </td>
                  <td className="py-3 px-3">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={task.plannedPercentage}
                      onChange={(e) =>
                        handleUpdateTask(idx, 'plannedPercentage', Math.min(100, Math.max(0, Number(e.target.value))))
                      }
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs"
                    />
                  </td>
                  <td className="py-3 px-3">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={task.actualPercentage}
                      onChange={(e) =>
                        handleUpdateTask(idx, 'actualPercentage', Math.min(100, Math.max(0, Number(e.target.value))))
                      }
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-brand-700"
                    />
                  </td>
                  <td className="py-3 px-3">
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={task.plannedHours}
                      onChange={(e) =>
                        handleUpdateTask(idx, 'plannedHours', Math.max(0, Number(e.target.value)))
                      }
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs"
                    />
                  </td>
                  <td className="py-3 px-3">
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={task.actualHours}
                      onChange={(e) =>
                        handleUpdateTask(idx, 'actualHours', Math.max(0, Number(e.target.value)))
                      }
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-900"
                    />
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleRemoveTask(idx)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 4: Tasks Planned for Next Week */}
      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-100">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Section 4 – Tasks Planned for Next Week</h3>
            <p className="text-xs text-slate-500">Outline goals and upcoming sprints for the coming week</p>
          </div>
        </div>

        <textarea
          rows={3}
          value={plannedTasks}
          onChange={(e) => setPlannedTasks(e.target.value)}
          placeholder="1. Finalize Stripe webhook retry handler&#10;2. Run end-to-end integration tests on staging cluster"
          className="w-full p-3.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
        />
      </div>

      {/* SECTION 5: Blockers & Challenges */}
      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Section 5 – Blockers & Challenges</h3>
              <p className="text-xs text-slate-500">List impediments. Check the radio box for your key blocker.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleAddBlocker}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 hover:bg-amber-100 text-xs font-bold transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Blocker</span>
          </button>
        </div>

        <div className="space-y-3">
          {blockerItems.map((blocker, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer shrink-0">
                <input
                  type="radio"
                  name="keyBlockerRadio"
                  checked={keyBlockerIndex === idx}
                  onChange={() => setKeyBlockerIndex(idx)}
                  className="w-4 h-4 text-amber-600 focus:ring-amber-500"
                />
                <span className="font-semibold text-slate-700">Key Blocker</span>
              </label>

              <input
                type="text"
                value={blocker}
                onChange={(e) => {
                  const copy = [...blockerItems];
                  copy[idx] = e.target.value;
                  setBlockerItems(copy);
                }}
                placeholder="Describe blocker or dependency delay..."
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />

              {blockerItems.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveBlocker(idx)}
                  className="p-1 text-slate-400 hover:text-rose-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 6: Achievements & Highlights */}
      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Section 6 – Achievements / Highlights</h3>
              <p className="text-xs text-slate-500">Record wins. Check the radio box for your key highlight.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleAddAchievement}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 text-purple-800 hover:bg-purple-100 text-xs font-bold transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Win</span>
          </button>
        </div>

        <div className="space-y-3">
          {achievementItems.map((achieve, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer shrink-0">
                <input
                  type="radio"
                  name="keyAchievementRadio"
                  checked={keyAchievementIndex === idx}
                  onChange={() => setKeyAchievementIndex(idx)}
                  className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                />
                <span className="font-semibold text-slate-700">Key Win</span>
              </label>

              <input
                type="text"
                value={achieve}
                onChange={(e) => {
                  const copy = [...achievementItems];
                  copy[idx] = e.target.value;
                  setAchievementItems(copy);
                }}
                placeholder="e.g. Optimized database query reducing latency by 40%"
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />

              {achievementItems.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveAchievement(idx)}
                  className="p-1 text-slate-400 hover:text-rose-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 7: Hours Worked Breakdown */}
      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Section 7 – Hours Worked</h3>
              <p className="text-xs text-slate-500">Break down your weekly time spent across activity categories</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-400 uppercase font-semibold">Total Logged</div>
            <div className="text-xl font-black text-brand-600">{totalHours} hrs</div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div>
            <label className="block text-[11px] font-semibold uppercase text-slate-600 mb-1">
              Development
            </label>
            <input
              type="number"
              min="0"
              value={hours.development}
              onChange={(e) => setHours({ ...hours, development: Math.max(0, Number(e.target.value)) })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase text-slate-600 mb-1">
              Testing & QA
            </label>
            <input
              type="number"
              min="0"
              value={hours.testing}
              onChange={(e) => setHours({ ...hours, testing: Math.max(0, Number(e.target.value)) })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase text-slate-600 mb-1">
              Meetings
            </label>
            <input
              type="number"
              min="0"
              value={hours.meetings}
              onChange={(e) => setHours({ ...hours, meetings: Math.max(0, Number(e.target.value)) })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase text-slate-600 mb-1">
              Docs & Design
            </label>
            <input
              type="number"
              min="0"
              value={hours.documentation}
              onChange={(e) => setHours({ ...hours, documentation: Math.max(0, Number(e.target.value)) })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase text-slate-600 mb-1">
              Other Tasks
            </label>
            <input
              type="number"
              min="0"
              value={hours.other}
              onChange={(e) => setHours({ ...hours, other: Math.max(0, Number(e.target.value)) })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800"
            />
          </div>
        </div>
      </div>

      {/* SECTION 8: Notes & Links */}
      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-100">
          <div className="p-2 rounded-xl bg-slate-100 text-slate-600">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Section 8 – Notes & Useful Links</h3>
            <p className="text-xs text-slate-500">Attach Figma mockups, demo recordings, or additional thoughts</p>
          </div>
        </div>

        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Demo URL: https://staging.teamtrack.internal/demo&#10;Figma: https://figma.com/file/..."
          className="w-full p-3.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
        />
      </div>

      {/* Form Action Controls (Sticky bottom bar) */}
      <div className="sticky bottom-4 z-30 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-xl flex items-center justify-between gap-4">
        <div className="text-xs text-slate-500 hidden sm:block">
          All sections will be preserved. You can edit anytime before submitting.
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={submittingDraft || submittingFinal}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            {submittingDraft ? (
              <div className="w-4 h-4 border-2 border-slate-700 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4 text-slate-500" />
            )}
            <span>Save Draft</span>
          </button>

          <button
            type="button"
            onClick={handleInitiateSubmit}
            disabled={submittingDraft || submittingFinal}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-sm font-bold text-white shadow-md shadow-brand-500/20 transition-all disabled:opacity-50"
          >
            {submittingFinal ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>
              {initialData?.status === 'NEEDS_CORRECTION' ? 'Resubmit Report' : 'Submit Report'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
