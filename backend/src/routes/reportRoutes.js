const express = require('express');
const { body } = require('express-validator');
const {
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
} = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/errorMiddleware');

// ====================================================
// Team Member Reports Router (mounted at /api/reports)
// ====================================================
const reportRouter = express.Router();

// Require authentication for all report operations
reportRouter.use(authMiddleware);

/**
 * @route   POST /api/reports
 * @desc    Create a new report draft
 * @access  Private (Team Member)
 */
reportRouter.post(
  '/',
  [
    body('weekStart')
      .notEmpty()
      .withMessage('Week start date is required')
      .isISO8601()
      .withMessage('Week start must be a valid date'),
    body('weekEnd')
      .notEmpty()
      .withMessage('Week end date is required')
      .isISO8601()
      .withMessage('Week end must be a valid date'),
    body('project')
      .notEmpty()
      .withMessage('Project reference is required')
      .isMongoId()
      .withMessage('Invalid project ID'),
    body('tasks')
      .isArray()
      .withMessage('Tasks must be an array'),
    validate
  ],
  createReport
);

/**
 * @route   GET /api/reports/my
 * @desc    Get reports created by the currently logged-in user
 * @access  Private (Team Member)
 */
reportRouter.get('/my', getMyReports);

/**
 * @route   GET /api/reports/:id
 * @desc    Get report details (Owner or Manager)
 * @access  Private
 */
reportRouter.get('/:id', getReportById);

/**
 * @route   PUT /api/reports/:id
 * @desc    Edit a report (Owner only, while in DRAFT or NEEDS_CORRECTION)
 * @access  Private
 */
reportRouter.put('/:id', updateReport);

/**
 * @route   POST /api/reports/:id/submit
 * @desc    Submit report for manager review (DRAFT -> SUBMITTED)
 * @access  Private (Owner only)
 */
reportRouter.post('/:id/submit', submitReport);

/**
 * @route   POST /api/reports/:id/resubmit
 * @desc    Resubmit corrected report (NEEDS_CORRECTION -> SUBMITTED)
 * @access  Private (Owner only)
 */
reportRouter.post('/:id/resubmit', resubmitReport);

/**
 * @route   GET /api/reports/:id/reviews
 * @desc    Get review history for a report
 * @access  Private (Owner or Manager)
 */
reportRouter.get('/:id/reviews', getReportReviews);

// ============================================================
// Manager Reports Router (mounted at /api/manager/reports)
// ============================================================
const managerReportRouter = express.Router();

// Require authentication and MANAGER role for all manager report operations
managerReportRouter.use(authMiddleware);
managerReportRouter.use(requireRole('MANAGER'));

/**
 * @route   GET /api/manager/reports
 * @desc    Get all team reports with filtering and pagination
 * @access  Private (Manager only)
 */
managerReportRouter.get('/', getManagerReports);

/**
 * @route   GET /api/manager/reports/:id
 * @desc    Get a single report by ID (Manager only)
 * @access  Private (Manager only)
 */
managerReportRouter.get('/:id', getManagerReportById);

/**
 * @route   POST /api/manager/reports/:id/approve
 * @desc    Approve a submitted report
 * @access  Private (Manager only)
 */
managerReportRouter.post('/:id/approve', approveReport);

/**
 * @route   POST /api/manager/reports/:id/request-correction
 * @desc    Request correction on a submitted report
 * @access  Private (Manager only)
 */
managerReportRouter.post(
  '/:id/request-correction',
  [
    body('comment')
      .trim()
      .notEmpty()
      .withMessage('Comment is required when requesting correction'),
    validate
  ],
  requestCorrection
);

module.exports = reportRouter;
module.exports.managerReportRouter = managerReportRouter;
