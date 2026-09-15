const cron = require("node-cron");
const axios = require("axios");

const News = require("../models/News");
const Category = require("../models/Category");

const { optimizeSEO } = require("../services/seoOptimizer.service");
const { autoInternalLinking } = require("../services/internalLinker.service");
const { generateFullArticle, isAiConfigured } = require("../services/aiArticleGenerator.service");
const { extractTags } = require("../services/tagGenerator.service");
const { resolveTags } = require("../services/newsPayload.service");
const { articleTextToHtml } = require("../utils/articleTextToHtml");
const { escapeRegex } = require("../utils/escapeHtml");
const { uniqueSlug, normalizeImage, makeExcerpt } = require("../utils/newsHelpers");

/* =========================
   HELPERS
========================= */

class AutoNewsConfigError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 400;
  }
}

const isDuplicateNews = async (apiNews) => {
  if (apiNews.url && (await News.exists({ sourceUrl: apiNews.url }))) return true;

  const prefix = String(apiNews.title || "").slice(0, 40);
  if (!prefix) return true;
  return Boolean(await News.exists({ title: { $regex: `^${escapeRegex(prefix)}`, $options: "i" } }));
};

// Special characters like '&' break GNews query syntax.
const normalizeQuery = (q) =>
  String(q || "")
    .trim()
    .replace(/&/g, " and ")
    .replace(/[/:?#[\]@!$'()*+,;=]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const fetchTopNews = async (query) => {
  try {
    const res = await axios.get("https://gnews.io/api/v4/search", {
      params: { q: normalizeQuery(query), lang: "en", country: "in", max: 10, apikey: process.env.GNEWS_API_KEY },
      timeout: 15000,
    });
    return Array.isArray(res.data?.articles) ? res.data.articles : [];
  } catch (error) {
    console.error("GNews request failed:", { query, status: error.response?.status, message: error.message });
    return [];
  }
};

/** Builds one draft article from a GNews item, or returns null when it should be skipped. */
const buildDraft = async (apiNews, category, affiliateLinks) => {
  if (await isDuplicateNews(apiNews)) return null;

  const title = String(apiNews.title).trim();
  const description = apiNews.description || apiNews.content || "";

  const body = await generateFullArticle({ title, description, category: category.name });
  if (!body) return null;

  const { ids: tagIds, names: tagNames } = await resolveTags(extractTags(title, body).slice(0, 6));
  const content = articleTextToHtml(body, title);
  const published = apiNews.publishedAt ? new Date(apiNews.publishedAt) : new Date();

  const news = new News({
    category: category._id,
    title,
    subtitle: apiNews.source?.name || "",
    slug: await uniqueSlug(News, title),
    description: description.slice(0, 300) || title,
    excerpt: makeExcerpt(content),
    content,
    featuredImage: normalizeImage(apiNews.image),
    tags: tagIds,
    tagNames,
    affiliateLinks,
    seoTitle: title,
    seoDescription: description.slice(0, 160),
    seoKeywords: tagNames,
    sourceUrl: apiNews.url,
    sourceName: apiNews.source?.name,
    publishedDate: Number.isNaN(published.getTime()) ? new Date() : published,
    // Always a draft: AI copy is reviewed by an editor before it goes live.
    status: "draft",
    aiGenerated: true,
    createdBy: "ai",
    autoUpdateEnabled: false,
  });

  await autoInternalLinking(news);
  await optimizeSEO(news);
  await news.save();
  return news;
};

/* =========================
   JOB
========================= */

let running = false;

/**
 * Creates AI-written drafts for every active category with auto-update on.
 * Returns the number of drafts created. One failing article never stops the run.
 */
const runAutoNews = async () => {
  if (!process.env.GNEWS_API_KEY || !isAiConfigured()) {
    throw new AutoNewsConfigError("Auto-news needs GNEWS_API_KEY and GEMINI_API_KEY on the server.");
  }
  if (running) throw Object.assign(new Error("Auto-news is already running."), { statusCode: 409 });

  running = true;
  let created = 0;
  console.log("🕒 Auto News Job Started");

  try {
    const categories = await Category.find({ autoUpdateEnabled: true, status: "active" });

    for (const category of categories) {
      const limit = Math.max(0, Number(category.dailyAutoUpdateLimit) || 0);
      if (!limit) continue;

      const [apiNewsList, latestAdminNews] = await Promise.all([
        fetchTopNews(category.name),
        News.findOne({ category: category._id, aiGenerated: false }).sort({ updatedAt: -1 }).select("affiliateLinks").lean(),
      ]);

      let createdHere = 0;
      for (const apiNews of apiNewsList) {
        if (createdHere >= limit) break;
        try {
          const draft = await buildDraft(apiNews, category, latestAdminNews?.affiliateLinks || []);
          if (draft) {
            createdHere += 1;
            console.log("✅ Draft created:", draft.title);
          }
        } catch (err) {
          console.error(`Auto-news article failed (${apiNews?.title}):`, err.message);
        }
      }

      created += createdHere;
      console.log(`🏁 ${category.name}: ${createdHere} draft(s)`);
    }
  } finally {
    running = false;
  }

  console.log(`🏁 Auto News Job Completed (${created} drafts)`);
  return created;
};

/** Registers the cron schedule. Enabled from server.js via ENABLE_AUTO_NEWS. */
const dailyAutoUpdateJob = () => {
  cron.schedule(process.env.CRON_TIME || "0 2 * * *", () => {
    runAutoNews().catch((err) => console.error("❌ Auto News Job Failed:", err.message));
  });
};

module.exports = dailyAutoUpdateJob;
module.exports.runAutoNews = runAutoNews;
