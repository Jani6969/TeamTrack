const express = require('express');
const { body } = require('express-validator');
const {
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser
} = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/errorMiddleware');

const router = express.Router();

// All user management routes require MANAGER role
router.use(authMiddleware);
router.use(requireRole('MANAGER'));

/**
 * @route   GET /api/users
 * @desc    Get all users
 * @access  Private (Manager only)
 */
router.get('/', getAllUsers);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private (Manager only)
 */
router.get('/:id', getUserById);

/**
 * @route   PUT /api/users/:id/role
 * @desc    Update user role
 * @access  Private (Manager only)
 */
router.put(
  '/:id/role',
  [
    body('role')
      .isIn(['TEAM_MEMBER', 'MANAGER'])
      .withMessage('Role must be either TEAM_MEMBER or MANAGER'),
    validate
  ],
  updateUserRole
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete a user
 * @access  Private (Manager only)
 */
router.delete('/:id', deleteUser);

module.exports = router;
