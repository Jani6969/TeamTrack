const {
  processChatMessage,
  generateTeamSummary,
  getSuggestedPrompts: fetchSuggestedPrompts
} = require('../services/aiService');

/**
 * @desc    Chat with TeamTrack AI Copilot
 * @route   POST /api/ai/chat
 * @access  Private (Authenticated users)
 */
const chatWithAssistant = async (req, res, next) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'A non-empty message string is required.'
      });
    }

    const result = await processChatMessage(req.user, message.trim(), history || []);

    res.status(200).json({
      success: true,
      message: 'AI response generated successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Generate AI Executive Team Summary (Managers only)
 * @route   POST /api/ai/summary
 * @access  Private (Manager only)
 */
const getTeamSummary = async (req, res, next) => {
  try {
    if (req.user.role !== 'MANAGER') {
      return res.status(403).json({
        success: false,
        message: 'Only managers can generate team-wide AI summaries.'
      });
    }

    const result = await generateTeamSummary(req.user);

    res.status(200).json({
      success: true,
      message: 'Team intelligence summary generated successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get dynamic contextual suggested prompts
 * @route   GET /api/ai/suggestions
 * @access  Private (Authenticated users)
 */
const getSuggestedPrompts = async (req, res, next) => {
  try {
    const prompts = await fetchSuggestedPrompts(req.user);

    res.status(200).json({
      success: true,
      message: 'Suggested prompts retrieved successfully',
      data: {
        prompts
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  chatWithAssistant,
  getTeamSummary,
  getSuggestedPrompts
};
