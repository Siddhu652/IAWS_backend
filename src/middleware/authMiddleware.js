const { verifyToken } = require("../utils/jwt");

const authUser = (req, res, next) => {
  const token = req.cookies?.auth_token;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  const user = verifyToken(token);
  if (!user) return res.status(401).json({ message: "Invalid token" });

  req.user = user;
  next();
};

const requireRole = (roles = []) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access Denied" });
    }
    next();
  };
};

module.exports = {
  authUser,
  requireRole,
};
