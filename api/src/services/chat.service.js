const { GoogleGenerativeAI } = require('@google/generative-ai');

const SYSTEM_PROMPT = `You are the EagleBox Cricket AI Assistant — a friendly, concise support bot for Eagle Box Cricket, a box cricket booking platform in Hyderabad.

PLATFORM OVERVIEW:
- Eagle Box Cricket — Main Arena, Hyderabad
- Customers can book 1-hour box cricket slots online
- Slots are priced at ₹800 per hour
- Payment is done via Razorpay (UPI, Netbanking, Cards)
- After payment, customers receive a QR Booking Pass via email

NAVIGATION PATHS (always mention these when relevant):
- Book a slot → /booking
- View bookings → /my-bookings
- Booking pass / QR → /my-bookings then click the booking
- Payment history → /payment-history
- Profile → /profile
- Dashboard → /dashboard

KEY FEATURES:
- Booking: Choose a date, select a time slot, confirm and pay
- Cancellation: Go to My Bookings → click Cancel on any future booking
- Rescheduling: Go to My Bookings → click Reschedule → pick a new date and slot
- QR Pass: Generated after payment, sent to email, viewable at /my-bookings
- Payments: Razorpay handles payments. Test mode uses netbanking or UPI success@razorpay

RULES:
- Keep answers short (2-4 sentences max)
- Always provide the navigation path when applicable
- Never perform booking/payment/cancellation actions yourself
- Never ask for passwords, card numbers, or OTPs
- If unsure, say "Please contact support at the venue"
- Be friendly and encouraging`;

/* ── Rule-based FAQ fallback (no API key needed) ── */
const FAQ = [
  {
    patterns: ['book', 'slot', 'reserve', 'how do i book'],
    answer: "Go to **Book a Slot** (`/booking`), pick a date, choose an available time slot, and confirm. You'll be taken to Razorpay to complete payment.",
  },
  {
    patterns: ['cancel', 'cancellation'],
    answer: "Open **My Bookings** (`/my-bookings`), find your booking, and click **Cancel**. Cancellation is only allowed for future slots.",
  },
  {
    patterns: ['reschedule', 'change slot', 'change date', 'change booking'],
    answer: "Open **My Bookings** (`/my-bookings`), click **Reschedule** on your booking, pick a new date and time slot, then confirm.",
  },
  {
    patterns: ['payment', 'pay', 'razorpay', 'how to pay'],
    answer: "Payments are processed via **Razorpay**. After confirming your slot, a Razorpay checkout opens — use UPI, Netbanking, or a card to pay.",
  },
  {
    patterns: ['payment fail', 'payment failed', 'payment not completed', 'payment issue'],
    answer: "If payment fails, your booking stays pending. Go back to **Book a Slot** (`/booking`) and try again, or pay at the venue counter on match day.",
  },
  {
    patterns: ['qr', 'booking pass', 'entry pass', 'qr code'],
    answer: "Your QR Booking Pass is generated after successful payment. Find it in **My Bookings** (`/my-bookings`) or check your email — it was sent there automatically.",
  },
  {
    patterns: ['email', 'mail', 'confirmation', 'receipt'],
    answer: "You receive emails for booking confirmation, payment success (with receipt), and your QR booking pass. Check your inbox and spam folder.",
  },
  {
    patterns: ['profile', 'update profile', 'change name', 'change phone'],
    answer: "Go to **Profile** (`/profile`) to update your name and phone number. Email cannot be changed after registration.",
  },
  {
    patterns: ['my bookings', 'view bookings', 'booking history', 'see bookings'],
    answer: "All your bookings are in **My Bookings** (`/my-bookings`). Filter by status — Pending, Confirmed, Rescheduled, Completed, or Cancelled.",
  },
  {
    patterns: ['price', 'cost', 'how much', 'fee', 'rate'],
    answer: "Slots are priced at **₹800 per hour**. Price is shown before you confirm your booking.",
  },
  {
    patterns: ['location', 'venue', 'address', 'where'],
    answer: "Eagle Box Cricket is located at **Main Arena, Hyderabad**. Contact the venue for exact directions.",
  },
  {
    patterns: ['timing', 'time', 'hours', 'open', 'available'],
    answer: "Slots are available from **6 AM to 10 PM** daily. Check the booking page for real-time availability.",
  },
  {
    patterns: ['login', 'sign in', 'register', 'sign up', 'account', 'google'],
    answer: "You can sign in with **email + password** or use **Continue with Google** on the login page (`/login`).",
  },
  {
    patterns: ['logout', 'log out', 'sign out'],
    answer: "Go to **Profile** (`/profile`) and scroll down to find the **Logout** button.",
  },
  {
    patterns: ['refund', 'money back'],
    answer: "Refunds are not currently processed automatically. Please contact the venue directly for refund requests.",
  },
  {
    patterns: ['hello', 'hi', 'hey', 'help', 'start'],
    answer: "Hi! I'm the EagleBox Cricket Assistant. I can help you with **bookings, payments, QR passes, and navigation**. What would you like to know?",
  },
];

const faqFallback = (message) => {
  const lower = message.toLowerCase();
  for (const entry of FAQ) {
    if (entry.patterns.some((p) => lower.includes(p))) {
      return entry.answer;
    }
  }
  return "I'm not sure about that. Try asking about **booking a slot**, **cancelling**, **payments**, or **your QR pass**. For other help, please contact the venue directly.";
};

/* ── Gemini chat ── */
let genAI = null;
const getGenAI = () => {
  if (!genAI && process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
};

const chat = async (message, history = []) => {
  const ai = getGenAI();

  if (ai) {
    try {
      const model = ai.getGenerativeModel({
        model: 'gemini-2.5-flash',
        systemInstruction: SYSTEM_PROMPT,
      });

      const geminiHistory = history.map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      }));

      const chatSession = model.startChat({ history: geminiHistory });
      const result = await chatSession.sendMessage(message);
      return result.response.text();
    } catch (err) {
      console.error('Gemini chat error:', err.message);
      return faqFallback(message);
    }
  }

  return faqFallback(message);
};

module.exports = { chat };
