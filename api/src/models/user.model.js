const { query } = require('../config/database');

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

const create = async ({ name, email, phone, password_hash, role = 'customer' }) => {
  const { rows } = await query(
    `INSERT INTO users (name, email, phone, password_hash, role)
     VALUES ($1,$2,$3,$4,$5)
     RETURNING id, name, email, phone, role, is_verified, created_at`,
    [name, email, phone, password_hash, role]
  );
  return rows[0];
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

module.exports = {
  findByEmail, findByPhone, findById, create, update, softDelete,
  saveRefreshToken, findRefreshToken, revokeRefreshToken, revokeAllUserTokens,
};
