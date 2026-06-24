const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host:   process.env.EMAIL_HOST,
  port:   parseInt(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_PORT === '465',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const FROM = process.env.EMAIL_FROM || '"Eagle Box Cricket" <noreply@eagleboxcricket.com>';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

/* ─── Shared layout wrapper ─── */
const wrap = (content) => `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:#0D0D0D;border-radius:12px 12px 0 0;padding:28px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <p style="margin:0;font-size:10px;letter-spacing:0.2em;color:#BFFF00;font-family:monospace;">⚡ EAGLE BOX CRICKET</p>
                  <p style="margin:4px 0 0;font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.02em;">Main Arena, Hyderabad</p>
                </td>
                <td align="right">
                  <div style="width:44px;height:44px;background:#BFFF00;border-radius:10px;display:inline-flex;align-items:center;justify-content:center;font-size:22px;line-height:44px;text-align:center;">🏏</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#ffffff;padding:32px;">
            ${content}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#111;border-radius:0 0 12px 12px;padding:20px 32px;">
            <p style="margin:0;font-size:11px;color:#555;text-align:center;font-family:monospace;letter-spacing:0.05em;">
              EAGLE BOX CRICKET &nbsp;·&nbsp; Main Arena, Hyderabad<br>
              <span style="color:#333;">This is an automated email. Please do not reply.</span>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

const field = (label, value) => `
  <tr>
    <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="font-size:11px;color:#999;font-family:monospace;letter-spacing:0.1em;text-transform:uppercase;width:140px;">${label}</td>
          <td style="font-size:14px;font-weight:600;color:#1a1a1a;text-align:right;">${value}</td>
        </tr>
      </table>
    </td>
  </tr>`;

const ctaButton = (text, url, color = '#BFFF00', textColor = '#000000') => `
  <a href="${url}" style="display:block;background:${color};color:${textColor};text-decoration:none;text-align:center;padding:14px 24px;border-radius:8px;font-size:13px;font-weight:700;letter-spacing:0.1em;font-family:monospace;">${text}</a>`;

/* ─── Send helper (fire and forget — never breaks caller) ─── */
const send = async (to, subject, html) => {
  if (!to || !to.includes('@')) return;
  try {
    await transporter.sendMail({ from: FROM, to, subject, html });
    console.log(`📧 Email sent: "${subject}" → ${to}`);
  } catch (err) {
    console.error(`❌ Email failed: "${subject}" → ${to}:`, err.message);
  }
};

/* ═══════════════════════════════════════
   FR-1  Booking Confirmation
══════════════════════════════════════ */
const sendBookingConfirmation = async ({ customerName, customerEmail, bookingRef, slotDate, startTime, endTime, numPlayers, amount }) => {
  const html = wrap(`
    <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.15em;color:#BFFF00;font-family:monospace;text-transform:uppercase;">Booking Created</p>
    <h1 style="margin:0 0 8px;font-size:26px;font-weight:800;color:#0D0D0D;">Slot Reserved!</h1>
    <p style="margin:0 0 24px;font-size:14px;color:#666;line-height:1.6;">
      Hi ${customerName}, your slot has been successfully reserved at Eagle Box Cricket. Complete your payment to confirm the booking.
    </p>

    <div style="background:#f9f9f9;border-radius:10px;padding:20px;margin-bottom:24px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        ${field('Booking Ref', `<span style="color:#0D0D0D;font-family:monospace;">${bookingRef}</span>`)}
        ${field('Date', new Date(slotDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }))}
        ${field('Time', `${formatT(startTime)} – ${formatT(endTime)}`)}
        ${field('Players', numPlayers)}
        ${field('Amount Due', `<span style="color:#0D0D0D;font-weight:800;">₹${amount}</span>`)}
        ${field('Status', '<span style="color:#FF8C00;font-family:monospace;">PENDING PAYMENT</span>')}
      </table>
    </div>

    ${ctaButton('COMPLETE PAYMENT →', `${FRONTEND_URL}/booking`)}

    <p style="margin:20px 0 0;font-size:12px;color:#aaa;text-align:center;">
      Venue: Main Arena, Hyderabad &nbsp;·&nbsp; Box Cricket Ground
    </p>
  `);
  await send(customerEmail, `Booking Created — ${bookingRef}`, html);
};

/* ═══════════════════════════════════════
   FR-2  Payment Success
══════════════════════════════════════ */
const sendPaymentSuccess = async ({ customerName, customerEmail, bookingRef, bookingId, amount, transactionId, paidAt }) => {
  const passUrl = `${FRONTEND_URL}/booking-pass/${bookingId}`;
  const html = wrap(`
    <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.15em;color:#22CC66;font-family:monospace;text-transform:uppercase;">✓ Payment Successful</p>
    <h1 style="margin:0 0 8px;font-size:26px;font-weight:800;color:#0D0D0D;">You're All Set!</h1>
    <p style="margin:0 0 24px;font-size:14px;color:#666;line-height:1.6;">
      Hi ${customerName}, your payment was successful and your booking is confirmed. See you on the turf!
    </p>

    <div style="background:#f0fff4;border:1px solid #b7f5d0;border-radius:10px;padding:20px;margin-bottom:24px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        ${field('Booking Ref', `<span style="color:#0D0D0D;font-family:monospace;">${bookingRef}</span>`)}
        ${field('Amount Paid', `<span style="color:#22CC66;font-weight:800;">₹${amount}</span>`)}
        ${field('Transaction ID', `<span style="font-family:monospace;font-size:12px;">${transactionId}</span>`)}
        ${field('Payment Date', new Date(paidAt).toLocaleString('en-IN'))}
        ${field('Booking Status', '<span style="color:#22CC66;font-family:monospace;">CONFIRMED</span>')}
      </table>
    </div>

    <div style="margin-bottom:12px;">${ctaButton('🎫 VIEW BOOKING PASS', passUrl)}</div>
    ${ctaButton('VIEW MY BOOKINGS', `${FRONTEND_URL}/my-bookings`, '#0D0D0D', '#BFFF00')}

    <p style="margin:20px 0 0;font-size:12px;color:#aaa;text-align:center;">
      Your QR booking pass is available on the link above. Show it at the venue counter.
    </p>
  `);
  await send(customerEmail, `Payment Successful — ${bookingRef}`, html);
};

/* ═══════════════════════════════════════
   FR-3  Payment Failed
══════════════════════════════════════ */
const sendPaymentFailed = async ({ customerName, customerEmail, bookingRef, bookingId, amount }) => {
  const html = wrap(`
    <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.15em;color:#FF4444;font-family:monospace;text-transform:uppercase;">⚠ Payment Incomplete</p>
    <h1 style="margin:0 0 8px;font-size:26px;font-weight:800;color:#0D0D0D;">Payment Not Completed</h1>
    <p style="margin:0 0 24px;font-size:14px;color:#666;line-height:1.6;">
      Hi ${customerName}, your slot is still reserved but we didn't receive payment for booking <strong>${bookingRef}</strong>.
      You can complete payment anytime or pay at the venue counter.
    </p>

    <div style="background:#fff5f5;border:1px solid #ffd0d0;border-radius:10px;padding:20px;margin-bottom:24px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        ${field('Booking Ref', `<span style="color:#0D0D0D;font-family:monospace;">${bookingRef}</span>`)}
        ${field('Amount Due', `<span style="color:#FF4444;font-weight:800;">₹${amount}</span>`)}
        ${field('Status', '<span style="color:#FF8C00;font-family:monospace;">PENDING PAYMENT</span>')}
      </table>
    </div>

    ${ctaButton('RETRY PAYMENT →', `${FRONTEND_URL}/booking`)}

    <p style="margin:20px 0 0;font-size:12px;color:#aaa;text-align:center;">
      Your booking is saved. You can also pay at the venue counter on your match day.
    </p>
  `);
  await send(customerEmail, `Payment Incomplete — ${bookingRef}`, html);
};

/* ═══════════════════════════════════════
   FR-4  Booking Cancellation
══════════════════════════════════════ */
const sendBookingCancellation = async ({ customerName, customerEmail, bookingRef, slotDate, startTime, endTime, amount }) => {
  const html = wrap(`
    <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.15em;color:#FF4444;font-family:monospace;text-transform:uppercase;">Booking Cancelled</p>
    <h1 style="margin:0 0 8px;font-size:26px;font-weight:800;color:#0D0D0D;">Your Booking Was Cancelled</h1>
    <p style="margin:0 0 24px;font-size:14px;color:#666;line-height:1.6;">
      Hi ${customerName}, your booking has been cancelled. The slot has been released and is now available for others.
    </p>

    <div style="background:#f9f9f9;border-radius:10px;padding:20px;margin-bottom:24px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        ${field('Booking Ref', `<span style="color:#0D0D0D;font-family:monospace;">${bookingRef}</span>`)}
        ${field('Date', new Date(slotDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }))}
        ${field('Time', `${formatT(startTime)} – ${formatT(endTime)}`)}
        ${field('Amount', `₹${amount}`)}
        ${field('Status', '<span style="color:#FF4444;font-family:monospace;">CANCELLED</span>')}
        ${field('Refund', '<span style="color:#888;">To be processed (future support)</span>')}
      </table>
    </div>

    ${ctaButton('BOOK A NEW SLOT →', `${FRONTEND_URL}/booking`)}

    <p style="margin:20px 0 0;font-size:12px;color:#aaa;text-align:center;">
      Contact us if this cancellation was unexpected.
    </p>
  `);
  await send(customerEmail, `Booking Cancelled — ${bookingRef}`, html);
};

/* ═══════════════════════════════════════
   FR-5  QR Pass Email
══════════════════════════════════════ */
const sendQRPass = async ({ customerName, customerEmail, bookingRef, bookingId, slotDate, startTime, endTime, qrDataURL }) => {
  const passUrl = `${FRONTEND_URL}/booking-pass/${bookingId}`;
  const html = wrap(`
    <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.15em;color:#BFFF00;font-family:monospace;text-transform:uppercase;">🎫 Your Entry Pass</p>
    <h1 style="margin:0 0 8px;font-size:26px;font-weight:800;color:#0D0D0D;">Booking Pass Ready</h1>
    <p style="margin:0 0 24px;font-size:14px;color:#666;line-height:1.6;">
      Hi ${customerName}, your digital booking pass is ready. Show the QR code below at the venue counter for entry.
    </p>

    <div style="background:#f9f9f9;border-radius:10px;padding:20px;margin-bottom:20px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        ${field('Booking Ref', `<span style="color:#0D0D0D;font-family:monospace;">${bookingRef}</span>`)}
        ${field('Date', new Date(slotDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }))}
        ${field('Time', `${formatT(startTime)} – ${formatT(endTime)}`)}
        ${field('Venue', 'Main Arena, Hyderabad')}
      </table>
    </div>

    ${qrDataURL ? `
    <div style="text-align:center;margin-bottom:24px;">
      <p style="font-size:11px;letter-spacing:0.1em;color:#999;font-family:monospace;margin-bottom:12px;">SCAN AT ENTRY</p>
      <img src="${qrDataURL}" alt="Booking QR" width="200" height="200"
        style="border:4px solid #BFFF00;border-radius:12px;padding:8px;background:#fff;display:inline-block;" />
    </div>` : ''}

    ${ctaButton('🎫 OPEN BOOKING PASS', passUrl)}

    <p style="margin:20px 0 0;font-size:12px;color:#aaa;text-align:center;">
      Save this email or screenshot the QR code to show at the venue.
    </p>
  `);
  await send(customerEmail, `Your Booking Pass — ${bookingRef}`, html);
};

/* ─── Time formatter for emails ─── */
function formatT(t) {
  if (!t) return '';
  const [h, m] = t.split(':');
  const hour = parseInt(h);
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
}

module.exports = {
  sendBookingConfirmation,
  sendPaymentSuccess,
  sendPaymentFailed,
  sendBookingCancellation,
  sendQRPass,
};
