import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import UserModel from './model'

const router = express.Router();

// Register User
router.post('/', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const user = await UserModel.findOne({ email });
    if (user) {
      return res.json({ status: false, message: "User already existed" });
    }

    if (!username || !email || !password) {
      return res.json({ status: false, message: "Please fill all the fields" });
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
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.json({ message: "User not registered" });
    }

    const token = jwt.sign({ id: user._id }, process.env.KEY, { expiresIn: "5m" });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'saicharan9071@gmail.com', // Replace with your email
        pass: 'wrch oakj fqmg hcfp' // Replace with your app password
      }
    });

    const resetURL = `https://client-login-and-signup.vercel.app/resetPassword/${encodeURIComponent(token)}`;
    const mailOptions = {
      from: 'saicharan9071@gmail.com',
      to: email,
      subject: 'Reset Password',
      html: `<p>Click <a href="${resetURL}">here</a> to reset your password.</p>`
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.error('Error sending email:', error);
        return res.json({ message: "Error sending mail", error: error });
      } else {
        console.log('Email sent:', info.response);
        return res.json({ status: true, message: "Email sent" });
      }
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error", error: error });
  }
});

// Reset Password
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.KEY);
    const id = decoded.id;

    const hashPassword = await bcrypt.hash(password, 10);
    const newUserdata = await UserModel.findByIdAndUpdate(id, { password: hashPassword }, { new: true });

    return res.json({ status: true, message: "Password updated successfully", user: newUserdata });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error", error: error });
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

export { router as UserRouter };