const jwt = require('jsonwebtoken');
const config = require('../utils/config');
const User = require('../module/user');

const adminAuth = async (request, response, next) => {
  const token = request.headers.authorization?.split(' ')[1];

  if (!token) {
    return response.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, config.SECRET_KEY);
    const user = await User.findById(decoded.id);

    if (!user) {
      return response.status(404).json({ message: 'User not found' });
    }

    if (!user.isAdmin) {
      return response.status(403).json({ message: 'Unauthorized: Admin access required' });
    }

    request.user = user;
    next();
  } catch (error) {
    console.error('Admin Auth Middleware Error:', error);
    return response.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = adminAuth;
