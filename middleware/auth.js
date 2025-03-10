const jwt = require('jsonwebtoken');
const { sequelize } = require('../db/config');
require('dotenv').config();

// Middleware to verify JWT for authenticated routes
const auth = (req, res, next) => {
  // Get token from header
  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
  
  // Check if token exists
  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'joonasepank_secret_key');
    
    // Add user to request
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token.' });
  }
};

// Middleware to check if user is admin
const adminAuth = (req, res, next) => {
  auth(req, res, () => {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ success: false, message: 'Access denied. Admin rights required.' });
    }
  });
};

module.exports = { auth, adminAuth };
