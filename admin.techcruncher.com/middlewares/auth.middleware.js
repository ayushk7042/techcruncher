const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const readToken = (req) => req.headers.authorization?.split(" ")[1] || req.cookies?.token;

/** Resolves the admin for a request's token, or null. Never throws. */
const resolveAdmin = async (req) => {
  const token = readToken(req);
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
    return await Admin.findById(decoded.id);
  } catch {
    return null;
  }
};

exports.resolveAdmin = resolveAdmin;

exports.authMiddleware = async (req, res, next) => {
  if (!readToken(req)) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const admin = await resolveAdmin(req);
  if (!admin) {
    return res.status(401).json({ success: false, message: "Token expired or invalid" });
  }

  req.admin = admin;
  next();
};
