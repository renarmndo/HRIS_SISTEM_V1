import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || typeof authHeader !== "string" || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        msg: "Token tidak ditemukan",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        msg: "Token tidak valid",
      });
    }

    const secret = process.env.JWT_TOKEN;
    if (!secret) {
      console.error("JWT_TOKEN env var is not configured");
      return res.status(500).json({
        msg: "Terjadi kesalahan pada server",
      });
    }

    // SECURITY (Task 1.5): pin algorithm HS256 to prevent algorithm-confusion attack
    const decoded = jwt.verify(token, secret, {
      algorithms: ["HS256"],
      clockTolerance: 5,
    });

    req.user = decoded;

    next();
  } catch (error) {
    console.log(error?.message);
    return res.status(401).json({
      msg: "token kadaluarsa, silahkan login kembali",
    });
  }
};
