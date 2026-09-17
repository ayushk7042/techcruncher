const Homepage = require("../models/Homepage");
const { revalidateSite } = require("../services/revalidate.service");

const { RAIL_LIMITS } = Homepage;
const RAIL_KEYS = Object.keys(RAIL_LIMITS);

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const GALLERY_TILE_COUNT = 4;
const RAIL_WIDTHS = ["narrow", "medium", "wide"];
const RAIL_TYPES = ["ad", "banner"];
const RAIL_SIZES = ["auto", "300x250", "300x600", "160x600"];
const RAIL_SIDES = ["left", "right"];
const DEFAULT_RAIL_POSITION = { left: "home-gallery-left", right: "home-gallery-right" };

const isObjectId = (value) => /^[0-9a-fA-F]{24}$/.test(String(value || ""));

const str = (value, fallback = "") =>
  value === undefined || value === null ? fallback : String(value).trim();

const bool = (value, fallback) => {
  if (value === undefined || value === null || value === "") return fallback;
  return value === true || value === "true" || value === 1 || value === "1";
};

const oneOf = (value, allowed, fallback) =>
  allowed.includes(String(value)) ? String(value) : fallback;

/** Populates the tiles' article refs — the grid needs image, title, category. */
const GALLERY_POPULATE = {
  path: "gallery.items.article",
  // The wall prints a date and a read count under every tile, so a curated
  // tile has to carry them too — without these it rendered with the caption
  // line blank while an auto-filled tile beside it showed both.
  select: "title slug featuredImage image ogImage gallery category status publishedDate createdAt views",
  populate: { path: "category", select: "name slug" },
};

/** Card-sized story fields, with the category resolved so chips and links work. */
const STORY_SELECT =
  "title slug subtitle description excerpt featuredImage image category author publishedDate createdAt readTime views status breakingNews featured editorsPick";

const storyPath = (path) => ({
  path,
  select: STORY_SELECT,
  populate: { path: "category", select: "name slug shortLabel" },
});

const REF_POPULATE = [
  storyPath("mainTrending"),
  storyPath("subTrending"),
  { path: "categorySections.category" },
  storyPath("categorySections.trending"),
  storyPath("categorySections.subTrending"),
  ...RAIL_KEYS.map((key) => storyPath(`sections.${key}.items`)),
];

/**
 * Normalises whatever the admin panel posted into exactly the shape the
 * schema declares. Anything unrecognised is dropped rather than saved, so a
 * malformed payload can never put the homepage into a state the frontend
 * cannot lay out.
 *
 * `keepRefs` is used on the read path: the tile keeps its populated article
 * document instead of collapsing back to an id, so the frontend gets image,
 * title and category in the same response.
 */
function sanitizeGalleryRail(input, side) {
  const raw = input && typeof input === "object" ? input : {};
  return {
    // Default on — an unsold rail renders nothing, so the only thing this
    // changes is that a booked ad shows up without extra configuration.
    enabled: bool(raw.enabled, true),
    width: oneOf(raw.width, RAIL_WIDTHS, "narrow"),
    type: oneOf(raw.type, RAIL_TYPES, "ad"),
    // "auto" = no frame, so the creative cannot be letterboxed.
    size: oneOf(raw.size, RAIL_SIZES, "auto"),
    adPosition: str(raw.adPosition) || DEFAULT_RAIL_POSITION[side],
    heading: str(raw.heading),
    image: str(raw.image),
    imageAlt: str(raw.imageAlt),
    link: str(raw.link),
    openInNewTab: bool(raw.openInNewTab, true),
    // Off by default — a stretched card is what leaves space around a banner.
    stretch: bool(raw.stretch, false),
  };
}

/**
 * Documents saved before the left/right split carried a single `sidebar` with
 * a `side` field. Fold it into the matching rail so an existing setup survives
 * the upgrade instead of coming back disabled.
 */
function railsFromInput(source) {
  const rails = source.rails && typeof source.rails === "object" ? source.rails : null;
  if (rails && (rails.left || rails.right)) return rails;

  const legacy = source.sidebar;
  if (!legacy || typeof legacy !== "object" || !legacy.enabled) return {};

  const side = RAIL_SIDES.includes(String(legacy.side)) ? String(legacy.side) : "right";
  // `sticky` was this flag's name before it meant "match the grid height".
  return { [side]: { ...legacy, stretch: legacy.stretch ?? legacy.sticky } };
}

function sanitizeGallery(input, keepRefs = false) {
  const source = input && typeof input === "object" ? input : {};
  const railsInput = railsFromInput(source);

  const items = (Array.isArray(source.items) ? source.items : [])
    .map((item, index) => {
      const raw = item && typeof item === "object" ? item : {};
      const ref = raw.article;
      const id = ref && typeof ref === "object" ? ref._id : ref;
      const valid = isObjectId(id);

      return {
        article: keepRefs ? (valid ? ref : null) : valid ? String(id) : null,
        hasArticle: valid,
        image: str(raw.image),
        title: str(raw.title),
        category: str(raw.category),
        link: str(raw.link),
        order: Number.isFinite(Number(raw.order)) ? Number(raw.order) : index,
      };
    })
    // A tile with neither an article nor an image would render as a hole.
    .filter((item) => item.hasArticle || item.image || item.title)
    .sort((a, b) => a.order - b.order)
    .slice(0, GALLERY_TILE_COUNT)
    .map(({ hasArticle: _ignored, ...item }, index) => ({ ...item, order: index }));

  return {
    enabled: bool(source.enabled, true),
    title: str(source.title, "Snap Wall") || "Snap Wall",
    subtitle: str(source.subtitle),
    actionLabel: str(source.actionLabel),
    actionLink: str(source.actionLink),
    source: oneOf(source.source, ["auto", "manual"], "auto"),
    items,
    rails: {
      left: sanitizeGalleryRail(railsInput.left, "left"),
      right: sanitizeGalleryRail(railsInput.right, "right"),
    },
  };
}

/* ------------------------------------------------------------------ */
/* Curated rails                                                       */
/* ------------------------------------------------------------------ */

/**
 * Normalises one rail. Ids are kept even while the rail is on `auto`, so an
 * editor can flip a section back to curated without losing what they picked.
 *
 * `keepRefs` is the read path: items stay as their populated documents.
 */
function sanitizeRail(input, key, keepRefs = false) {
  const raw = input && typeof input === "object" ? input : {};
  const limit = RAIL_LIMITS[key] || 6;

  const items = (Array.isArray(raw.items) ? raw.items : [])
    .map((item) => {
      const id = item && typeof item === "object" ? item._id : item;
      if (!isObjectId(id)) return null;
      return keepRefs && item && typeof item === "object" ? item : String(id);
    })
    .filter(Boolean)
    // The same story twice would render as a repeat inside one rail.
    .filter((item, index, list) => {
      const id = String(item && item._id ? item._id : item);
      return list.findIndex((other) => String(other && other._id ? other._id : other) === id) === index;
    })
    .slice(0, limit);

  return {
    enabled: bool(raw.enabled, true),
    mode: oneOf(raw.mode, ["auto", "manual"], "auto"),
    items,
    limit,
  };
}

function sanitizeSections(input, keepRefs = false) {
  const source = input && typeof input === "object" ? input : {};
  return RAIL_KEYS.reduce((acc, key) => {
    acc[key] = sanitizeRail(source[key], key, keepRefs);
    return acc;
  }, {});
}

/** Shape returned to the public site — tiles carry their populated article. */
function galleryResponse(gallery) {
  const value = gallery && typeof gallery.toObject === "function" ? gallery.toObject() : gallery;
  return sanitizeGallery(value || {}, true);
}

/* ------------------------------------------------------------------ */
/* GET /api/homepage                                                   */
/* ------------------------------------------------------------------ */

exports.getHomepage = async (req, res) => {
  try {
    const homepage = await Homepage.findOne()
      .populate(REF_POPULATE)
      .populate(GALLERY_POPULATE);

    const response = homepage || {};
    const gallery = galleryResponse(response.gallery);

    res.json({
      mainTrending: response.mainTrending || null,

      subTrending: response.subTrending || [],
      editorPicks: response.subTrending || [], // temporary reuse
      trendingTopics: [], // optional

      breaking: response.subTrending || [],

      categorySections: response.categorySections || [],
      customHomeBlocks: response.customHomeBlocks || [],
      gallery,
      sections: sanitizeSections(
        response.sections && typeof response.sections.toObject === "function"
          ? response.sections.toObject()
          : response.sections,
        true
      ),
    });
  } catch (err) {
    console.error("Get homepage error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ------------------------------------------------------------------ */
/* PUT /api/homepage                                                   */
/* ------------------------------------------------------------------ */

exports.updateHomepage = async (req, res) => {
  try {
    const body = req.body || {};
    const idOrNull = (value) => (isObjectId(value) ? String(value) : null);
    const idList = (value, max) =>
      (Array.isArray(value) ? value : []).map(idOrNull).filter(Boolean).slice(0, max);

    // Only known keys with valid ids are ever saved; a malformed payload cannot
    // put the homepage into a state the frontend cannot lay out.
    const data = {
      mainTrending: idOrNull(body.mainTrending),
      subTrending: idList(body.subTrending, 5),
      categorySections: (Array.isArray(body.categorySections) ? body.categorySections : [])
        .filter((sec) => sec && isObjectId(sec.category))
        .map((sec) => ({
          category: String(sec.category),
          trending: idOrNull(sec.trending),
          // Four, because that is what the block beside the lead story shows.
          subTrending: idList(sec.subTrending, 4),
        })),
      customHomeBlocks: (Array.isArray(body.customHomeBlocks) ? body.customHomeBlocks : []).map((block, index) => ({
        title: str(block?.title),
        link: str(block?.link),
        image: str(block?.image),
        order: Number.isFinite(Number(block?.order)) ? Number(block.order) : index,
      })),
      gallery: body.gallery,
      sections: body.sections,
    };

    let homepage = await Homepage.findOne();

    if (!homepage) {
      homepage = await Homepage.create({
        mainTrending: data.mainTrending,
        subTrending: data.subTrending,
        categorySections: data.categorySections,
        customHomeBlocks: data.customHomeBlocks,
        gallery: sanitizeGallery(data.gallery),
        sections: sanitizeSections(data.sections),
      });
    } else {
      homepage.mainTrending = data.mainTrending || null;
      homepage.subTrending = data.subTrending || [];
      homepage.categorySections = data.categorySections || [];
      homepage.customHomeBlocks = data.customHomeBlocks || [];

      // Omitting `sections` leaves every rail as it was, so an older panel
      // build cannot wipe a curated homepage just by saving.
      if (data.sections !== undefined) {
        homepage.sections = sanitizeSections(data.sections);
      }

      // Omitting `gallery` leaves the stored block untouched, so a panel that
      // predates this field cannot wipe it.
      if (data.gallery !== undefined) {
        homepage.gallery = sanitizeGallery(data.gallery);
        // Migrated above; leaving it behind would resurrect on the next read.
        homepage.set("gallery.sidebar", undefined);
      }

      await homepage.save();
    }

    await homepage.populate(REF_POPULATE);
    await homepage.populate(GALLERY_POPULATE);

    // The curated bands are the homepage itself, so rebuild it straight away.
    revalidateSite({ tags: ["homepage", "news"], paths: ["/"] });

    res.json(homepage);
  } catch (err) {
    console.error("Update homepage error:", err);
    res.status(500).json({ message: "Could not save the homepage" });
  }
};
