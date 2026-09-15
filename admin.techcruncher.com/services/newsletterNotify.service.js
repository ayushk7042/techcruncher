const News = require("../models/News");
const Subscriber = require("../models/Subscriber");
const { sendMail, isMailConfigured, siteUrl } = require("./mail.service");
const { escapeHtml } = require("../utils/escapeHtml");
const { makeExcerpt } = require("../utils/newsHelpers");

const BATCH_SIZE = 50;

const buildEmail = (news) => {
  const base = siteUrl();
  const link = `${base}/news/${news.slug}`;
  const excerpt = news.excerpt || makeExcerpt(news.description || "", 240);

  return {
    subject: news.title,
    text: `${news.title}\n\n${excerpt}\n\nRead the story: ${link}\n\nUnsubscribe: ${base}/newsletter`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;color:#0a0a0c">
        <p style="font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#ff3b14">New on TechCruncher</p>
        <h1 style="font-size:24px;line-height:1.15;margin:8px 0 12px">${escapeHtml(news.title)}</h1>
        <p style="font-size:15px;line-height:1.6;color:#52525b">${escapeHtml(excerpt)}</p>
        <p><a href="${escapeHtml(link)}" style="display:inline-block;background:#0a0a0c;color:#fff;padding:10px 18px;text-decoration:none;font-size:12px;letter-spacing:.1em;text-transform:uppercase">Read the story</a></p>
        <p style="font-size:11px;color:#80808a;margin-top:32px">You receive this because you subscribed to the TechCruncher daily brief.
        <a href="${escapeHtml(`${base}/newsletter`)}" style="color:#80808a">Unsubscribe</a></p>
      </div>`,
  };
};

const sendToSubscribers = async (email) => {
  const cursor = Subscriber.find({ status: "subscribed" }).select("email").lean().cursor();
  let batch = [];

  const flush = async () => {
    if (!batch.length) return;
    // BCC keeps the list private; `to` goes to the sender's own address.
    await sendMail({ to: process.env.MAIL_FROM || process.env.MAIL_USER, bcc: batch, ...email });
    batch = [];
  };

  for await (const subscriber of cursor) {
    batch.push(subscriber.email);
    if (batch.length >= BATCH_SIZE) await flush();
  }
  await flush();
};

/**
 * Emails subscribers about articles that just went live. Each article is
 * claimed atomically via `newsletterSentAt`, so it is announced at most once
 * even when several code paths publish it at the same moment.
 */
const notifySubscribers = async (ids) => {
  if (!isMailConfigured() || !siteUrl()) return;

  const now = new Date();
  const candidates = await News.find({
    _id: { $in: ids },
    status: "published",
    deletedAt: null,
    newsletterSentAt: null,
    $or: [{ publishedDate: { $lte: now } }, { publishedDate: null }],
  })
    .select("title slug excerpt description")
    .lean();

  for (const news of candidates) {
    const claim = await News.updateOne({ _id: news._id, newsletterSentAt: null }, { $set: { newsletterSentAt: now } });
    if (!claim.modifiedCount) continue;

    try {
      await sendToSubscribers(buildEmail(news));
    } catch (err) {
      console.error(`Newsletter send failed for ${news.slug}:`, err.message);
    }
  }
};

/** Fire-and-forget wrapper for request handlers. */
const queueNewsletter = (ids) => {
  const list = (Array.isArray(ids) ? ids : [ids]).filter(Boolean);
  if (!list.length) return;
  setImmediate(() => notifySubscribers(list).catch((err) => console.error("Newsletter queue error:", err.message)));
};

module.exports = { notifySubscribers, queueNewsletter };
