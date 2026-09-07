const Report = require('../models/Report');
const Review = require('../models/Review');
const Project = require('../models/Project');

// ==========================================
// TEAM MEMBER REPORT CONTROLLERS
// ==========================================

/**
 * @desc    Create a new report (Draft)
 * @route   POST /api/reports
 * @access  Private (Team Member)
 */
const createReport = async (req, res, next) => {
  try {
    const {
      weekStart,
      weekEnd,
      project,
      tasks,
      plannedTasks,
      blockers,
      keyBlocker,
      achievements,
      keyAchievement,
      hoursWorked,
      notes
    } = req.body;

    // Verify project exists
    const projectExists = await Project.findById(project);
    if (!projectExists) {
      return res.status(404).json({
        success: false,
        message: 'Selected project does not exist'
      });
    }

    const report = await Report.create({
      user: req.user._id,
      weekStart,
      weekEnd,
      project,
      tasks: tasks || [],
      plannedTasks: plannedTasks || '',
      blockers: blockers || '',
      keyBlocker: keyBlocker || '',
      achievements: achievements || '',
      keyAchievement: keyAchievement || '',
      hoursWorked: hoursWorked || {},
      notes: notes || '',
      status: 'DRAFT'
    });

    res.status(201).json({
      success: true,
      message: 'Report draft created successfully',
      data: {
        report
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get logged-in user's reports with pagination
 * @route   GET /api/reports/my
 * @access  Private (Team Member)
 */
const getMyReports = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const query = { user: req.user._id };

    if (req.query.status) {
      query.status = req.query.status;
    }

    const total = await Report.countDocuments(query);
    const reports = await Report.find(query)
      .populate('project', 'name description')
      .sort({ weekStart: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      message: 'My reports retrieved successfully',
      data: {
        reports,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single report by ID (Ownership verified)
 * @route   GET /api/reports/:id
 * @access  Private (Owner or Manager)
 */
const getReportById = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('user', 'name email role')
      .populate('project', 'name description isActive');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Ownership check: Team members can ONLY view their own reports
    if (
      req.user.role !== 'MANAGER' &&
      report.user._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to access this report'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Report retrieved successfully',
      data: {
        report
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Edit a report (Ownership verified; only DRAFT or NEEDS_CORRECTION)
 * @route   PUT /api/reports/:id
 * @access  Private (Report Owner)
 */
const updateReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Ownership check: Team member must own the report
    if (report.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to edit this report'
      });
    }

    // Status check: Cannot edit if SUBMITTED or APPROVED
    if (report.status === 'SUBMITTED' || report.status === 'APPROVED') {
      return res.status(400).json({
        success: false,
        message: `Cannot edit report while in ${report.status} status. Only DRAFT or NEEDS_CORRECTION can be edited.`
      });
    }

    const {
      weekStart,
      weekEnd,
      project,
      tasks,
      plannedTasks,
      blockers,
      keyBlocker,
      achievements,
      keyAchievement,
      hoursWorked,
      notes
    } = req.body;

    if (project) {
      const projectExists = await Project.findById(project);
      if (!projectExists) {
        return res.status(404).json({
          success: false,
          message: 'Selected project does not exist'
        });
      }
      report.project = project;
    }

    if (weekStart) report.weekStart = weekStart;
    if (weekEnd) report.weekEnd = weekEnd;
    if (tasks !== undefined) report.tasks = tasks;
    if (plannedTasks !== undefined) report.plannedTasks = plannedTasks;
    if (blockers !== undefined) report.blockers = blockers;
    if (keyBlocker !== undefined) report.keyBlocker = keyBlocker;
    if (achievements !== undefined) report.achievements = achievements;
    if (keyAchievement !== undefined) report.keyAchievement = keyAchievement;
    if (hoursWorked !== undefined) report.hoursWorked = hoursWorked;
    if (notes !== undefined) report.notes = notes;

    await report.save();

    res.status(200).json({
      success: true,
      message: 'Report updated successfully',
      data: {
        report
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit a report (DRAFT -> SUBMITTED)
 * @route   POST /api/reports/:id/submit
 * @access  Private (Report Owner)
 */
const submitReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Ownership check
    if (report.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to submit this report'
      });
    }

    // Status transition validation
    if (report.status === 'SUBMITTED') {
      return res.status(400).json({
        success: false,
        message: 'Report is already submitted'
      });
    }

    if (report.status === 'APPROVED') {
      return res.status(400).json({
        success: false,
        message: 'Cannot submit an already approved report'
      });
    }

    if (report.status !== 'DRAFT') {
      return res.status(400).json({
        success: false,
        message: `Invalid transition: Cannot submit report in ${report.status} status. Use resubmit for NEEDS_CORRECTION.`
      });
    }

    report.status = 'SUBMITTED';
    report.submittedAt = new Date();
    await report.save();

    res.status(200).json({
      success: true,
      message: 'Report submitted successfully for manager review',
      data: {
        report
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Resubmit a corrected report (NEEDS_CORRECTION -> SUBMITTED)
 * @route   POST /api/reports/:id/resubmit
 * @access  Private (Report Owner)
 */
const resubmitReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Ownership check
    if (report.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to resubmit this report'
      });
    }

    // Status transition validation: Only NEEDS_CORRECTION -> SUBMITTED allowed
    if (report.status !== 'NEEDS_CORRECTION') {
      return res.status(400).json({
        success: false,
        message: `Cannot resubmit report with status ${report.status}. Resubmission is only allowed for reports marked NEEDS_CORRECTION.`
      });
    }

    report.status = 'SUBMITTED';
    report.submittedAt = new Date();
    await report.save();

    res.status(200).json({
      success: true,
      message: 'Report resubmitted successfully',
      data: {
        report
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get review history for a report
 * @route   GET /api/reports/:id/reviews
 * @access  Private (Owner or Manager)
 */
const getReportReviews = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Ownership check: Team members can ONLY view reviews of their own reports
    if (
      req.user.role !== 'MANAGER' &&
      report.user.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view reviews for this report'
      });
    }

    const reviews = await Review.find({ report: report._id })
      .populate('reviewer', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Review history retrieved successfully',
      data: {
        reviews
      }
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// MANAGER REPORT CONTROLLERS
// ==========================================

/**
 * @desc    Get team reports with filtering and pagination
 * @route   GET /api/manager/reports
 * @access  Private (Manager only)
 */
const getManagerReports = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const filter = {};

    // Filter by status (e.g. SUBMITTED, APPROVED, etc.)
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Filter by user/member ID
    if (req.query.userId) {
      filter.user = req.query.userId;
    }

    // Filter by project ID
    if (req.query.projectId) {
      filter.project = req.query.projectId;
    }

    // Filter by date range
    if (req.query.startDate || req.query.endDate) {
      filter.weekStart = {};
      if (req.query.startDate) {
        filter.weekStart.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        filter.weekStart.$lte = new Date(req.query.endDate);
      }
    }

    const total = await Report.countDocuments(filter);
    const reports = await Report.find(filter)
      .populate('user', 'name email role')
      .populate('project', 'name description')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      message: 'Team reports retrieved successfully',
      data: {
        reports,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get any single report by ID (Manager only)
 * @route   GET /api/manager/reports/:id
 * @access  Private (Manager only)
 */
const getManagerReportById = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('user', 'name email role')
      .populate('project', 'name description isActive');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Report retrieved successfully',
      data: {
        report
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Approve a report (SUBMITTED -> APPROVED)
 * @route   POST /api/manager/reports/:id/approve
 * @access  Private (Manager only)
 */
const approveReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Status transition validation: Only SUBMITTED -> APPROVED is allowed
    if (report.status !== 'SUBMITTED') {
      return res.status(400).json({
        success: false,
        message: `Cannot approve report in ${report.status} status. Only SUBMITTED reports can be approved.`
      });
    }

    report.status = 'APPROVED';
    report.approvedAt = new Date();
    await report.save();

    // Create review history entry
    const review = await Review.create({
      report: report._id,
      reviewer: req.user._id,
      action: 'APPROVED',
      comment: req.body.comment || 'Report approved'
    });

    res.status(200).json({
      success: true,
      message: 'Report approved successfully',
      data: {
        report,
        review
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Request correction on a report (SUBMITTED -> NEEDS_CORRECTION)
 * @route   POST /api/manager/reports/:id/request-correction
 * @access  Private (Manager only)
 */
const requestCorrection = async (req, res, next) => {
  try {
    const { comment } = req.body;

    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Status transition validation: Only SUBMITTED -> NEEDS_CORRECTION is allowed
    if (report.status !== 'SUBMITTED') {
      return res.status(400).json({
        success: false,
        message: `Cannot request correction on report with status ${report.status}. Only SUBMITTED reports can be reviewed.`
      });
    }

    report.status = 'NEEDS_CORRECTION';
    report.latestReviewComment = comment;
    await report.save();

    // Create review history entry
    const review = await Review.create({
      report: report._id,
      reviewer: req.user._id,
      action: 'REQUEST_CORRECTION',
      comment
    });

    res.status(200).json({
      success: true,
      message: 'Correction requested successfully',
      data: {
        report,
        review
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReport,
  getMyReports,
  getReportById,
  updateReport,
  submitReport,
  resubmitReport,
  getReportReviews,
  getManagerReports,
  getManagerReportById,
  approveReport,
  requestCorrection
};
