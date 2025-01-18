// Import required modules
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Initialize Express app
const app = express();

// Middleware for parsing JSON and enabling CORS
app.use(express.json());
app.use(cors({ origin: '*' })); // Replace '*' with specific domains for production

// Rate limiter middleware to prevent spam
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
});
app.use('/send-message', limiter);

// Nodemailer transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Your email address from .env
    pass: process.env.EMAIL_PASS, // Your email password from .env
  },
});

// Route to handle sending messages
app.post('/send-message', async (req, res) => {
  const { name, email, message } = req.body;

  // Validate input fields
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields (name, email, and message) are required.' });
  }

  // Email options
  const mailOptions = {
    from: `"Portfolio Contact Form" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER, // Your email address
    subject: `New Message from ${name}`,
    text: `You have a new message:\n\nName: ${name}\nEmail: ${email}\nMessage: ${message}`,
    html: `
      <h3>New Message from Portfolio Contact Form</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `,
  };

  try {
    // Send the email
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: 'Message sent successfully!' });
  } catch (error) {
    console.error('Error sending email:', error.message);
    res.status(500).json({
      success: false,
      error: 'An error occurred while sending your message. Please try again later.',
    });
  }
});

// Health check route
app.get('/', (req, res) => {
  res.send('API is running.');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
