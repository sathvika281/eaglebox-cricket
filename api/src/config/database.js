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
  connectionTimeoutMillis: 15000,
});

pool.on('error', (err) => {
  console.error('PostgreSQL pool error:', err.message);
});

const query = (text, params) => pool.query(text, params);

const getClient = () => pool.connect();

const testConnection = async (retries = 3) => {
  for (let i = 1; i <= retries; i++) {
    try {
      const client = await pool.connect();
      await client.query('SELECT NOW()');
      client.release();
      console.log('✅ PostgreSQL connected');
      return;
    } catch (err) {
      if (i === retries) throw err;
      console.log(`⏳ DB connection attempt ${i} failed, retrying...`);
      await new Promise(r => setTimeout(r, 2000));
    }
  }
};

module.exports = { query, getClient, testConnection, pool };
