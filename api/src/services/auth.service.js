const UserModel  = require('../models/user.model');
const AuditModel = require('../models/audit.model');
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

const register = async ({ name, email, phone, password }, req) => {
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

module.exports = { register, login, refresh, logout, getProfile, updateProfile };
