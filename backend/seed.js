process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
require('dotenv').config();
const mysql = require('mysql2/promise');

async function seed() {
  let conn;
  try {
    conn = await mysql.createConnection({
      host:     process.env.DB_HOST,
      port:     process.env.DB_PORT,
      user:     process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: { rejectUnauthorized: false },
      connectTimeout: 10000,
    });
    console.log('✅ Connected to database');

    // ── Create tables ───────────────────────────────────────────────────────
    await conn.query(`CREATE TABLE IF NOT EXISTS slots (
      id INT AUTO_INCREMENT PRIMARY KEY,
      slot_date DATE NOT NULL,
      start_time TIME NOT NULL,
      end_time TIME NOT NULL,
      price DECIMAL(10,2) DEFAULT 500.00,
      status ENUM('available','booked','blocked') DEFAULT 'available',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    await conn.query(`CREATE TABLE IF NOT EXISTS bookings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      booking_id VARCHAR(20) NOT NULL UNIQUE,
      customer_name VARCHAR(100) NOT NULL,
      phone VARCHAR(15) NOT NULL,
      email VARCHAR(100),
      slot_id INT NOT NULL,
      num_players INT DEFAULT 1,
      booking_type ENUM('regular','corporate','tournament') DEFAULT 'regular',
      status ENUM('pending','confirmed','cancelled') DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (slot_id) REFERENCES slots(id)
    )`);

    await conn.query(`CREATE TABLE IF NOT EXISTS tournaments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      entry_fee DECIMAL(10,2) DEFAULT 0,
      max_teams INT DEFAULT 8,
      status ENUM('upcoming','ongoing','completed') DEFAULT 'upcoming',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    await conn.query(`CREATE TABLE IF NOT EXISTS tournament_registrations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      tournament_id INT NOT NULL,
      team_name VARCHAR(100) NOT NULL,
      captain_name VARCHAR(100) NOT NULL,
      phone VARCHAR(15) NOT NULL,
      num_players INT DEFAULT 6,
      status ENUM('registered','confirmed','eliminated') DEFAULT 'registered',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tournament_id) REFERENCES tournaments(id)
    )`);

    await conn.query(`CREATE TABLE IF NOT EXISTS action_history (
      id INT AUTO_INCREMENT PRIMARY KEY,
      booking_id VARCHAR(20),
      action_type VARCHAR(50) NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    console.log('✅ All tables created');

    // ── Wipe old slots & bookings for a clean start ─────────────────────────
    await conn.query('SET FOREIGN_KEY_CHECKS = 0');
    await conn.query('TRUNCATE TABLE bookings');
    await conn.query('TRUNCATE TABLE slots');
    await conn.query('TRUNCATE TABLE action_history');
    await conn.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✅ Old test data cleared');

    // ── Insert slots: today + next 7 days, 4 slots per day ──────────────────
    const timeBlocks = [
      ['06:00:00', '07:30:00'],
      ['08:00:00', '09:30:00'],
      ['10:00:00', '11:30:00'],
      ['14:00:00', '15:30:00'],
      ['16:00:00', '17:30:00'],
      ['18:00:00', '19:30:00'],
    ];

    const today = new Date();
    for (let d = 0; d < 8; d++) {
      const date = new Date(today);
      date.setDate(today.getDate() + d);
      const dateStr = date.toISOString().split('T')[0];
      for (const [start, end] of timeBlocks) {
        await conn.query(
          'INSERT INTO slots (slot_date, start_time, end_time, price) VALUES (?, ?, ?, 600.00)',
          [dateStr, start, end]
        );
      }
    }
    console.log('✅ Slots inserted: today + next 7 days, 6 slots/day');

    // ── Insert fake bookings ─────────────────────────────────────────────────
    const [slotRows] = await conn.query('SELECT id FROM slots LIMIT 10');

    const fakeBookings = [
      { id: 'EBC-001',  name: 'Rahul Sharma',    phone: '9876543210', email: 'rahul@gmail.com',   players: 8,  status: 'confirmed', slot_idx: 0 },
      { id: 'EBC-002',  name: 'Priya Patel',     phone: '8765432109', email: 'priya@gmail.com',   players: 6,  status: 'pending',   slot_idx: 1 },
      { id: 'EBC-003',  name: 'Vikram Reddy',    phone: '7654321098', email: '',                   players: 10, status: 'confirmed', slot_idx: 2 },
      { id: 'EBC-004',  name: 'Sneha Nair',      phone: '6543210987', email: 'sneha@gmail.com',   players: 7,  status: 'pending',   slot_idx: 3 },
      { id: 'EBC-005',  name: 'Arjun Mehta',     phone: '9988776655', email: 'arjun@gmail.com',   players: 9,  status: 'cancelled', slot_idx: 4 },
    ];

    for (const b of fakeBookings) {
      if (!slotRows[b.slot_idx]) continue;
      await conn.query(
        `INSERT IGNORE INTO bookings
         (booking_id, customer_name, phone, email, slot_id, num_players, booking_type, status)
         VALUES (?, ?, ?, ?, ?, ?, 'regular', ?)`,
        [b.id, b.name, b.phone, b.email, slotRows[b.slot_idx].id, b.players, b.status]
      );
      // Mark slot as booked for confirmed/pending
      if (b.status !== 'cancelled') {
        await conn.query("UPDATE slots SET status='booked' WHERE id=?", [slotRows[b.slot_idx].id]);
      }
    }
    console.log('✅ 5 fake bookings inserted (confirmed/pending/cancelled)');

    // ── Insert sample tournament ─────────────────────────────────────────────
    await conn.query(`INSERT IGNORE INTO tournaments
      (id, name, start_date, end_date, entry_fee, max_teams, status)
      VALUES (1, 'Eagle Summer Cup 2026', '2026-07-01', '2026-07-05', 500.00, 8, 'upcoming')`);
    console.log('✅ Sample tournament inserted');

    console.log('\n🎉 Seed complete! Start servers now:');
    console.log('   Backend : cd backend && node server.js');
    console.log('   Frontend: cd frontend && npm start');

  } catch (err) {
    console.error('\n❌ Error:', err.message);
    if (err.message.includes('ENOTFOUND') || err.message.includes('ECONNREFUSED')) {
      console.error('\n⚠️  Cannot reach Aiven database.');
      console.error('   Go to console.aiven.io → click your MySQL service → Power On');
      console.error('   Wait 2 minutes, then run this script again: node seed.js');
    }
  } finally {
    if (conn) await conn.end();
    process.exit(0);
  }
}

seed();
