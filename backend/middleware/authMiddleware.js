const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // 🔴 No token case
    if (!authHeader) {
      return res.status(401).json({
        message: "Please log in before placing an order",
        code: "NO_AUTH_HEADER",
      });
    }

    // 🔴 Extract token safely
    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({
        message: "Invalid authorization format",
        code: "BAD_AUTH_FORMAT",
      });
    }

    const token = parts[1];

    // 🔥 VERIFY JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // attach user to request
    req.user = decoded;

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);

    return res.status(401).json({
      message: "Invalid or expired session",
      code: "TOKEN_INVALID",
    });
  }
};

module.exports = authMiddleware;