const Contact = require("../models/Contact");
const sendEmail = require("../utils/sendEmail");

/* ================= USER SEND MESSAGE ================= */
exports.sendContact = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: "All fields required" });
    }

    const contact = await Contact.create({ name, email, message });

    /* Email to Admin */
    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: "New Contact Message",
      html: `
        <h3>New Contact Message</h3>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Message:</b><br/>${message}</p>
      `,
    });

    res.status(201).json({ message: "Message sent successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= ADMIN GET ALL ================= */
exports.getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= ADMIN REPLY ================= */
exports.replyContact = async (req, res) => {
  try {
    const { reply } = req.body;
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({ message: "Not found" });
    }

    contact.adminReply = reply;
    contact.repliedAt = new Date();
    await contact.save();

    /* Email reply to user */
    await sendEmail({
      to: contact.email,
      subject: "Reply from TechNews",
      html: `
        <p>Hello ${contact.name},</p>
        <p>${reply}</p>
        <br/>
        <p>— TechNews Team</p>
      `,
    });

    res.json({ message: "Reply sent successfully" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};
