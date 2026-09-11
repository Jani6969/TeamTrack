const express = require('express');
const { body } = require('express-validator');
const {
  getProjects,
  createProject,
  updateProject,
  deleteProject
} = require('../controllers/projectController');
const authMiddleware = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/errorMiddleware');

const router = express.Router();

// All project routes require authentication
router.use(authMiddleware);

/**
 * @route   GET /api/projects
 * @desc    Get all projects
 * @access  Private (All authenticated users)
 */
router.get('/', getProjects);

/**
 * @route   POST /api/projects
 * @desc    Create a new project
 * @access  Private (Manager only)
 */
router.post(
  '/',
  requireRole('MANAGER'),
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Project name is required'),
    validate
  ],
  createProject
);

/**
 * @route   PUT /api/projects/:id
 * @desc    Update a project
 * @access  Private (Manager only)
 */
router.put('/:id', requireRole('MANAGER'), updateProject);

/**
 * @route   DELETE /api/projects/:id
 * @desc    Delete a project
 * @access  Private (Manager only)
 */
router.delete('/:id', requireRole('MANAGER'), deleteProject);

module.exports = router;
