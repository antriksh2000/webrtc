const jwt = require("jsonwebtoken");

const User = require("../models/User");

async function requireAuth(req, res, next) {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader?.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Authentication is required.",
    });
  }

  const token = authorizationHeader.slice("Bearer ".length);

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub).select("_id name email");

    if (!user) {
      return res.status(401).json({
        message: "Authentication is required.",
      });
    }

    req.user = user;
    return next();
  } catch (_error) {
    return res.status(401).json({
      message: "Authentication is required.",
    });
  }
}

module.exports = {
  requireAuth,
};
