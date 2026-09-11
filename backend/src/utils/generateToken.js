const jwt = require('jsonwebtoken');

/**
 * Generate a JSON Web Token (JWT)
 * Payload contains: userId, role
 * Used to authenticate subsequent requests via the Authorization header.
 * 
 * @param {Object} user - User document containing _id and role
 * @returns {string} Signed JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      role: user.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    }
  );
};

module.exports = generateToken;
