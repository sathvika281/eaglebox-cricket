process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
require('dotenv').config();
const db = require('./db');

async function migrate() {
  try {
    await db.query(`CREATE TABLE IF NOT EXISTS action_history (
      id INT AUTO_INCREMENT PRIMARY KEY,
      booking_id VARCHAR(20),
      action_type VARCHAR(50) NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    console.log('✅ action_history table ready');

    // Insert sample tournament for testing
    await db.query(`INSERT IGNORE INTO tournaments (id, name, start_date, end_date, entry_fee, max_teams, status)
      VALUES (1, 'Eagle Summer Tournament 2026', '2026-07-01', '2026-07-05', 500.00, 8, 'upcoming')`);
    console.log('✅ Sample tournament inserted');

    // Insert more slots for upcoming days
    const slots = [
      ['2026-06-18', '09:00:00', '10:30:00'],
      ['2026-06-18', '10:30:00', '12:00:00'],
      ['2026-06-18', '14:00:00', '15:30:00'],
      ['2026-06-19', '09:00:00', '10:30:00'],
      ['2026-06-19', '10:30:00', '12:00:00'],
      ['2026-06-20', '09:00:00', '10:30:00'],
      ['2026-06-20', '14:00:00', '15:30:00'],
      ['2026-06-21', '09:00:00', '10:30:00'],
      ['2026-06-22', '09:00:00', '10:30:00'],
      ['2026-06-22', '10:30:00', '12:00:00'],
    ];
    for (const [slot_date, start_time, end_time] of slots) {
      await db.query(
        'INSERT IGNORE INTO slots (slot_date, start_time, end_time, price) VALUES (?, ?, ?, 500.00)',
        [slot_date, start_time, end_time]
      );
    }
    console.log('✅ Additional slots inserted for June 18-22');
    console.log('\n🎉 Migration complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌', err.message);
    process.exit(1);
  }
}

migrate();
