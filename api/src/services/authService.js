const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { getSession } = require('../db');
const { generateToken } = require('../utils/jwt');

const SALT_ROUNDS = 10;

/**
 * Register a new user
 * @param {string} email - User email
 * @param {string} password - User password (plain text, will be hashed)
 * @param {string} name - User name
 * @returns {Object} User object and JWT token
 */
async function register(email, password, name) {
  const session = getSession();

  try {
    // Check if user already exists
    const checkResult = await session.run(
      'MATCH (u:User {email: $email}) RETURN u',
      { email }
    );

    if (checkResult.records.length > 0) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const userId = uuidv4();
    const createdAt = new Date().toISOString();

    const result = await session.run(
      `CREATE (u:User {
        id: $id,
        email: $email,
        password: $password,
        name: $name,
        createdAt: $createdAt
      })
      RETURN u`,
      {
        id: userId,
        email,
        password: hashedPassword,
        name,
        createdAt
      }
    );

    const user = result.records[0].get('u').properties;

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email
    });

    // Return user without password
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt
      },
      token
    };
  } finally {
    await session.close();
  }
}

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password (plain text)
 * @returns {Object} User object and JWT token
 */
async function login(email, password) {
  const session = getSession();

  try {
    // Find user
    const result = await session.run(
      'MATCH (u:User {email: $email}) RETURN u',
      { email }
    );

    if (result.records.length === 0) {
      throw new Error('Invalid email or password');
    }

    const user = result.records[0].get('u').properties;

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email
    });

    // Return user without password
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt
      },
      token
    };
  } finally {
    await session.close();
  }
}

/**
 * Get user by ID
 * @param {string} userId - User ID
 * @returns {Object} User object
 */
async function getUserById(userId) {
  const session = getSession();

  try {
    const result = await session.run(
      'MATCH (u:User {id: $userId}) RETURN u',
      { userId }
    );

    if (result.records.length === 0) {
      throw new Error('User not found');
    }

    const user = result.records[0].get('u').properties;

    // Return user without password
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt
    };
  } finally {
    await session.close();
  }
}

module.exports = {
  register,
  login,
  getUserById
};
