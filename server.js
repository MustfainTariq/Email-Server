// Required imports and configuration
const express = require('express');
const nodemailer = require('nodemailer');
const app = express();
app.use(express.json());
require('dotenv').config();

// Configure Nodemailer transporter with environment variables
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Your email address from environment variables
        pass: process.env.EMAIL_PASS, // Your email password from environment variables
    },
});

// Endpoint to handle sending messages
app.post('/send-message', async (req, res) => {
    const { name, email, message } = req.body;

    // Validate request data
    if (!name || !email || !message) {
        return res.status(400).send("All fields (name, email, and message) are required.");
    }

    // Configure email options
    const mailOptions = {
        from: `"Portfolio Contact Form" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER, // Send to your email address
        subject: `New Message from ${name}`,
        text: `You have a new message from your portfolio contact form:\n\nName: ${name}\nEmail: ${email}\nMessage: ${message}`,
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
        res.send('Message sent successfully!');
    } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).send('Error sending your message. Please try again later.');
    }
});

// Set up server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
