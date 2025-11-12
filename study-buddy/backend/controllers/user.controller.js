const bcrypt = require("bcrypt");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ 
        success: false,
        message: "All fields are required." 
      });
    }
    
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(409).json({ 
        success: false,
        message: "Username or email already in use." 
      });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ 
      username, 
      email, 
      password: hashedPassword 
    });
    await newUser.save();
    
    // Generate JWT token for automatic login after registration
    const payload = { 
      userId: newUser._id, 
      username: newUser.username,
      email: newUser.email 
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });
    
    // Set HTTP-only cookie
    res.cookie('token', token, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production', 
      maxAge: 86400000,
      sameSite: 'lax'
    });
    
    console.log("User registered and auto-logged in:", newUser.email);
    res.status(201).json({ 
      success: true,
      message: "User registered successfully.",
      token: token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email
      }
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error.", 
      error: error.message 
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: "All fields are required." 
      });
    }
    
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid email or password." 
      });
    }
    
    const isPasswordValid = await bcrypt.compare(password, existingUser.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid email or password." 
      });
    }
    
    const payload = { 
      userId: existingUser._id, 
      username: existingUser.username,
      email: existingUser.email 
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });
    
    console.log("User logged in:", existingUser.email);
    
    res.cookie('token', token, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production', 
      maxAge: 86400000,
      sameSite: 'lax'
    });
    
    res.status(200).json({ 
      success: true,
      message: "Login successful.",
      token: token,
      user: {
        id: existingUser._id,
        username: existingUser.username,
        email: existingUser.email
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error.", 
      error: error.message 
    });
  }
};

module.exports = { register, login };