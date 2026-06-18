const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
const slotsRouter      = require('./routes/slots');
const bookingsRouter   = require('./routes/bookings');
const adminRouter      = require('./routes/admin');
const reportsRouter    = require('./routes/reports');
const tournamentsRouter = require('./routes/tournaments');
const faqRouter        = require('./routes/faq');

app.use('/api/slots',       slotsRouter);
app.use('/api/bookings',    bookingsRouter);
app.use('/api/admin',       adminRouter);
app.use('/api/reports',     reportsRouter);
app.use('/api/tournaments', tournamentsRouter);
app.use('/api/faq',         faqRouter);

// Health check
app.get('/', (req, res) => {
  res.json({
    message: 'Eagle Box Cricket API is running!',
    version: '2.0.0',
    endpoints: [
      'GET    /api/slots?date=YYYY-MM-DD',
      'GET    /api/slots/all',
      'POST   /api/slots            (admin - create slot)',
      'POST   /api/slots/bulk       (admin - bulk create)',
      'DELETE /api/slots/:id        (admin - delete slot)',
      'PUT    /api/slots/:id/block  (admin - block slot)',
      'POST   /api/bookings         (create booking)',
      'GET    /api/bookings         (admin - all bookings)',
      'GET    /api/bookings/:phone  (customer - my bookings)',
      'PUT    /api/bookings/:id/status (admin - confirm/cancel)',
      'GET    /api/admin/dashboard',
      'GET    /api/reports/revenue',
      'GET    /api/reports/occupancy',
      'GET    /api/reports/summary',
      'GET    /api/reports/alerts',
      'GET    /api/tournaments',
      'POST   /api/tournaments',
      'POST   /api/tournaments/:id/register',
      'GET    /api/tournaments/:id/teams',
      'GET    /api/faq',
      'POST   /api/faq/ask',
    ]
  });
});

app.listen(PORT, () => {
  console.log(`Eagle Box Cricket server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}`);
});
