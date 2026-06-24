const QRCode = require('qrcode');
const crypto = require('crypto');

const generateToken = () => crypto.randomBytes(32).toString('hex');

const generateQRDataURL = async (token) => {
  const verifyURL = `${process.env.API_BASE_URL || 'http://localhost:5001'}/api/v1/bookings/verify/${token}`;
  return QRCode.toDataURL(verifyURL, {
    width: 300,
    margin: 2,
    color: { dark: '#000000', light: '#FFFFFF' },
    errorCorrectionLevel: 'H',
  });
};

module.exports = { generateToken, generateQRDataURL };
