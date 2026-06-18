const express = require('express');
const router = express.Router();
const { getFAQAnswer } = require('../services/bookingService');

// GET /api/faq - returns all FAQ Q&A pairs
router.get('/', (req, res) => {
  const faqs = [
    { question: 'What is the price per slot?', answer: getFAQAnswer('price') },
    { question: 'What are the available slot timings?', answer: getFAQAnswer('time') },
    { question: 'How many players can book a slot?', answer: getFAQAnswer('players') },
    { question: 'How do I cancel a booking?', answer: getFAQAnswer('cancel') },
    { question: 'How do I get booking confirmation?', answer: getFAQAnswer('confirm') },
    { question: 'What is a Booking ID?', answer: getFAQAnswer('booking id') },
    { question: 'Are tournaments available?', answer: getFAQAnswer('tournament') },
    { question: 'What membership plans are available?', answer: getFAQAnswer('membership') },
  ];
  res.json({ success: true, faqs });
});

// POST /api/faq/ask - ask a specific question
router.post('/ask', (req, res) => {
  const { question } = req.body;
  if (!question) return res.status(400).json({ error: 'question is required' });
  const answer = getFAQAnswer(question);
  res.json({ success: true, question, answer });
});

module.exports = router;
