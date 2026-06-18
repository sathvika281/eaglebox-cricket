const AuthService = require('../services/auth.service');
const R = require('../utils/response.utils');

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

module.exports = { register, login, refresh, logout, getProfile, updateProfile };
