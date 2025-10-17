const authService = require('../services/authService');

/**
 * Register a new user
 */
async function register(req, res) {
  try {
    const { email, password, name } = req.body;

    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Email, password, and name are required'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Invalid email format'
      });
    }

    // Password validation (min 6 characters)
    if (password.length < 6) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Password must be at least 6 characters long'
      });
    }

    // Register user
    const result = await authService.register(email, password, name);

    res.status(201).json({
      message: 'User registered successfully',
      user: result.user,
      token: result.token
    });
  } catch (error) {
    console.error('Register error:', error);

    if (error.message === 'User with this email already exists') {
      return res.status(409).json({
        error: 'Conflict',
        message: error.message
      });
    }

    res.status(500).json({
      error: 'Registration failed',
      message: error.message
    });
  }
}

/**
 * Login user
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Email and password are required'
      });
    }

    // Login user
    const result = await authService.login(email, password);

    res.json({
      message: 'Login successful',
      user: result.user,
      token: result.token
    });
  } catch (error) {
    console.error('Login error:', error);

    if (error.message === 'Invalid email or password') {
      return res.status(401).json({
        error: 'Authentication failed',
        message: error.message
      });
    }

    res.status(500).json({
      error: 'Login failed',
      message: error.message
    });
  }
}

/**
 * Get current user profile
 * Requires authentication
 */
async function getProfile(req, res) {
  try {
    // req.user is set by authenticate middleware
    const user = await authService.getUserById(req.user.userId);

    res.json({
      user
    });
  } catch (error) {
    console.error('Get profile error:', error);

    if (error.message === 'User not found') {
      return res.status(404).json({
        error: 'Not found',
        message: error.message
      });
    }

    res.status(500).json({
      error: 'Failed to get profile',
      message: error.message
    });
  }
}

module.exports = {
  register,
  login,
  getProfile
};
