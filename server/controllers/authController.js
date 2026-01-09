const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");

exports.loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  if (
    email !== process.env.ADMIN_EMAIL ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  let admin = await Admin.findOne({ email });

  if (!admin) {
    const hashed = await bcrypt.hash(password, 10);
    admin = await Admin.create({ email, password: hashed });
  }

  res.json({
    token: generateToken(admin),
    admin: { email: admin.email }
  });
};
