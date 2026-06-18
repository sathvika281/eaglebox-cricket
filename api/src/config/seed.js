require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const bcrypt = require('bcryptjs');
const { pool } = require('./database');

const SLOTS = [
  { start: '06:00', end: '07:30' },
  { start: '08:00', end: '09:30' },
  { start: '10:00', end: '11:30' },
  { start: '14:00', end: '15:30' },
  { start: '16:00', end: '17:30' },
  { start: '18:00', end: '19:30' },
];

function addDays(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}

async function seed() {
  const client = await pool.connect();
  try {
    const adminHash = await bcrypt.hash('Admin@2026', 12);
    const { rows: [admin] } = await client.query(`
      INSERT INTO users (name, email, phone, password_hash, role, is_verified)
      VALUES ($1, $2, $3, $4, 'admin', TRUE)
      ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
      RETURNING id
    `, ['EBC Admin', 'admin@eaglebox.com', '9000000000', adminHash]);

    const custHash = await bcrypt.hash('Customer@2026', 12);
    await client.query(`
      INSERT INTO users (name, email, phone, password_hash, role, is_verified)
      VALUES ($1, $2, $3, $4, 'customer', TRUE)
      ON CONFLICT (email) DO NOTHING
    `, ['Sathvika Tummala', 'sathvika@example.com', '9849094213', custHash]);

    let slotCount = 0;
    for (let d = 0; d <= 7; d++) {
      const date = addDays(d);
      for (const t of SLOTS) {
        try {
          await client.query(`
            INSERT INTO slots (slot_date, start_time, end_time, price, created_by)
            VALUES ($1, $2, $3, 600, $4)
            ON CONFLICT (slot_date, start_time) DO NOTHING
          `, [date, t.start, t.end, admin.id]);
          slotCount++;
        } catch (_) {}
      }
    }

    console.log('\n✅ Seed complete\n');
    console.log('   ┌─────────────────────────────────────────┐');
    console.log('   │  Admin     │ admin@eaglebox.com          │');
    console.log('   │  Password  │ Admin@2026                  │');
    console.log('   │  Role      │ admin                       │');
    console.log('   ├─────────────────────────────────────────┤');
    console.log('   │  Customer  │ sathvika@example.com        │');
    console.log('   │  Password  │ Customer@2026               │');
    console.log('   │  Role      │ customer                    │');
    console.log('   ├─────────────────────────────────────────┤');
    console.log(`   │  Slots     │ ${slotCount} slots (today + 7 days)    │`);
    console.log('   └─────────────────────────────────────────┘\n');
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
