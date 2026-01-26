const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  const jwtSecret = process.env.JWT_SECRET || 'dev-fallback-secret';

  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) return res.sendStatus(401); // 401 for invalid/expired token
    req.user = user;
    next();
  });
};

const authorizeRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // allowedRoles can be a string or an array of strings
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    
    // Check if user's role is in the allowed list
    // We handle case-insensitivity just in case
    const userRole = (req.user.role || req.user.role_name || '').trim();
    
    const hasPermission = roles.some(role => 
      role.toLowerCase() === userRole.toLowerCase()
    );

    if (hasPermission) {
      next();
    } else {
      res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
  };
};

module.exports = { authenticateToken, authorizeRole };
