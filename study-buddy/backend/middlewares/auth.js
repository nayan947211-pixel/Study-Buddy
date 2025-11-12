const jwt = require("jsonwebtoken");
require("dotenv").config();

const auth = (req, res, next) => {
  const token = req.cookies.token;
  console.log("Auth middleware - Token received:", token ? "Yes" : "No");
  console.log("Auth middleware - Cookies:", req.cookies);
  
  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: "Token missing. Please login." 
    });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);  
    console.log("Auth middleware - Decoded token:", decoded);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Auth middleware - Token verification error:", error);
    return res.status(401).json({ 
      success: false,
      message: "Invalid or expired token." 
    });
  } 
}

module.exports = auth;