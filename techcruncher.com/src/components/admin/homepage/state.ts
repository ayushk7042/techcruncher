import type { HomepagePayload } from "@/lib/api/admin";
import { idOf, isPopulated } from "@/lib/news";
import { RAIL_KEYS, type Homepage, type HomepageGallery, type ID, type News, type RailKey } from "@/types/api";

/** Mirrors RAIL_LIMITS in models/Homepage.js; PUT responses omit `limit`. */
export const RAIL_LIMITS: Record<RailKey, number> = {
  hero: 5,
  heroRail: 4,
  editorsPicks: 6,
  featured: 6,
  popular: 5,
  latest: 9,
  dontMiss: 1,
  moreStories: 12,
};

export const MAX_SUB_TRENDING = 5;
export const MAX_SECTION_STORIES = 4;
export const GALLERY_TILES = 4;

export interface RailDraft {
  enabled: boolean;
  mode: "auto" | "manual";
  items: News[];
}

export interface CategorySectionDraft {
  key: string;
  category: ID;
  trending: News | null;
  subTrending: News[];
}

export interface GalleryTileDraft {
  key: string;
  kind: "article" | "custom";
  article: News | null;
  image: string;
  title: string;
  category: string;
  link: string;
}

export interface GalleryDraft extends Omit<HomepageGallery, "items" | "rails"> {
  items: GalleryTileDraft[];
}

/** Editor state: references stay as documents so titles render; toPayload reduces them to ids. */
export interface HomepageDraft {
  mainTrending: News | null;
  subTrending: News[];
  categorySections: CategorySectionDraft[];
  customHomeBlocks: Homepage["customHomeBlocks"];
  gallery: GalleryDraft;
  sections: Record<RailKey, RailDraft>;
}

let keySeq = 0;
/** Stable React keys for rows that have no id of their own. */
export const nextKey = () => `row-${++keySeq}`;

const populated = (value: News | ID | null | undefined): News | null => (isPopulated(value) ? value : null);

// A reference whose article was deleted populates to null (or stays an id); drop it.
const populatedList = (list: (News | ID | null)[] | undefined): News[] =>
  (list ?? []).filter((item): item is News => isPopulated(item));

export const emptyTile = (kind: GalleryTileDraft["kind"]): GalleryTileDraft => ({
  key: nextKey(),
  kind,
  article: null,
  image: "",
  title: "",
  category: "",
  link: "",
});

/** Accepts both the GET shape and the raw document PUT returns. */
export function toDraft(homepage: Homepage): HomepageDraft {
  const gallery = homepage.gallery;

  return {
    mainTrending: populated(homepage.mainTrending),
    subTrending: populatedList(homepage.subTrending),
    categorySections: (homepage.categorySections ?? []).map((section) => ({
      key: nextKey(),
      category: idOf(section.category),
      trending: populated(section.trending),
      subTrending: populatedList(section.subTrending),
    })),
    customHomeBlocks: homepage.customHomeBlocks ?? [],
    gallery: {
      enabled: gallery?.enabled ?? true,
      title: gallery?.title ?? "",
      subtitle: gallery?.subtitle ?? "",
      actionLabel: gallery?.actionLabel ?? "",
      actionLink: gallery?.actionLink ?? "",
      source: gallery?.source === "manual" ? "manual" : "auto",
      items: (gallery?.items ?? []).map((item) => ({
        key: nextKey(),
        kind: item.article ? "article" : "custom",
        article: populated(item.article),
        image: item.image ?? "",
        title: item.title ?? "",
        category: item.category ?? "",
        link: item.link ?? "",
      })),
    },
    sections: Object.fromEntries(
      RAIL_KEYS.map((key) => {
        const rail = homepage.sections?.[key];
        return [key, { enabled: rail?.enabled ?? true, mode: rail?.mode === "manual" ? "manual" : "auto", items: populatedList(rail?.items) }];
      }),
    ) as Record<RailKey, RailDraft>,
  };
}

/**
 * The PUT replaces mainTrending, subTrending, categorySections and
 * customHomeBlocks wholesale, so every save carries all of them. `gallery.rails`
 * is deliberately never sent: the backend sanitizes it with the wrong function.
 */
export function toPayload(draft: HomepageDraft): HomepagePayload {
  const ids = (list: News[]) => list.map((news) => news._id);
  const { items, ...gallery } = draft.gallery;

  return {
    mainTrending: draft.mainTrending?._id ?? null,
    subTrending: ids(draft.subTrending).slice(0, MAX_SUB_TRENDING),
    categorySections: draft.categorySections
      .filter((section) => section.category)
      .map((section) => ({
        category: section.category,
        trending: section.trending?._id ?? null,
        subTrending: ids(section.subTrending).slice(0, MAX_SECTION_STORIES),
      })),
    customHomeBlocks: draft.customHomeBlocks,
    gallery: {
      ...gallery,
      items: items.slice(0, GALLERY_TILES).map((tile, order) => ({
        article: tile.kind === "article" ? (tile.article?._id ?? null) : null,
        image: tile.image.trim(),
        title: tile.title.trim(),
        category: tile.category.trim(),
        link: tile.link.trim(),
        order,
      })),
    },
    sections: Object.fromEntries(
      RAIL_KEYS.map((key) => {
        const rail = draft.sections[key];
        return [key, { enabled: rail.enabled, mode: rail.mode, items: ids(rail.items).slice(0, RAIL_LIMITS[key]) }];
      }),
    ),
  };
}

export const serializeDraft = (draft: HomepageDraft) => JSON.stringify(toPayload(draft));
