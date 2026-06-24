require('dotenv').config();
const fs   = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.DB_HOST,
  port:     parseInt(process.env.DB_PORT),
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl:      { rejectUnauthorized: false },
});

const migrationsDir = path.join(__dirname, 'src/migrations');

async function run() {
  const files = process.argv.slice(2);
  const toRun = files.length
    ? files.map(f => path.join(migrationsDir, f))
    : fs.readdirSync(migrationsDir).sort().map(f => path.join(migrationsDir, f));

  const client = await pool.connect();
  try {
    for (const filePath of toRun) {
      const name = path.basename(filePath);
      const sql  = fs.readFileSync(filePath, 'utf8');
      console.log(`Running: ${name}`);
      await client.query(sql);
      console.log(`✅ Done: ${name}`);
    }
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
