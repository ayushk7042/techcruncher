const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ROLES = ["superadmin", "editor"];

const publicAdmin = (admin) => {
  const { password: _password, ...rest } = admin.toObject();
  return rest;
};

/** POST /api/auth/register — superadmin only (see routes/auth.routes.js). */
exports.registerAdmin = async (req, res) => {
  try {
    const name = String(req.body?.name ?? "").trim();
    const email = String(req.body?.email ?? "").trim().toLowerCase();
    const password = String(req.body?.password ?? "");
    const role = ROLES.includes(req.body?.role) ? req.body.role : "editor";

    if (!EMAIL_RE.test(email)) return res.status(400).json({ message: "A valid email is required" });
    if (password.length < 8) return res.status(400).json({ message: "Password must be at least 8 characters" });

    if (await Admin.exists({ email })) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const admin = await Admin.create({
      name,
      email,
      password: await bcrypt.hash(password, 12),
      role,
      permissions: {
        canPublish: req.body?.permissions?.canPublish !== false,
        canDelete: req.body?.permissions?.canDelete === true,
      },
    });

    res.status(201).json({ message: "Admin created", admin: publicAdmin(admin) });
  } catch (err) {
    console.error("registerAdmin error:", err);
    res.status(500).json({ message: "Could not create admin" });
  }
};

/** POST /api/auth/login */
exports.loginAdmin = async (req, res) => {
  try {
    // Coerce to strings so operator objects ({ "$gt": "" }) can never reach the query.
    const email = String(req.body?.email ?? "").trim().toLowerCase();
    const password = String(req.body?.password ?? "");

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const admin = await Admin.findOne({ email }).select("+password");
    const valid = admin && (await bcrypt.compare(password, admin.password));
    if (!valid) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET, {
      algorithm: "HS256",
      expiresIn: process.env.JWT_EXPIRE || "7d",
    });

    res.json({ token, admin: publicAdmin(admin) });
  } catch (err) {
    console.error("loginAdmin error:", err);
    res.status(500).json({ message: "Sign-in failed" });
  }
};
