import express from 'express'
import bcrypt from 'bcrypt'
import UserModel from '../componets/model.js'
import jwt from "jsonwebtoken"
import nodemailer  from 'nodemailer'

const router = express.Router();

router.post('/', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    if (!username || !email || !password) {
      return res.json({ status: false, message: "Please fill all the fields" });
    }

    const user = await UserModel.findOne({ email });
    if (user) {
      return res.json({ status: false, message: "User already existed" });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = new UserModel({
      username,
      email,
      password: hashPassword,
    });

    await newUser.save();
    return res.json({ status: true, message: "Record registered" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: "Internal server error" });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.json({ status: false, message: "Please fill all the fields" });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.json({ message: "User is not registered", status: false });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.json({ message: "Password is incorrect" });
    }

    const token = jwt.sign({ username: user.username }, process.env.KEY, { expiresIn: "5m" });
    res.cookie('token', token, { httpOnly: true, maxAge: 2592000000 });
    return res.json({ status: true, message: "Login successful" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: "Internal server error" });
  }
});

// Forgot Password
const otps = {};

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP

  // Store OTP with expiration
  otps[email] = {
    otp,
    expires: Date.now() + 300000 // OTP valid for 5 minutes
  };

  // Setup nodemailer
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP code is ${otp}`
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ message: 'OTP sent' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending OTP', error: error.toString() });
  }
});

// Verify OTP
router.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required' });
  }

  const storedOtp = otps[email];
  if (!storedOtp) {
    return res.status(400).json({ message: 'OTP not found' });
  }

  if (Date.now() > storedOtp.expires) {
    return res.status(400).json({ message: 'OTP expired' });
  }

  if (storedOtp.otp !== otp) {
    return res.status(400).json({ message: 'Invalid OTP' });
  }

  delete otps[email]; // Clear the OTP after successful verification
  res.json({ message: 'OTP verified' });
});

// Reset Password

router.post('/reset-password', async (req, res) => {
  const { token } = req.body;
  const { newPassword } = req.body;

  try {
    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.KEY);
    const id = decoded.id;

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password in the database
    const updatedUser = await UserModel.findByIdAndUpdate(id, { password: hashedPassword }, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }

    return res.json({ status: true, message: 'Password updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error resetting password:', error);
    return res.status(500).json({ status: false, message: 'Internal server error', error: error.message });
  }
});


// Verify User Middleware
const verifyUser = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.json({ status: false, message: "No token" });
    }
    const decoded = jwt.verify(token, process.env.KEY);
    req.user = decoded;
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error", error: error });
  }
};

router.get('/verify', verifyUser, (req, res) => {
  return res.json({ status: true, message: 'Authorized' });
});

router.get('/logout', (req, res) => {
  res.clearCookie('token');
  return res.json({ status: true });
});

// Get Users
router.get('/', async (req, res) => {
  try {
    const data = await UserModel.find();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

router.get('/login', (req, res) => {
  res.send("login");
});

export {router as UserRouter}