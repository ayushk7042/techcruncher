const mongoose = require("mongoose");
const News = require("../models/News");
const Category = require("../models/Category");
const { buildNewsPayload, refreshTagCounts, resolveTags } = require("../services/newsPayload.service");
const { revalidateSite, articlePaths } = require("../services/revalidate.service");
const { queueNewsletter } = require("../services/newsletterNotify.service");
const { uniqueSlug, makeSlug } = require("../utils/newsHelpers");
const { escapeRegex } = require("../utils/escapeHtml");

/* =========================================================
   CONSTANTS & HELPERS
========================================================= */

const PUBLIC_POPULATE = "category subCategory tags";
const LEGACY_DEFAULT_LIMIT = 200; // bare GET /api/news stays array-shaped, but bounded
const STATUSES = ["draft", "published", "archived", "scheduled", "trash"];
const CARD_SELECT = "title slug featuredImage image category publishedDate createdAt readTime excerpt description";

const isObjectId = (v) => /^[0-9a-fA-F]{24}$/.test(String(v || ""));

const serverError = (res, err, label) => {
  console.error(`${label} error:`, err);
  res.status(500).json({ success: false, message: "Something went wrong on our side." });
};

/** Live = published and not dated in the future. Legacy documents have no publishedDate. */
const liveClause = () => ({ $or: [{ publishedDate: { $lte: new Date() } }, { publishedDate: null }] });

/** A visitor may only see live content; an authenticated admin sees everything not trashed. */
const visibilityFilter = (req) =>
  req.admin ? { deletedAt: null } : { deletedAt: null, status: "published", ...liveClause() };

/** Adds conditions with $and so no clause ever overwrites another's $or. */
const withAnd = (filter, clauses) => {
  const and = clauses.filter(Boolean);
  if (!and.length) return filter;
  return { ...filter, $and: [...(filter.$and || []), ...and] };
};

/** Tag ids referenced by a set of articles (for counter refreshes). */
const tagIdsOf = async (ids) => News.distinct("tags", { _id: { $in: ids } });

/* =========================================================
   QUERY BUILDER
========================================================= */

/**
 * Translates the query string into a Mongo filter.
 * Supported: search, category, subCategory, tag, status, author, language,
 * country, region, destination, featured, trending, popular, breaking,
 * editorsPick, dateFrom, dateTo, exclude.
 */
const buildFilter = async (req) => {
  const q = req.query;
  const clauses = [];
  let filter;

  if (req.admin) {
    filter = { deletedAt: null };
    if (q.status && q.status !== "all" && STATUSES.includes(q.status)) {
      filter.status = q.status;
      // Trashing sets deletedAt, so the trash view has to look past the soft-delete guard.
      if (q.status === "trash") delete filter.deletedAt;
    }
  } else {
    filter = { deletedAt: null, status: "published" };
    clauses.push(liveClause());
  }

  if (q.category && q.category !== "all") {
    const found = await Category.findOne(isObjectId(q.category) ? { _id: q.category } : { slug: makeSlug(q.category) })
      .select("_id")
      .lean();
    // An unmatched category must return nothing rather than everything.
    filter.category = found ? found._id : new mongoose.Types.ObjectId();
  }

  if (q.subCategory && q.subCategory !== "all") {
    const found = await Category.findOne(
      isObjectId(q.subCategory) ? { _id: q.subCategory } : { slug: makeSlug(q.subCategory) }
    )
      .select("_id")
      .lean();
    filter.subCategory = found ? found._id : new mongoose.Types.ObjectId();
  }

  if (q.tag && q.tag !== "all") {
    if (isObjectId(q.tag)) filter.tags = q.tag;
    else filter.tagNames = new RegExp(`^${escapeRegex(q.tag)}$`, "i");
  }

  const flagMap = {
    featured: "featured",
    trending: "trending",
    popular: "popular",
    breaking: "breakingNews",
    breakingNews: "breakingNews",
    editorsPick: "editorsPick",
    isMainTrending: "isMainTrending",
    isSubTrending: "isSubTrending",
  };

  Object.entries(flagMap).forEach(([param, field]) => {
    if (q[param] !== undefined && q[param] !== "" && q[param] !== "all") {
      filter[field] = q[param] === "true" || q[param] === true;
    }
  });

  ["language", "country", "region", "destination"].forEach((key) => {
    if (q[key] && q[key] !== "all") filter[key] = String(q[key]);
  });

  // Exact author name, case-insensitive.
  if (q.author) filter["author.name"] = new RegExp(`^${escapeRegex(String(q.author).trim())}$`, "i");

  if (q.dateFrom || q.dateTo) {
    const range = {};
    if (q.dateFrom) range.$gte = new Date(q.dateFrom);
    if (q.dateTo) {
      const to = new Date(q.dateTo);
      to.setHours(23, 59, 59, 999);
      range.$lte = to;
    }
    // Legacy articles only carry createdAt.
    clauses.push({ $or: [{ publishedDate: range }, { publishedDate: null, createdAt: range }] });
  }

  if (q.search) {
    const rx = new RegExp(escapeRegex(q.search), "i");
    clauses.push({
      $or: [
        { title: rx },
        { subtitle: rx },
        { slug: rx },
        { description: rx },
        { contentText: rx },
        { tagNames: rx },
        { "author.name": rx },
        { sourceName: rx },
        { destination: rx },
      ],
    });
  }

  if (q.exclude && isObjectId(q.exclude)) filter._id = { $ne: q.exclude };

  return withAnd(filter, clauses);
};

const SORTS = {
  latest: { publishedDate: -1, createdAt: -1 },
  oldest: { publishedDate: 1, createdAt: 1 },
  popular: { views: -1 },
  trending: { views: -1, publishedDate: -1 },
  priority: { priority: -1, publishedDate: -1 },
  title: { title: 1 },
  updated: { updatedAt: -1 },
};

const buildSort = (sortParam) => SORTS[sortParam] || SORTS.latest;

/* =========================================================
   READ — LEGACY SHAPE (unchanged contract)
========================================================= */

/**
 * GET /api/news — bare array. Visitors only ever get live articles, at most 200.
 * Admins may pass ?all=true or a larger ?limit=.
 */
exports.getNews = async (req, res) => {
  try {
    const requested = parseInt(req.query.limit, 10) || LEGACY_DEFAULT_LIMIT;
    const limit = req.admin
      ? req.query.all === "true"
        ? 0
        : Math.min(2000, requested)
      : Math.min(LEGACY_DEFAULT_LIMIT, requested);

    let query = News.find(visibilityFilter(req)).populate(PUBLIC_POPULATE).sort({ createdAt: -1 }).select("-contentText");
    if (limit) query = query.limit(limit);

    res.json(await query.lean());
  } catch (err) {
    serverError(res, err, "getNews");
  }
};

/* =========================================================
   READ — PAGINATED
========================================================= */

/** GET /api/news/list  -> { success, data, pagination } */
exports.listNews = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, parseInt(req.query.limit, 10) || 12);

    const filter = await buildFilter(req);

    const [items, total] = await Promise.all([
      News.find(filter)
        .populate(PUBLIC_POPULATE)
        .sort(buildSort(req.query.sort))
        .skip((page - 1) * limit)
        .limit(limit)
        .select("-contentText -content")
        .lean(),
      News.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 1,
        hasMore: page * limit < total,
      },
    });
  } catch (err) {
    serverError(res, err, "listNews");
  }
};

/** GET /api/news/search?q= — lightweight typeahead */
exports.searchNews = async (req, res) => {
  try {
    const q = String(req.query.q || req.query.search || "").trim();
    if (!q) return res.json({ success: true, data: [] });

    const limit = Math.min(30, parseInt(req.query.limit, 10) || 10);
    const rx = new RegExp(escapeRegex(q), "i");

    const filter = withAnd(visibilityFilter(req), [
      { $or: [{ title: rx }, { tagNames: rx }, { destination: rx }, { description: rx }] },
    ]);

    const items = await News.find(filter)
      .populate("category")
      .sort({ publishedDate: -1, createdAt: -1 })
      .limit(limit)
      .select("title slug featuredImage image category publishedDate createdAt readTime destination")
      .lean();

    res.json({ success: true, data: items });
  } catch (err) {
    serverError(res, err, "searchNews");
  }
};

/** GET /api/news/homefeed — every homepage rail in one round trip */
exports.getHomeFeed = async (req, res) => {
  try {
    const base = visibilityFilter(req);
    // createdAt is listed explicitly: legacy articles carry no publishedDate.
    const lite =
      "title slug subtitle description excerpt featuredImage image isSponsored category tags author publishedDate createdAt updatedAt readTime views likes shareCount destination region breakingNews featured trending editorsPick priority";

    const pick = (extra, limit, sort = { publishedDate: -1, createdAt: -1 }) =>
      News.find({ ...base, ...extra })
        .populate("category tags")
        .sort(sort)
        .limit(limit)
        .select(lite)
        .lean();

    const [hero, breaking, featured, editorsPick, trending, popular, latest] = await Promise.all([
      pick({ isMainTrending: true }, 1, { priority: -1, publishedDate: -1 }),
      pick({ breakingNews: true }, 10),
      pick({ featured: true }, 8, { priority: -1, publishedDate: -1 }),
      pick({ editorsPick: true }, 8),
      pick({ trending: true }, 8, { views: -1, publishedDate: -1 }),
      pick({}, 12, { views: -1 }),
      // Sized well above every rail combined so backfilling never runs dry.
      pick({}, 70),
    ]);

    /**
     * Rails driven by editorial flags are empty on a fresh install, so unused
     * recent articles are promoted — each at most once. Consumers must check
     * the flags themselves before labelling a story "breaking" or "featured".
     */
    const used = new Set();
    const mark = (list) => {
      (list || []).forEach((item) => used.add(String(item._id)));
      return list || [];
    };

    const backfill = (list, size, { reuse = false } = {}) => {
      const out = mark(list).slice(0, size);
      for (const candidate of latest) {
        if (out.length >= size) break;
        const id = String(candidate._id);
        if (used.has(id)) continue;
        used.add(id);
        out.push(candidate);
      }
      // A small archive is used up by the editorial rails, which would leave
      // the chronological rails empty. Those may repeat stories instead.
      if (reuse) {
        const inOut = new Set(out.map((item) => String(item._id)));
        for (const candidate of latest) {
          if (out.length >= size) break;
          const id = String(candidate._id);
          if (inOut.has(id) || id === heroId) continue;
          inOut.add(id);
          out.push(candidate);
        }
        out.sort((a, b) => new Date(b.publishedDate || b.createdAt) - new Date(a.publishedDate || a.createdAt));
      }
      return out;
    };

    const heroDoc = hero[0] || featured[0] || latest[0] || null;
    const heroId = heroDoc ? String(heroDoc._id) : "";
    if (heroDoc) used.add(heroId);

    res.json({
      success: true,
      data: {
        hero: heroDoc,
        breaking: backfill(breaking, 4),
        featured: backfill(featured, 6),
        editorsPick: backfill(editorsPick, 11),
        trending: backfill(trending, 5),
        // Popular is a pure view ranking — repeats here are meaningful.
        popular,
        latest: backfill([], 16, { reuse: true }),
        dontMiss: backfill([], 8),
      },
    });
  } catch (err) {
    serverError(res, err, "getHomeFeed");
  }
};

/** GET /api/news/related/:slug */
exports.getRelatedNews = async (req, res) => {
  try {
    const limit = Math.min(12, parseInt(req.query.limit, 10) || 6);

    const current = await News.findOne({ slug: req.params.slug }).select("_id category tags").lean();
    if (!current) return res.json({ success: true, data: [] });

    const base = { ...visibilityFilter(req), _id: { $ne: current._id } };
    const find = (extra, count) =>
      News.find({ ...base, ...extra })
        .populate("category")
        .sort({ publishedDate: -1, createdAt: -1 })
        .limit(count)
        .select(CARD_SELECT)
        .lean();

    // Same tags first, then same category, then recent stories as filler.
    const data = current.tags?.length ? await find({ tags: { $in: current.tags } }, limit) : [];

    if (data.length < limit) {
      const used = [current._id, ...data.map((n) => n._id)];
      data.push(...(await find({ category: current.category, _id: { $nin: used } }, limit - data.length)));
    }

    if (data.length < limit) {
      const used = [current._id, ...data.map((n) => n._id)];
      data.push(...(await find({ _id: { $nin: used } }, limit - data.length)));
    }

    res.json({ success: true, data });
  } catch (err) {
    serverError(res, err, "getRelatedNews");
  }
};

/** GET /api/news/id/:id — admin edit-by-id. Lean, so absent fields stay absent. */
exports.getNewsById = async (req, res) => {
  try {
    if (!isObjectId(req.params.id)) return res.status(404).json({ message: "Not found" });

    const news = await News.findById(req.params.id)
      .populate("category subCategory tags internalLinks.news relatedNews")
      .lean();

    if (!news) return res.status(404).json({ message: "Not found" });
    res.json(news);
  } catch (err) {
    serverError(res, err, "getNewsById");
  }
};

/** GET /api/news/:slug — responds with the document itself (legacy shape). */
exports.getNewsBySlug = async (req, res) => {
  try {
    // Visitors must never receive unpublished articles through links.
    const liveOnly = req.admin ? undefined : { status: "published", deletedAt: null };

    const news = await News.findOne({ slug: req.params.slug, deletedAt: null })
      .populate([
        { path: "category" },
        { path: "subCategory" },
        { path: "tags" },
        { path: "relatedNews", match: liveOnly, select: CARD_SELECT, populate: { path: "category" } },
        { path: "internalLinks.news", match: liveOnly, select: CARD_SELECT },
      ])
      .lean();

    if (!news) return res.status(404).json({ message: "Not found" });

    const isLive =
      news.status === "published" && (!news.publishedDate || new Date(news.publishedDate) <= new Date());

    if (!isLive && !req.admin) return res.status(404).json({ message: "Not found" });

    // Atomic counter — no full-document write on every pageview.
    News.updateOne({ _id: news._id }, { $inc: { views: 1 } }).catch(() => {});

    res.json({ ...news, views: (news.views || 0) + 1 });
  } catch (err) {
    serverError(res, err, "getNewsBySlug");
  }
};

/* =========================================================
   CREATE
========================================================= */

/** POST /api/news */
exports.createNews = async (req, res) => {
  try {
    const { patch, warnings } = await buildNewsPayload(req.body, { isCreate: true });

    if (!patch.title) return res.status(400).json({ message: "Title is required" });
    if (!patch.category) return res.status(400).json({ message: "Category is required" });
    if (patch.status === "scheduled" && !(patch.scheduledAt > new Date())) {
      return res.status(400).json({ message: "A scheduled article needs a future publish time" });
    }
    if (!patch.description) {
      // The schema requires it; derive one rather than rejecting a valid article.
      patch.description = (patch.excerpt || patch.title).slice(0, 300);
    }

    patch.slug = await uniqueSlug(News, req.body.slug || patch.title);
    patch.createdBy = req.body.createdBy === "ai" ? "ai" : "admin";

    const news = await News.create(patch);

    if (patch.tags?.length) refreshTagCounts(patch.tags).catch(() => {});
    if (news.status === "published") queueNewsletter(news._id);
    revalidateSite({ tags: ["homepage", "news"], paths: articlePaths(news) });

    res.status(201).json(warnings.length ? { ...news.toObject(), warnings } : news);
  } catch (err) {
    console.error("createNews error:", err);
    res.status(400).json({ message: err.message });
  }
};

/** POST /api/news/:id/duplicate */
exports.duplicateNews = async (req, res) => {
  try {
    if (!isObjectId(req.params.id)) return res.status(404).json({ message: "Not found" });

    const source = await News.findById(req.params.id).lean();
    if (!source) return res.status(404).json({ message: "Not found" });

    const {
      _id, createdAt, updatedAt, __v, views, likes, shareCount, bookmarks, slug, newsletterSentAt, deletedAt,
      importBatchId, importRowRef, ...rest
    } = source;

    const title = `${source.title} (Copy)`;

    const copy = await News.create({
      ...rest,
      title,
      slug: await uniqueSlug(News, title),
      status: "draft",
      isMainTrending: false,
      isSubTrending: false,
      publishedDate: new Date(),
      scheduledAt: null,
    });

    if (copy.tags?.length) refreshTagCounts(copy.tags).catch(() => {});

    res.status(201).json({ success: true, data: copy });
  } catch (err) {
    serverError(res, err, "duplicateNews");
  }
};

/* =========================================================
   UPDATE
========================================================= */

/** Soft-delete bookkeeping that must follow every status change. */
const statusSideEffects = (status) => {
  if (status === "trash") return { deletedAt: new Date() };
  if (status === "published") return { deletedAt: null, scheduledAt: null };
  return { deletedAt: null };
};

const applyUpdate = async (query, body, res) => {
  const existing = await News.findOne(query);
  if (!existing) return res.status(404).json({ message: "News not found" });

  const previousStatus = existing.status;
  const previousTags = (existing.tags || []).map(String);

  const { patch, warnings } = await buildNewsPayload(body, { isCreate: false });

  // Slug: only regenerate when the admin explicitly changed it or the title,
  // and never silently collide with another article.
  if (body.slug !== undefined && body.slug !== existing.slug) {
    patch.slug = await uniqueSlug(News, body.slug, existing._id);
  } else if (patch.title && patch.title !== existing.title && body.slug === undefined) {
    patch.slug = await uniqueSlug(News, patch.title, existing._id);
  }

  // Manual edits stop the AI cron from overwriting the article (legacy rule),
  // unless the caller explicitly re-enables it.
  if (body.autoUpdateEnabled === undefined) patch.autoUpdateEnabled = false;

  if (patch.status && patch.status !== previousStatus) {
    Object.assign(patch, statusSideEffects(patch.status), patch.status === "scheduled" ? { scheduledAt: patch.scheduledAt } : {});
  }

  const nextStatus = patch.status || previousStatus;
  const nextScheduledAt = patch.scheduledAt !== undefined ? patch.scheduledAt : existing.scheduledAt;
  if (nextStatus === "scheduled" && !(nextScheduledAt && new Date(nextScheduledAt) > new Date())) {
    return res.status(400).json({ message: "A scheduled article needs a future publish time" });
  }

  Object.assign(existing, patch);
  await existing.save();

  // The edited story, the homepage that lists it and the latest feed.
  revalidateSite({ tags: ["homepage", "news"], paths: articlePaths(existing) });

  const touched = [...new Set([...previousTags, ...(existing.tags || []).map(String)])];
  if (touched.length) refreshTagCounts(touched).catch(() => {});
  if (previousStatus !== "published" && existing.status === "published") queueNewsletter(existing._id);

  const populated = await existing.populate("category subCategory tags");
  return res.json(warnings.length ? { ...populated.toObject(), warnings } : populated);
};

/** PUT /api/news/:slug — legacy update path, response shape unchanged */
exports.updateNews = (req, res) =>
  applyUpdate({ slug: req.params.slug }, req.body, res).catch((err) => serverError(res, err, "updateNews"));

/** PUT /api/news/id/:id */
exports.updateNewsById = (req, res) => {
  if (!isObjectId(req.params.id)) return res.status(404).json({ message: "News not found" });
  return applyUpdate({ _id: req.params.id }, req.body, res).catch((err) => serverError(res, err, "updateNewsById"));
};

/** PATCH /api/news/:id/status  { status } */
exports.changeStatus = async (req, res) => {
  try {
    const { status } = req.body || {};
    if (!STATUSES.includes(status)) return res.status(400).json({ success: false, message: "Invalid status" });
    if (!isObjectId(req.params.id)) return res.status(404).json({ success: false, message: "Not found" });

    const existing = await News.findById(req.params.id).select("status scheduledAt tags").lean();
    if (!existing) return res.status(404).json({ success: false, message: "Not found" });

    if (status === "scheduled" && !(existing.scheduledAt && new Date(existing.scheduledAt) > new Date())) {
      return res.status(400).json({ success: false, message: "Set a future publish time before scheduling" });
    }

    const patch = { status, ...statusSideEffects(status) };
    if (status === "scheduled") delete patch.scheduledAt;

    const news = await News.findByIdAndUpdate(req.params.id, patch, { returnDocument: "after" });

    if (existing.tags?.length) refreshTagCounts(existing.tags).catch(() => {});
    if (existing.status !== "published" && status === "published") queueNewsletter(news._id);
    revalidateSite({ tags: ["homepage", "news"], paths: articlePaths(news) });

    res.json({ success: true, data: news });
  } catch (err) {
    serverError(res, err, "changeStatus");
  }
};

/** POST /api/news/:id/restore — undo archive / soft delete */
exports.restoreNews = async (req, res) => {
  try {
    if (!isObjectId(req.params.id)) return res.status(404).json({ success: false, message: "Not found" });

    const status = STATUSES.includes(req.body?.status) && req.body.status !== "trash" && req.body.status !== "scheduled"
      ? req.body.status
      : "draft";

    const before = await News.findById(req.params.id).select("status").lean();
    const news = await News.findByIdAndUpdate(req.params.id, { deletedAt: null, status }, { returnDocument: "after" });
    if (!news) return res.status(404).json({ success: false, message: "Not found" });

    if (news.tags?.length) refreshTagCounts(news.tags).catch(() => {});
    if (before?.status !== "published" && status === "published") queueNewsletter(news._id);
    revalidateSite({ tags: ["homepage", "news"], paths: articlePaths(news) });

    res.json({ success: true, data: news });
  } catch (err) {
    serverError(res, err, "restoreNews");
  }
};

/* =========================================================
   ENGAGEMENT
========================================================= */

/** POST /api/news/:slug/like  { unlike? } */
exports.likeNews = async (req, res) => {
  try {
    const unlike = Boolean(req.body?.unlike);
    // An unlike never takes the counter below zero.
    const news = await News.findOneAndUpdate(
      unlike ? { slug: req.params.slug, likes: { $gt: 0 } } : { slug: req.params.slug },
      { $inc: { likes: unlike ? -1 : 1 } },
      { returnDocument: "after", projection: "likes" }
    );

    if (news) return res.json({ success: true, likes: news.likes });

    const current = await News.findOne({ slug: req.params.slug }).select("likes").lean();
    if (!current) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, likes: current.likes || 0 });
  } catch (err) {
    serverError(res, err, "likeNews");
  }
};

/** POST /api/news/:slug/share */
exports.shareNews = async (req, res) => {
  try {
    const news = await News.findOneAndUpdate(
      { slug: req.params.slug },
      { $inc: { shareCount: 1 } },
      { returnDocument: "after", projection: "shareCount" }
    );

    if (!news) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, shareCount: news.shareCount });
  } catch (err) {
    serverError(res, err, "shareNews");
  }
};

/* =========================================================
   DELETE
========================================================= */

/** DELETE /api/news/:id — hard delete, legacy response preserved */
exports.deleteNews = async (req, res) => {
  try {
    if (!isObjectId(req.params.id)) return res.status(404).json({ message: "Not found" });

    const news = await News.findByIdAndDelete(req.params.id);
    if (news?.tags?.length) refreshTagCounts(news.tags).catch(() => {});
    revalidateSite({ tags: ["homepage", "news"], paths: articlePaths(news) });

    res.json({ message: "News deleted" });
  } catch (err) {
    serverError(res, err, "deleteNews");
  }
};

/** POST /api/news/:id/trash — reversible delete */
exports.trashNews = async (req, res) => {
  try {
    if (!isObjectId(req.params.id)) return res.status(404).json({ success: false, message: "Not found" });

    const news = await News.findByIdAndUpdate(req.params.id, { deletedAt: new Date(), status: "trash" }, { returnDocument: "after" });
    if (!news) return res.status(404).json({ success: false, message: "Not found" });

    if (news.tags?.length) refreshTagCounts(news.tags).catch(() => {});
    revalidateSite({ tags: ["homepage", "news"], paths: articlePaths(news) });
    res.json({ success: true, message: "Moved to trash" });
  } catch (err) {
    serverError(res, err, "trashNews");
  }
};

/* =========================================================
   BULK OPERATIONS
========================================================= */

const readIds = (req) => (Array.isArray(req.body?.ids) ? req.body.ids : []).filter(isObjectId);

/** POST /api/news/bulk/status   { ids, status } */
exports.bulkStatus = async (req, res) => {
  try {
    const ids = readIds(req);
    const { status } = req.body || {};

    if (!ids.length) return res.status(400).json({ success: false, message: "ids required" });
    // Scheduling needs a date per article, so it is not a bulk action.
    if (!STATUSES.includes(status) || status === "scheduled") {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const newlyPublished =
      status === "published"
        ? await News.distinct("_id", { _id: { $in: ids }, status: { $ne: "published" } })
        : [];

    const result = await News.updateMany({ _id: { $in: ids } }, { status, ...statusSideEffects(status) });

    refreshTagCounts(await tagIdsOf(ids)).catch(() => {});
    if (newlyPublished.length) queueNewsletter(newlyPublished);

    res.json({ success: true, modified: result.modifiedCount });
  } catch (err) {
    serverError(res, err, "bulkStatus");
  }
};

/** POST /api/news/bulk/category  { ids, category, subCategory? } */
exports.bulkCategory = async (req, res) => {
  try {
    const ids = readIds(req);
    if (!ids.length) return res.status(400).json({ success: false, message: "ids required" });

    const patch = {};
    if (req.body.category) {
      if (!isObjectId(req.body.category)) {
        return res.status(400).json({ success: false, message: "Invalid category id" });
      }
      patch.category = req.body.category;
    }
    if (req.body.subCategory !== undefined) {
      patch.subCategory = isObjectId(req.body.subCategory) ? req.body.subCategory : null;
    }

    if (!Object.keys(patch).length) return res.status(400).json({ success: false, message: "Nothing to change" });

    const result = await News.updateMany({ _id: { $in: ids } }, patch);
    res.json({ success: true, modified: result.modifiedCount });
  } catch (err) {
    serverError(res, err, "bulkCategory");
  }
};

/** POST /api/news/bulk/tags  { ids, tags, mode: "add"|"replace"|"remove" } */
exports.bulkTags = async (req, res) => {
  try {
    const ids = readIds(req);
    if (!ids.length) return res.status(400).json({ success: false, message: "ids required" });

    const mode = ["add", "replace", "remove"].includes(req.body.mode) ? req.body.mode : "add";
    const previousTags = await tagIdsOf(ids);
    // Removing a tag must never create it.
    const { ids: tagIds, names } = await resolveTags(req.body.tags, { create: mode !== "remove" });

    let update;
    if (mode === "replace") update = { $set: { tags: tagIds, tagNames: names } };
    else if (mode === "remove") update = { $pull: { tags: { $in: tagIds }, tagNames: { $in: names } } };
    else update = { $addToSet: { tags: { $each: tagIds }, tagNames: { $each: names } } };

    const result = await News.updateMany({ _id: { $in: ids } }, update);

    refreshTagCounts([...previousTags, ...tagIds]).catch(() => {});
    res.json({ success: true, modified: result.modifiedCount });
  } catch (err) {
    serverError(res, err, "bulkTags");
  }
};

/** POST /api/news/bulk/flags  { ids, flags: { featured: true, ... } } */
exports.bulkFlags = async (req, res) => {
  try {
    const ids = readIds(req);
    if (!ids.length) return res.status(400).json({ success: false, message: "ids required" });

    const allowed = [
      "featured", "trending", "popular", "breakingNews", "editorsPick", "isSponsored",
      "isMainTrending", "isSubTrending", "isCategoryTrending", "isCategorySubTrending",
    ];

    const patch = {};
    Object.entries(req.body.flags || {}).forEach(([k, v]) => {
      if (allowed.includes(k)) patch[k] = Boolean(v);
    });

    if (!Object.keys(patch).length) return res.status(400).json({ success: false, message: "No valid flags" });

    const result = await News.updateMany({ _id: { $in: ids } }, patch);
    res.json({ success: true, modified: result.modifiedCount });
  } catch (err) {
    serverError(res, err, "bulkFlags");
  }
};

/** POST /api/news/bulk/delete  { ids, hard? } */
exports.bulkDelete = async (req, res) => {
  try {
    const ids = readIds(req);
    if (!ids.length) return res.status(400).json({ success: false, message: "ids required" });

    const tagIds = await tagIdsOf(ids);

    if (req.body.hard) {
      const result = await News.deleteMany({ _id: { $in: ids } });
      refreshTagCounts(tagIds).catch(() => {});
      return res.json({ success: true, deleted: result.deletedCount });
    }

    const result = await News.updateMany({ _id: { $in: ids } }, { deletedAt: new Date(), status: "trash" });
    refreshTagCounts(tagIds).catch(() => {});
    res.json({ success: true, modified: result.modifiedCount });
  } catch (err) {
    serverError(res, err, "bulkDelete");
  }
};

/* =========================================================
   FACETS (admin filters + frontend browse)
========================================================= */

/** GET /api/news/facets — distinct values of live articles */
exports.getFacets = async (req, res) => {
  try {
    const live = { deletedAt: null, status: "published" };
    const [regions, countries, languages, authors, destinations] = await Promise.all([
      News.distinct("region", { ...live, region: { $nin: [null, ""] } }),
      News.distinct("country", { ...live, country: { $nin: [null, ""] } }),
      News.distinct("language", live),
      News.distinct("author.name", { ...live, "author.name": { $nin: [null, ""] } }),
      News.distinct("destination", { ...live, destination: { $nin: [null, ""] } }),
    ]);

    res.json({ success: true, data: { regions, countries, languages, authors, destinations } });
  } catch (err) {
    serverError(res, err, "getFacets");
  }
};
