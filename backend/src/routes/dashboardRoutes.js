const express = require('express');
const {
  getSummary,
  getTaskTrend,
  getStatusByMember,
  getWorkloadByProject,
  getTimeByTaskType,
  getRecentActivity
} = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

const router = express.Router();

// All dashboard endpoints require authentication and MANAGER role
router.use(authMiddleware);
router.use(requireRole('MANAGER'));

/**
 * @route   GET /api/dashboard/summary
 * @desc    High-level metrics summary
 * @access  Private (Manager only)
 */
router.get('/summary', getSummary);

/**
 * @route   GET /api/dashboard/task-trend
 * @desc    Task statuses grouped across weeks
 * @access  Private (Manager only)
 */
router.get('/task-trend', getTaskTrend);

/**
 * @route   GET /api/dashboard/status-by-member
 * @desc    Report statuses broken down per team member
 * @access  Private (Manager only)
 */
router.get('/status-by-member', getStatusByMember);

/**
 * @route   GET /api/dashboard/workload-by-project
 * @desc    Total hours and task volume per project
 * @access  Private (Manager only)
 */
router.get('/workload-by-project', getWorkloadByProject);

/**
 * @route   GET /api/dashboard/time-by-task-type
 * @desc    Cumulative hours categorized by work type
 * @access  Private (Manager only)
 */
router.get('/time-by-task-type', getTimeByTaskType);

/**
 * @route   GET /api/dashboard/recent-activity
 * @desc    Latest review events, submissions, and approvals
 * @access  Private (Manager only)
 */
router.get('/recent-activity', getRecentActivity);

module.exports = router;
