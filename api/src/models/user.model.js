const { query } = require('../config/database');
const crypto    = require('crypto');

const _genReferralCode = () => crypto.randomBytes(4).toString('hex').toUpperCase();

const findByGoogleId = async (googleId) => {
  const { rows } = await query(
    'SELECT * FROM users WHERE google_id = $1 AND is_deleted = FALSE',
    [googleId]
  );
  return rows[0] || null;
};

const findByEmail = async (email) => {
  const { rows } = await query(
    'SELECT * FROM users WHERE email = $1 AND is_deleted = FALSE',
    [email]
  );
  return rows[0] || null;
};

const findByPhone = async (phone) => {
  const { rows } = await query(
    'SELECT * FROM users WHERE phone = $1 AND is_deleted = FALSE',
    [phone]
  );
  return rows[0] || null;
};

const findById = async (id) => {
  const { rows } = await query(
    'SELECT id, name, email, phone, role, is_verified, created_at FROM users WHERE id = $1 AND is_deleted = FALSE',
    [id]
  );
  return rows[0] || null;
};

const create = async ({ name, email, phone = null, password_hash, role = 'customer', google_id = null }) => {
  let referral_code;
  for (let i = 0; i < 5; i++) {
    const candidate = _genReferralCode();
    const { rows: existing } = await query('SELECT id FROM users WHERE referral_code = $1', [candidate]);
    if (!existing.length) { referral_code = candidate; break; }
  }
  const { rows } = await query(
    `INSERT INTO users (name, email, phone, password_hash, role, google_id, referral_code)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     RETURNING id, name, email, phone, role, is_verified, referral_code, created_at`,
    [name, email, phone, password_hash, role, google_id, referral_code || null]
  );
  return rows[0];
};

const updateGoogleId = async (userId, googleId) => {
  const { rows } = await query(
    `UPDATE users SET google_id = $1, updated_at = NOW() WHERE id = $2
     RETURNING id, name, email, phone, role, is_verified, created_at`,
    [googleId, userId]
  );
  return rows[0] || null;
};

const update = async (id, fields) => {
  const keys   = Object.keys(fields);
  const values = Object.values(fields);
  const set    = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
  const { rows } = await query(
    `UPDATE users SET ${set}, updated_at = NOW() WHERE id = $${keys.length + 1}
     RETURNING id, name, email, phone, role, is_verified, updated_at`,
    [...values, id]
  );
  return rows[0] || null;
};

const softDelete = async (id) => {
  await query(
    `UPDATE users SET is_deleted = TRUE, deleted_at = NOW(), updated_at = NOW() WHERE id = $1`,
    [id]
  );
};

const saveRefreshToken = async (userId, tokenHash, expiresAt) => {
  await query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1,$2,$3)`,
    [userId, tokenHash, expiresAt]
  );
};

const findRefreshToken = async (tokenHash) => {
  const { rows } = await query(
    `SELECT * FROM refresh_tokens
     WHERE token_hash = $1 AND is_revoked = FALSE AND expires_at > NOW()`,
    [tokenHash]
  );
  return rows[0] || null;
};

const revokeRefreshToken = async (tokenHash) => {
  await query(
    `UPDATE refresh_tokens SET is_revoked = TRUE WHERE token_hash = $1`,
    [tokenHash]
  );
};

const revokeAllUserTokens = async (userId) => {
  await query(
    `UPDATE refresh_tokens SET is_revoked = TRUE WHERE user_id = $1`,
    [userId]
  );
};

const findByReferralCode = async (code) => {
  const { rows } = await query(
    'SELECT id, name, email, referral_code FROM users WHERE referral_code = $1 AND is_deleted = FALSE',
    [code.toUpperCase()]
  );
  return rows[0] || null;
};

module.exports = {
  findByEmail, findByPhone, findById, findByGoogleId, findByReferralCode,
  create, update, updateGoogleId, softDelete,
  saveRefreshToken, findRefreshToken, revokeRefreshToken, revokeAllUserTokens,
};
