const ADMIN_EMAIL = "admin@gmail.com";

/**
 * adminMiddleware — must be used AFTER authMiddleware.
 * authMiddleware already verifies the token and sets req.user.
 * This middleware checks that the verified user is the admin.
 */
const adminMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized: no user found" });
  }

  const isAdmin =
    req.user.email === ADMIN_EMAIL ||
    req.user.admin === true ||
    req.user.role === "admin";

  if (!isAdmin) {
    return res.status(403).json({ message: "Forbidden: admin access required" });
  }

  next();
};

module.exports = adminMiddleware;