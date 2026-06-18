const router     = require('express').Router();
const Joi        = require('joi');
const ctrl       = require('../controllers/auth.controller');
const { authenticate }  = require('../middleware/auth.middleware');
const { validate }      = require('../middleware/validate.middleware');

const registerSchema = Joi.object({
  name:     Joi.string().min(2).max(100).required(),
  email:    Joi.string().email().lowercase().required(),
  phone:    Joi.string().pattern(/^\d{10}$/).required().messages({ 'string.pattern.base': 'Phone must be 10 digits' }),
  password: Joi.string().min(6).required()
              .messages({ 'string.min': 'Password must be at least 6 characters' }),
});

const loginSchema = Joi.object({
  email:    Joi.string().email().lowercase().required(),
  password: Joi.string().required(),
});

const refreshSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

const updateSchema = Joi.object({
  name:  Joi.string().min(2).max(100),
  phone: Joi.string().pattern(/^\d{10}$/),
}).min(1);

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and user profile
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new customer account
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, phone, password]
 *             properties:
 *               name:     { type: string, example: Sathvika Tummala }
 *               email:    { type: string, example: sathvika@example.com }
 *               phone:    { type: string, example: "9849094213" }
 *               password: { type: string, example: "Secret@123" }
 *     responses:
 *       201:
 *         description: Registration successful
 *       409:
 *         description: Email or phone already registered
 */
router.post('/register', validate(registerSchema), ctrl.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login and receive JWT tokens
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:    { type: string, example: sathvika@example.com }
 *               password: { type: string, example: "Secret@123" }
 *     responses:
 *       200:
 *         description: Login successful, returns accessToken and refreshToken
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', validate(loginSchema), ctrl.login);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Get a new access token using refresh token
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200:
 *         description: New access and refresh tokens
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post('/refresh', validate(refreshSchema), ctrl.refresh);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Revoke refresh token and logout
 *     tags: [Auth]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200:
 *         description: Logged out
 */
router.post('/logout', authenticate, ctrl.logout);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: User profile
 *       401:
 *         description: Unauthorized
 */
router.get('/me', authenticate, ctrl.getProfile);

/**
 * @swagger
 * /auth/me:
 *   patch:
 *     summary: Update current user profile (name, phone)
 *     tags: [Auth]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:  { type: string }
 *               phone: { type: string }
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.patch('/me', authenticate, validate(updateSchema), ctrl.updateProfile);

module.exports = router;
