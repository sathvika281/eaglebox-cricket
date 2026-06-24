const AuthService = require('../services/auth.service');
const R           = require('../utils/response.utils');

const register = async (req, res, next) => {
  try {
    const { user, accessToken, refreshToken } = await AuthService.register(req.body, req);
    return R.created(res, { user, accessToken, refreshToken }, 'Registration successful');
  } catch (err) { next(err); }
};

const login = async (req, res, next) => {
  try {
    const { user, accessToken, refreshToken } = await AuthService.login(req.body, req);
    return R.success(res, { user, accessToken, refreshToken }, 'Login successful');
  } catch (err) { next(err); }
};

const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const tokens = await AuthService.refresh(refreshToken);
    return R.success(res, tokens, 'Token refreshed');
  } catch (err) { next(err); }
};

const logout = async (req, res, next) => {
  try {
    await AuthService.logout(req.body.refreshToken);
    return R.success(res, {}, 'Logged out successfully');
  } catch (err) { next(err); }
};

const getProfile = async (req, res, next) => {
  try {
    const user = await AuthService.getProfile(req.user.id);
    return R.success(res, { user });
  } catch (err) { next(err); }
};

const updateProfile = async (req, res, next) => {
  try {
    const user = await AuthService.updateProfile(req.user.id, req.body, req);
    return R.success(res, { user }, 'Profile updated');
  } catch (err) { next(err); }
};

const googleAuth = async (req, res, next) => {
  try {
    const { access_token } = req.body;
    if (!access_token) return R.error(res, 'access_token is required', 400);
    const { user, accessToken, refreshToken } = await AuthService.googleAuth(access_token, req);
    return R.success(res, { user, accessToken, refreshToken }, 'Google login successful');
  } catch (err) { next(err); }
};

const googleRedirect = (req, res) => {
  const params = new URLSearchParams({
    client_id:     process.env.GOOGLE_CLIENT_ID,
    redirect_uri:  process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5001/api/v1/auth/google/callback',
    response_type: 'code',
    scope:         'openid email profile',
    access_type:   'offline',
    prompt:        'select_account',
  });
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
};

const googleCallback = async (req, res) => {
  const { code, error } = req.query;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  if (error || !code) {
    return res.redirect(`${frontendUrl}/login?error=google_cancelled`);
  }

  try {
    const { user, accessToken, refreshToken } = await AuthService.googleAuthCode(code, req);
    const params = new URLSearchParams({ token: accessToken, refresh: refreshToken, name: user.name });
    res.redirect(`${frontendUrl}/auth/callback?${params}`);
  } catch (err) {
    console.error('Google callback error:', err.message);
    res.redirect(`${frontendUrl}/login?error=google_failed`);
  }
};

module.exports = { register, login, refresh, logout, getProfile, updateProfile, googleAuth, googleRedirect, googleCallback };
