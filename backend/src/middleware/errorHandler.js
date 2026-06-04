// Centralized error handler - jangan bocorkan stack trace ke client.
// Letakkan di akhir middleware chain (app.use(errorHandler)).
//   const { errorHandler, notFoundHandler } = require('./errorHandler');
//   app.use(notFoundHandler);
//   app.use(errorHandler);

const isProd = process.env.NODE_ENV === "production";

export function notFoundHandler(req, res, next) {
  res.status(404).json({
    msg: `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan`,
  });
}

// 4-arg signature WAJIB agar Express mengenalinya sebagai error middleware.
export function errorHandler(err, req, res, next) {
  // Sequelize validation
  if (err?.name === "SequelizeValidationError" || err?.name === "SequelizeUniqueConstraintError") {
    const errors = err.errors?.map((e) => e.message) || [];
    return res.status(400).json({
      msg: "Validasi gagal",
      errors,
    });
  }

  // Sequelize FK
  if (err?.name === "SequelizeForeignKeyConstraintError") {
    return res.status(400).json({
      msg: "Referensi data tidak valid",
    });
  }

  // JWT
  if (err?.name === "JsonWebTokenError" || err?.name === "TokenExpiredError") {
    return res.status(401).json({
      msg: "Token tidak valid atau sudah kadaluarsa",
    });
  }

  // CORS origin error (ditolak manual)
  if (err?.message === "Origin not allowed by CORS") {
    return res.status(403).json({
      msg: "Origin tidak diizinkan",
    });
  }

  // Body too large
  if (err?.type === "entity.too.large") {
    return res.status(413).json({
      msg: "Payload terlalu besar",
    });
  }

  // SyntaxError JSON.parse
  if (err?.type === "entity.parse.failed") {
    return res.status(400).json({
      msg: "Format JSON tidak valid",
    });
  }

  // Custom HttpError with statusCode
  if (err?.statusCode && Number.isInteger(err.statusCode)) {
    return res.status(err.statusCode).json({
      msg: err.message || "Terjadi kesalahan",
    });
  }

  // Fallback
  console.error("[unhandled-error]", err);
  return res.status(500).json({
    msg: "Terjadi kesalahan pada server",
    ...(isProd ? {} : { detail: err?.message }),
  });
}

// Helper untuk melempar HttpError dengan statusCode.
export class HttpError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}
