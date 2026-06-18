const mysql = require('mysql2');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: 'mysql',
  waitForConnections: true,
  connectionLimit: 1,
  ssl: { rejectUnauthorized: false },
});

const connection = pool.getConnection((err, conn) => {
  if (err) {
    console.error('❌ Connection failed:', err.message);
    process.exit(1);
  }

  console.log('✅ Connected to Aiven MySQL');

  // Read schema.sql
  const schema = fs.readFileSync('./schema.sql', 'utf8');

  // Split by semicolon and filter empty statements
  const statements = schema.split(';').filter(stmt => stmt.trim());

  let executed = 0;

  const executeNext = () => {
    if (executed >= statements.length) {
      console.log('\n✅ All tables created successfully!');
      console.log('\n📝 Now inserting sample slots...\n');
      insertSampleData(conn);
      return;
    }

    const stmt = statements[executed].trim() + ';';
    executed++;

    conn.query(stmt, (err) => {
      if (err) {
        console.error('❌ Error:', err.message);
        conn.release();
        process.exit(1);
      }
      console.log(`✅ Executed statement ${executed}/${statements.length}`);
      executeNext();
    });
  };

  executeNext();
});

function insertSampleData(conn) {
  const sampleSlots = [
    ["2026-06-15", "09:00:00", "10:30:00", 500.00],
    ["2026-06-15", "10:30:00", "12:00:00", 500.00],
    ["2026-06-15", "14:00:00", "15:30:00", 500.00],
    ["2026-06-15", "15:30:00", "17:00:00", 500.00],
    ["2026-06-16", "09:00:00", "10:30:00", 500.00],
    ["2026-06-16", "10:30:00", "12:00:00", 500.00],
    ["2026-06-16", "14:00:00", "15:30:00", 500.00],
    ["2026-06-17", "09:00:00", "10:30:00", 500.00],
  ];

  const insertQuery = 'INSERT INTO eaglecricket.slots (slot_date, start_time, end_time, price) VALUES ?';

  conn.query(insertQuery, [sampleSlots], (err) => {
    if (err) {
      console.error('❌ Error inserting slots:', err.message);
      conn.release();
      process.exit(1);
    }
    console.log('✅ 8 sample slots inserted for testing');
    console.log('\n🎉 Database is ready! You can now:\n');
    console.log('1. Open http://localhost:3000 in your browser');
    console.log('2. Click "Book Now"');
    console.log('3. Pick a date (2026-06-15 or later)');
    console.log('4. Book a slot and get a Booking ID\n');
    conn.release();
    process.exit(0);
  });
}
