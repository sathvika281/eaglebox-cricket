const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.DB_HOST,
  port:     parseInt(process.env.DB_PORT, 10),
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl:      process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  max:      10,
  idleTimeoutMillis:    30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('PostgreSQL pool error:', err.message);
});

const query = (text, params) => pool.query(text, params);

const getClient = () => pool.connect();

const testConnection = async () => {
  const client = await pool.connect();
  try {
    await client.query('SELECT NOW()');
    console.log('✅ PostgreSQL connected');
  } finally {
    client.release();
  }
};

module.exports = { query, getClient, testConnection, pool };
