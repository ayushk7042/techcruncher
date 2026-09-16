const Contact = require("../models/Contact");
const { sendMail, isMailConfigured } = require("../services/mail.service");
const { escapeHtml } = require("../utils/escapeHtml");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const isObjectId = (value) => /^[0-9a-fA-F]{24}$/.test(String(value || ""));

const clean = (value, max) => String(value ?? "").trim().slice(0, max);

/** POST /api/contact (public) — only the four visitor fields are accepted. */
exports.createContact = async (req, res) => {
  try {
    const payload = {
      name: clean(req.body?.name, 120),
      email: clean(req.body?.email, 200).toLowerCase(),
      subject: clean(req.body?.subject, 200),
      message: clean(req.body?.message, 5000),
    };

    if (!payload.name || !payload.message) {
      return res.status(400).json({ message: "Name and message are required" });
    }
    if (!EMAIL_RE.test(payload.email)) {
      return res.status(400).json({ message: "A valid email is required" });
    }

    const contact = await Contact.create(payload);
    res.status(201).json(contact);
  } catch (err) {
    console.error("createContact error:", err);
    res.status(500).json({ message: "Could not send your message" });
  }
};

/**
 * Messages written by the previous panel stored the reply under `adminReply`
 * (with a top-level `repliedAt`) and carried no `status` at all. They are
 * mapped onto the documented shape on the way out, so every client sees one
 * consistent message — and a missing status can no longer break a page.
 */
const normalizeContact = (contact) => {
  const legacyReply = contact.adminReply;
  const reply =
    contact.reply?.message || legacyReply
      ? {
          message: contact.reply?.message || (typeof legacyReply === "string" ? legacyReply : legacyReply?.message) || "",
          repliedAt: contact.reply?.repliedAt || contact.repliedAt || null,
          repliedBy: contact.reply?.repliedBy || legacyReply?.repliedBy || null,
        }
      : undefined;

  return {
    ...contact,
    subject: contact.subject || "",
    reply,
    status: contact.status || (reply?.message ? "replied" : "new"),
  };
};

/** GET /api/contact (admin) */
exports.getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 }).limit(1000).lean();
    res.json(contacts.map(normalizeContact));
  } catch (err) {
    console.error("getAllContacts error:", err);
    res.status(500).json({ message: "Could not load messages" });
  }
};

/**
 * PUT /api/contact/reply/:id (admin)
 * Stores the reply and emails it when mail is configured. The response is the
 * contact document plus `emailed`, so the panel can say what actually happened.
 */
exports.replyContact = async (req, res) => {
  try {
    const message = clean(req.body?.message, 10000);
    if (!message) return res.status(400).json({ message: "Reply message is required" });
    if (!isObjectId(req.params.id)) return res.status(404).json({ message: "Not found" });

    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ message: "Not found" });

    let emailed = false;
    if (isMailConfigured()) {
      try {
        await sendMail({
          to: contact.email,
          subject: `Re: ${contact.subject || "Your message to TechCruncher"}`,
          text: message,
          html: `<div style="font-family:Arial,sans-serif;white-space:pre-wrap">${escapeHtml(message)}</div>`,
        });
        emailed = true;
      } catch (err) {
        console.error("Contact reply email failed:", err.message);
        return res.status(502).json({ message: "The reply could not be emailed. Nothing was saved." });
      }
    }

    contact.reply = { message, repliedAt: new Date(), repliedBy: req.admin?._id };
    contact.status = "replied";
    await contact.save();

    res.json({ ...contact.toObject(), emailed });
  } catch (err) {
    console.error("replyContact error:", err);
    res.status(500).json({ message: "Could not save the reply" });
  }
};

/** DELETE /api/contact/:id (admin) */
exports.deleteContact = async (req, res) => {
  try {
    if (!isObjectId(req.params.id)) return res.status(404).json({ message: "Not found" });
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error("deleteContact error:", err);
    res.status(500).json({ message: "Could not delete the message" });
  }
};
