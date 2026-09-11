const Report = require('../models/Report');
const User = require('../models/User');
const Review = require('../models/Review');
const Project = require('../models/Project');

/**
 * @desc    Get dashboard summary statistics (Manager only)
 * @route   GET /api/dashboard/summary
 * @access  Private (Manager only)
 */
const getSummary = async (req, res, next) => {
  try {
    // Total reports in each status
    const pendingReports = await Report.countDocuments({ status: 'SUBMITTED' });
    const needsCorrection = await Report.countDocuments({ status: 'NEEDS_CORRECTION' });
    const approvedReports = await Report.countDocuments({ status: 'APPROVED' });
    const draftReports = await Report.countDocuments({ status: 'DRAFT' });

    // Total non-draft reports submitted
    const totalReportsSubmitted = pendingReports + needsCorrection + approvedReports;

    // Total team members
    const totalTeamMembers = await User.countDocuments({ role: 'TEAM_MEMBER' });

    // Open blockers in active (unapproved) reports
    const openBlockers = await Report.countDocuments({
      status: { $in: ['SUBMITTED', 'NEEDS_CORRECTION'] },
      $or: [
        { blockers: { $exists: true, $ne: '' } },
        { keyBlocker: { $exists: true, $ne: '' } }
      ]
    });

    // Submission compliance rate: Percentage of non-draft reports out of total reports
    const totalAllReports = totalReportsSubmitted + draftReports;
    const submissionComplianceRate = totalAllReports > 0
      ? Number(((totalReportsSubmitted / totalAllReports) * 100).toFixed(1))
      : 100;

    res.status(200).json({
      success: true,
      message: 'Dashboard summary retrieved successfully',
      data: {
        totalReportsSubmitted,
        submissionComplianceRate,
        pendingReports,
        needsCorrection,
        approvedReports,
        draftReports,
        totalTeamMembers,
        openBlockers
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get task status breakdown over time/weeks
 * @route   GET /api/dashboard/task-trend
 * @access  Private (Manager only)
 */
const getTaskTrend = async (req, res, next) => {
  try {
    // Aggregation pipeline:
    // 1. $unwind: Flattens the tasks array so each task becomes an individual document
    // 2. $group: Groups by weekStart date and counts statuses (COMPLETED, IN_PROGRESS, NOT_STARTED)
    // 3. $sort: Sorts chronologically by weekStart
    const trend = await Report.aggregate([
      { $unwind: '$tasks' },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$weekStart' }
          },
          completed: {
            $sum: { $cond: [{ $eq: ['$tasks.status', 'COMPLETED'] }, 1, 0] }
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ['$tasks.status', 'IN_PROGRESS'] }, 1, 0] }
          },
          notStarted: {
            $sum: { $cond: [{ $eq: ['$tasks.status', 'NOT_STARTED'] }, 1, 0] }
          },
          totalTasks: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          week: '$_id',
          completed: 1,
          inProgress: 1,
          notStarted: 1,
          totalTasks: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      message: 'Task trend retrieved successfully',
      data: {
        trend
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get report status counts broken down per team member
 * @route   GET /api/dashboard/status-by-member
 * @access  Private (Manager only)
 */
const getStatusByMember = async (req, res, next) => {
  try {
    // Aggregation pipeline:
    // 1. $group: Groups reports by user ID and accumulates counts for each status
    // 2. $lookup: Joins with the users collection to get member name and email
    // 3. $unwind: Unwinds user array from lookup
    // 4. $project: Formats output structure cleanly
    const statusByMember = await Report.aggregate([
      {
        $group: {
          _id: '$user',
          totalReports: { $sum: 1 },
          approved: {
            $sum: { $cond: [{ $eq: ['$status', 'APPROVED'] }, 1, 0] }
          },
          submitted: {
            $sum: { $cond: [{ $eq: ['$status', 'SUBMITTED'] }, 1, 0] }
          },
          needsCorrection: {
            $sum: { $cond: [{ $eq: ['$status', 'NEEDS_CORRECTION'] }, 1, 0] }
          },
          draft: {
            $sum: { $cond: [{ $eq: ['$status', 'DRAFT'] }, 1, 0] }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      { $unwind: '$userInfo' },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          name: '$userInfo.name',
          email: '$userInfo.email',
          totalReports: 1,
          approved: 1,
          submitted: 1,
          needsCorrection: 1,
          draft: 1
        }
      },
      { $sort: { name: 1 } }
    ]);

    res.status(200).json({
      success: true,
      message: 'Status by member retrieved successfully',
      data: {
        members: statusByMember
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get workload and hours logged per project
 * @route   GET /api/dashboard/workload-by-project
 * @access  Private (Manager only)
 */
const getWorkloadByProject = async (req, res, next) => {
  try {
    // Aggregation pipeline:
    // 1. $group: Groups by project and calculates total hours worked across all categories
    // 2. $lookup: Joins with projects collection to get the project name
    // 3. $project: Shapes final readable output
    const workload = await Report.aggregate([
      {
        $group: {
          _id: '$project',
          reportCount: { $sum: 1 },
          totalHours: {
            $sum: {
              $add: [
                { $ifNull: ['$hoursWorked.development', 0] },
                { $ifNull: ['$hoursWorked.testing', 0] },
                { $ifNull: ['$hoursWorked.meetings', 0] },
                { $ifNull: ['$hoursWorked.documentation', 0] },
                { $ifNull: ['$hoursWorked.other', 0] }
              ]
            }
          },
          totalTasks: { $sum: { $size: { $ifNull: ['$tasks', []] } } }
        }
      },
      {
        $lookup: {
          from: 'projects',
          localField: '_id',
          foreignField: '_id',
          as: 'projectInfo'
        }
      },
      { $unwind: '$projectInfo' },
      {
        $project: {
          _id: 0,
          projectId: '$_id',
          projectName: '$projectInfo.name',
          reportCount: 1,
          totalHours: 1,
          totalTasks: 1
        }
      },
      { $sort: { totalHours: -1 } }
    ]);

    res.status(200).json({
      success: true,
      message: 'Workload by project retrieved successfully',
      data: {
        workload
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get total hours broken down by task category
 * @route   GET /api/dashboard/time-by-task-type
 * @access  Private (Manager only)
 */
const getTimeByTaskType = async (req, res, next) => {
  try {
    // Aggregation pipeline:
    // Sums up each hoursWorked property across all reports
    const result = await Report.aggregate([
      {
        $group: {
          _id: null,
          development: { $sum: { $ifNull: ['$hoursWorked.development', 0] } },
          testing: { $sum: { $ifNull: ['$hoursWorked.testing', 0] } },
          meetings: { $sum: { $ifNull: ['$hoursWorked.meetings', 0] } },
          documentation: { $sum: { $ifNull: ['$hoursWorked.documentation', 0] } },
          other: { $sum: { $ifNull: ['$hoursWorked.other', 0] } }
        }
      },
      {
        $project: {
          _id: 0,
          development: 1,
          testing: 1,
          meetings: 1,
          documentation: 1,
          other: 1,
          total: {
            $add: [
              '$development',
              '$testing',
              '$meetings',
              '$documentation',
              '$other'
            ]
          }
        }
      }
    ]);

    const breakdown = result[0] || {
      development: 0,
      testing: 0,
      meetings: 0,
      documentation: 0,
      other: 0,
      total: 0
    };

    res.status(200).json({
      success: true,
      message: 'Time breakdown by task type retrieved successfully',
      data: breakdown
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get recent system activities (reviews, approvals, corrections)
 * @route   GET /api/dashboard/recent-activity
 * @access  Private (Manager only)
 */
const getRecentActivity = async (req, res, next) => {
  try {
    // Fetch latest 10 reviews with populated reviewer and report
    const recentReviews = await Review.find()
      .populate('reviewer', 'name email role')
      .populate({
        path: 'report',
        select: 'weekStart weekEnd user status',
        populate: { path: 'user', select: 'name email' }
      })
      .sort({ createdAt: -1 })
      .limit(10);

    const activities = recentReviews.map((review) => ({
      id: review._id,
      action: review.action,
      comment: review.comment,
      createdAt: review.createdAt,
      reviewer: review.reviewer ? review.reviewer.name : 'Unknown',
      reportOwner: review.report?.user ? review.report.user.name : 'Unknown',
      reportId: review.report?._id,
      reportWeek: review.report ? `${review.report.weekStart.toISOString().split('T')[0]} to ${review.report.weekEnd.toISOString().split('T')[0]}` : ''
    }));

    res.status(200).json({
      success: true,
      message: 'Recent activities retrieved successfully',
      data: {
        activities
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSummary,
  getTaskTrend,
  getStatusByMember,
  getWorkloadByProject,
  getTimeByTaskType,
  getRecentActivity
};
