require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const fs   = require('fs');
const path = require('path');
const { pool } = require('./database');

async function migrate() {
  const sql = fs.readFileSync(
    path.join(__dirname, '../../migrations/001_initial_schema.sql'),
    'utf8'
  );
  const client = await pool.connect();
  try {
    await client.query(sql);
    console.log('✅ Migration complete');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
