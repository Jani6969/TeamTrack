const express = require('express');
const {
  chatWithAssistant,
  getTeamSummary,
  getSuggestedPrompts
} = require('../controllers/aiController');
const authMiddleware = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

const router = express.Router();

// Require authentication for all AI endpoints
router.use(authMiddleware);

/**
 * @route   POST /api/ai/chat
 * @desc    Send query to AI Assistant with dynamic DB context
 * @access  Private (Authenticated users)
 */
router.post('/chat', chatWithAssistant);

/**
 * @route   POST /api/ai/summary
 * @desc    Generate AI executive team intelligence summary
 * @access  Private (Manager only)
 */
router.post('/summary', requireRole('MANAGER'), getTeamSummary);

/**
 * @route   GET /api/ai/suggestions
 * @desc    Get dynamic smart query suggestions
 * @access  Private (Authenticated users)
 */
router.get('/suggestions', getSuggestedPrompts);

module.exports = router;
