export const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        msg: "Token tidak valid atau tidak memiliki role",
      });
    }

    const userRole = req.user.role;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        msg: "Akses Ditolak",
      });
    }
    next();
  };
};
