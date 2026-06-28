const UserModel      = require('../models/user.model');
const AuditModel     = require('../models/audit.model');
const ReferralService = require('./referral.service');
const EmailService   = require('./email.service');
const { hash, compare }                       = require('../utils/bcrypt.utils');
const { signAccess, signRefresh, verifyRefresh, hashToken } = require('../utils/jwt.utils');

const REFRESH_TTL_DAYS = 7;

const _buildTokens = async (user) => {
  const payload = { id: user.id, email: user.email, role: user.role };
  const accessToken  = signAccess(payload);
  const refreshToken = signRefresh(payload);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TTL_DAYS);

  await UserModel.saveRefreshToken(user.id, hashToken(refreshToken), expiresAt);
  return { accessToken, refreshToken };
};

const register = async ({ name, email, phone, password, referral_code }, req) => {
  const [existingEmail, existingPhone] = await Promise.all([
    UserModel.findByEmail(email),
    UserModel.findByPhone(phone),
  ]);

  if (existingEmail) throw Object.assign(new Error('Email already registered'), { statusCode: 409, expose: true });
  if (existingPhone) throw Object.assign(new Error('Phone already registered'), { statusCode: 409, expose: true });

  const password_hash = await hash(password);
  const user = await UserModel.create({ name, email, phone, password_hash });

  await AuditModel.log({
    userId: user.id, action: 'USER_REGISTER',
    entityType: 'users', entityId: user.id,
    newValues: { name, email, phone, role: 'customer' },
    ip: req?.ip, userAgent: req?.headers?.['user-agent'],
  });

  if (referral_code) {
    await ReferralService.processReferral(user.id, referral_code).catch(() => {});
  }

  EmailService.sendWelcomeEmail({ customerName: user.name, customerEmail: user.email }).catch(() => {});

  const tokens = await _buildTokens(user);
  return { user, ...tokens };
};

const login = async ({ email, password }, req) => {
  const user = await UserModel.findByEmail(email);
  if (!user) throw Object.assign(new Error('Invalid email or password'), { statusCode: 401, expose: true });

  const valid = await compare(password, user.password_hash);
  if (!valid) throw Object.assign(new Error('Invalid email or password'), { statusCode: 401, expose: true });

  if (user.is_deleted) throw Object.assign(new Error('Account has been deactivated'), { statusCode: 403, expose: true });

  await AuditModel.log({
    userId: user.id, action: 'USER_LOGIN',
    entityType: 'users', entityId: user.id,
    ip: req?.ip, userAgent: req?.headers?.['user-agent'],
  });

  const { password_hash: _, ...safeUser } = user;
  const tokens = await _buildTokens(safeUser);
  return { user: safeUser, ...tokens };
};

const refresh = async (refreshToken) => {
  let payload;
  try {
    payload = verifyRefresh(refreshToken);
  } catch {
    throw Object.assign(new Error('Invalid or expired refresh token'), { statusCode: 401, expose: true });
  }

  const stored = await UserModel.findRefreshToken(hashToken(refreshToken));
  if (!stored) throw Object.assign(new Error('Refresh token revoked or not found'), { statusCode: 401, expose: true });

  await UserModel.revokeRefreshToken(hashToken(refreshToken));

  const user = await UserModel.findById(payload.id);
  if (!user) throw Object.assign(new Error('User not found'), { statusCode: 401, expose: true });

  const tokens = await _buildTokens(user);
  return tokens;
};

const logout = async (refreshToken) => {
  if (refreshToken) {
    await UserModel.revokeRefreshToken(hashToken(refreshToken));
  }
};

const getProfile = async (userId) => {
  const user = await UserModel.findById(userId);
  if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404, expose: true });
  return user;
};

const updateProfile = async (userId, fields, req) => {
  const allowed = ['name', 'phone'];
  const update  = {};
  for (const key of allowed) {
    if (fields[key] !== undefined) update[key] = fields[key];
  }
  if (!Object.keys(update).length) {
    throw Object.assign(new Error('No valid fields to update'), { statusCode: 400, expose: true });
  }
  const updated = await UserModel.update(userId, update);

  await AuditModel.log({
    userId, action: 'USER_UPDATE_PROFILE',
    entityType: 'users', entityId: userId,
    newValues: update,
    ip: req?.ip, userAgent: req?.headers?.['user-agent'],
  });

  return updated;
};

const _findOrCreateGoogleUser = async (googleId, email, name, req) => {
  let user = await UserModel.findByGoogleId(googleId);
  if (!user) {
    user = await UserModel.findByEmail(email);
    if (user) {
      user = await UserModel.updateGoogleId(user.id, googleId);
    } else {
      const password_hash = await hash(require('crypto').randomBytes(32).toString('hex'));
      user = await UserModel.create({ name, email, password_hash, google_id: googleId });
      await AuditModel.log({
        userId: user.id, action: 'USER_REGISTER_GOOGLE',
        entityType: 'users', entityId: user.id,
        newValues: { name, email, role: 'customer', method: 'google' },
        ip: req?.ip, userAgent: req?.headers?.['user-agent'],
      });
      EmailService.sendWelcomeEmail({ customerName: name, customerEmail: email }).catch(() => {});
    }
  }
  if (user.is_deleted) throw Object.assign(new Error('Account has been deactivated'), { statusCode: 403, expose: true });
  const { password_hash: _, ...safeUser } = user;
  return safeUser;
};

const googleAuth = async (accessToken, req) => {
  const res = await fetch('https://www.googleapis.com/userinfo/v2/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw Object.assign(new Error('Google token verification failed'), { statusCode: 401, expose: true });
  const { id: googleId, email, name } = await res.json();
  if (!email) throw Object.assign(new Error('Google account has no email'), { statusCode: 400, expose: true });
  const safeUser = await _findOrCreateGoogleUser(googleId, email, name, req);
  const tokens = await _buildTokens(safeUser);
  return { user: safeUser, ...tokens };
};

const googleAuthCode = async (code, req) => {
  const callbackUrl = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5001/api/v1/auth/google/callback';
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id:     process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri:  callbackUrl,
      grant_type:    'authorization_code',
    }),
  });
  const tokenData = await tokenRes.json();
  if (tokenData.error) throw new Error(`Google token exchange failed: ${tokenData.error_description || tokenData.error}`);

  const userRes = await fetch('https://www.googleapis.com/userinfo/v2/me', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  if (!userRes.ok) throw new Error('Failed to fetch Google user info');
  const { id: googleId, email, name } = await userRes.json();
  if (!email) throw new Error('Google account has no email');

  const safeUser = await _findOrCreateGoogleUser(googleId, email, name, req);
  const tokens = await _buildTokens(safeUser);
  return { user: safeUser, ...tokens };
};

module.exports = { register, login, refresh, logout, getProfile, updateProfile, googleAuth, googleAuthCode };
