/**
 * Shapes returned by the Express API in admin.techcruncher.com.
 * Kept in one file so a backend change has exactly one place to land.
 */

export type ID = string;

export interface ImageAsset {
  public_id?: string;
  url?: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
  alt?: string;
  caption?: string;
  title?: string;
  credit?: string;
  redirectUrl?: string;
  openInNewTab?: boolean;
  nofollow?: boolean;
  lazyLoad?: boolean;
  priority?: boolean;
  responsive?: boolean;
}

/* ------------------------------------------------------------------ */
/* Taxonomy                                                            */
/* ------------------------------------------------------------------ */

export interface Category {
  _id: ID;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  shortLabel?: string;
  parent?: ID | null;
  image?: ImageAsset;
  banner?: ImageAsset;
  iconImage?: ImageAsset;
  ogImage?: ImageAsset;
  coverImage?: ImageAsset | null;
  status: "active" | "inactive";
  hidden?: boolean;
  featured?: boolean;
  showOnHome?: boolean;
  showInMenu?: boolean;
  showInFooter?: boolean;
  order?: number;
  priority?: number;
  redirectUrl?: string;
  seoTitle?: string;
  seoDescription?: string;
  metaTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
  canonicalUrl?: string;
  robots?: string;
  autoUpdateEnabled?: boolean;
  dailyAutoUpdateLimit?: number;
  maxSubTrending?: number;
  articleCount?: number;
  children?: Category[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Tag {
  _id: ID;
  name: string;
  slug: string;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  focusKeyword?: string;
  usageCount: number;
  featured: boolean;
  status: "active" | "inactive";
  createdAt?: string;
}

/* ------------------------------------------------------------------ */
/* Articles                                                            */
/* ------------------------------------------------------------------ */

export type NewsStatus = "draft" | "published" | "archived" | "scheduled" | "trash";

export interface Author {
  name?: string;
  slug?: string;
  image?: ImageAsset;
  bio?: string;
  designation?: string;
  email?: string;
  redirectUrl?: string;
  social?: { twitter?: string; instagram?: string; linkedin?: string; website?: string };
}

export interface Video {
  url: string;
  thumbnail?: ImageAsset;
  title?: string;
  caption?: string;
  redirectUrl?: string;
  provider?: string;
  duration?: number;
}

export interface AffiliateLink {
  title?: string;
  link?: string;
  buttonText?: string;
  productImage?: string;
  price?: string;
}

export interface ContentBlock {
  type: "text" | "image" | "link" | "affiliate" | "html" | "video" | "quote" | "embed";
  value: unknown;
  /** Section heading written above the block by the original admin panel. */
  heading?: string;
  /** Click-through for image and affiliate blocks. */
  redirectUrl?: string;
  meta?: Record<string, unknown>;
}

export interface Cta {
  label?: string;
  url?: string;
  style?: "primary" | "secondary" | "ghost";
  openInNewTab?: boolean;
}

export interface News {
  _id: ID;
  title: string;
  slug: string;
  subtitle?: string;
  description: string;
  shortDescription?: string;
  longDescription?: string;
  excerpt?: string;
  content?: string;
  contentBlocks?: ContentBlock[];

  featuredImage?: ImageAsset;
  /** Lead image on articles created by the original admin panel. */
  image?: ImageAsset;
  imageRedirectUrl?: string;
  isSponsored?: boolean;
  ogImage?: ImageAsset;
  twitterImage?: ImageAsset;
  gallery?: ImageAsset[];
  videos?: Video[];

  category?: Category | ID | null;
  subCategory?: Category | ID | null;
  tags?: (Tag | ID)[];
  tagNames?: string[];
  author?: Author;

  featured?: boolean;
  trending?: boolean;
  popular?: boolean;
  breakingNews?: boolean;
  editorsPick?: boolean;
  isMainTrending?: boolean;
  isSubTrending?: boolean;
  isCategoryTrending?: boolean;
  isCategorySubTrending?: boolean;
  priority?: number;

  status: NewsStatus;
  publishedDate?: string | null;
  scheduledAt?: string | null;
  updatedDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;

  readTime?: number;
  views?: number;
  likes?: number;
  shareCount?: number;

  cta?: Cta;
  advertisement?: { code?: string; position?: string; enabled?: boolean };
  affiliateLinks?: AffiliateLink[];
  sourceLinks?: string[];
  sourceName?: string;
  sourceUrl?: string;
  canonicalUrl?: string;
  externalLink?: string;
  adsLink?: string;

  metaTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
  robots?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  seoScore?: number;
  schemaMarkup?: Record<string, unknown> | null;

  relatedNews?: (News | ID)[];
  internalLinks?: { news?: News | ID; anchorText?: string }[];

  language?: string;
  country?: string;
  region?: string;
  destination?: string;

  aiGenerated?: boolean;
  autoUpdateEnabled?: boolean;
  createdBy?: "admin" | "ai" | "import";
  warnings?: string[];
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasMore?: boolean;
}

export interface Paginated<T> {
  success: boolean;
  data: T[];
  pagination: Pagination;
}

export interface Envelope<T> {
  success: boolean;
  data: T;
  message?: string;
}

export type NewsSort = "latest" | "oldest" | "popular" | "trending" | "priority" | "title" | "updated";

export interface NewsListParams {
  page?: number;
  limit?: number;
  sort?: NewsSort;
  search?: string;
  category?: string;
  subCategory?: string;
  tag?: string;
  status?: NewsStatus | "all";
  author?: string;
  featured?: boolean;
  trending?: boolean;
  popular?: boolean;
  breaking?: boolean;
  editorsPick?: boolean;
  dateFrom?: string;
  dateTo?: string;
  exclude?: string;
}

export interface HomeFeed {
  hero: News | null;
  breaking: News[];
  featured: News[];
  editorsPick: News[];
  trending: News[];
  popular: News[];
  latest: News[];
  dontMiss: News[];
}

/* ------------------------------------------------------------------ */
/* Homepage curation                                                   */
/* ------------------------------------------------------------------ */

export const RAIL_KEYS = [
  "hero",
  "heroRail",
  "editorsPicks",
  "featured",
  "popular",
  "latest",
  "dontMiss",
  "moreStories",
] as const;

export type RailKey = (typeof RAIL_KEYS)[number];

export interface Rail<T = News> {
  enabled: boolean;
  mode: "auto" | "manual";
  items: T[];
  limit: number;
}

export interface HomepageGalleryItem {
  article: News | ID | null;
  image: string;
  title: string;
  category: string;
  link: string;
  order: number;
}

/** Banner/ad column beside the homepage story grid (home-gallery-left / home-gallery-right). */
export interface HomepageGalleryRail {
  enabled: boolean;
  width: "narrow" | "medium" | "wide";
  type: "ad" | "banner";
  size: "auto" | "300x250" | "300x600" | "160x600";
  adPosition: string;
  heading: string;
  image: string;
  imageAlt: string;
  link: string;
  openInNewTab: boolean;
  stretch: boolean;
}

export interface HomepageGallery {
  enabled: boolean;
  title: string;
  subtitle: string;
  actionLabel: string;
  actionLink: string;
  source: "auto" | "manual";
  items: HomepageGalleryItem[];
  /** Read-only here: the admin payload never sends rails. */
  rails?: { left?: HomepageGalleryRail; right?: HomepageGalleryRail };
}

export interface CategorySection<T = News> {
  category: Category | ID | null;
  trending: T | ID | null;
  subTrending: (T | ID)[];
}

export interface Homepage {
  mainTrending: News | null;
  subTrending: News[];
  categorySections: CategorySection[];
  customHomeBlocks: { title?: string; link?: string; image?: string; order?: number }[];
  gallery: HomepageGallery;
  sections: Record<RailKey, Rail>;
}

/* ------------------------------------------------------------------ */
/* Advertising                                                         */
/* ------------------------------------------------------------------ */

export const AD_POSITIONS = [
  "home-hero",
  "home-top",
  "home-infeed",
  "home-mid",
  "home-gallery-left",
  "home-gallery-right",
  "home-gallery",
  "home-bottom",
  "sidebar",
  "sidebar-sticky",
  "article-sidebar-top",
  "article-sidebar-middle",
  "article-sidebar-bottom",
  "article-top",
  "article-inline",
  "article-bottom",
  "category-top",
  "category-infeed",
  "footer",
  "mobile-sticky-bottom",
] as const;

export type AdPosition = (typeof AD_POSITIONS)[number];

/**
 * The slots the panel offers, in the order they appear down the site. Every one
 * is rendered by the public pages; `AD_POSITIONS` stays wider so records saved
 * on a retired slot still validate and can still be read.
 */
export const AD_SLOTS: { value: AdPosition; label: string }[] = [
  { value: "home-hero", label: "Home hero (under the slider)" },
  { value: "home-top", label: "Home top" },
  { value: "home-gallery-left", label: "Home gallery left" },
  { value: "home-gallery-right", label: "Home gallery right" },
  { value: "home-infeed", label: "Home in-feed (inside Latest reporting)" },
  { value: "home-mid", label: "Home mid" },
  { value: "home-bottom", label: "Home bottom" },
  { value: "article-top", label: "Article top" },
  { value: "article-inline", label: "Article inline (inside the body)" },
  { value: "article-bottom", label: "Article bottom" },
  { value: "article-sidebar-top", label: "Article sidebar top" },
  { value: "article-sidebar-middle", label: "Article sidebar middle" },
  { value: "article-sidebar-bottom", label: "Article sidebar bottom" },
  { value: "sidebar", label: "Sidebar (homepage and listings)" },
  { value: "sidebar-sticky", label: "Sidebar sticky (article page)" },
  { value: "category-top", label: "Category top" },
  { value: "category-infeed", label: "Category in-feed" },
  { value: "footer", label: "Footer" },
  { value: "mobile-sticky-bottom", label: "Mobile sticky bottom" },
  { value: "home-gallery", label: "Home gallery (legacy single rail)" },
];
export type Device = "desktop" | "tablet" | "mobile";

export interface Advertisement {
  _id: ID;
  name: string;
  position: AdPosition;
  type: "image" | "script";
  display: "banner" | "frame";
  maxHeight?: number | null;
  image?: ImageAsset;
  scriptCode?: string;
  targetUrl?: string;
  openInNewTab?: boolean;
  devices: Device[];
  categories?: (Category | ID)[];
  priority: number;
  startsAt?: string | null;
  endsAt?: string | null;
  impressions?: number;
  clicks?: number;
  status: "active" | "paused";
  createdAt?: string;
}

/* ------------------------------------------------------------------ */
/* Admin-only resources                                                */
/* ------------------------------------------------------------------ */

export interface AdminUser {
  _id: ID;
  name?: string;
  email: string;
  role: "superadmin" | "editor";
  permissions: { canPublish: boolean; canDelete: boolean };
}

export interface LoginResponse {
  token: string;
  admin: AdminUser;
}

export interface DashboardStats {
  categories: number;
  totalNews: number;
  publishedNews: number;
  draftNews: number;
  aiNews: number;
  autoUpdateNews: number;
  avgSeoScore: number;
  newContacts: number;
}

/** An asset the library never recorded, derived from an article that uses it. */
export interface MediaUsage {
  _id: ID;
  title: string;
  slug: string;
}

export interface ContactMessage {
  _id: ID;
  name: string;
  email: string;
  subject?: string;
  message: string;
  status: "new" | "replied" | "closed";
  reply?: { message?: string; repliedAt?: string; repliedBy?: ID };
  createdAt: string;
}

export interface Subscriber {
  _id: ID;
  email: string;
  name?: string;
  source?: string;
  status: "subscribed" | "unsubscribed";
  unsubscribedAt?: string | null;
  createdAt: string;
}

export interface MediaItem {
  _id: ID;
  name: string;
  originalName?: string;
  folder: string;
  public_id?: string;
  url: string;
  secureUrl?: string;
  thumbnailUrl?: string;
  resourceType: "image" | "video" | "raw";
  format?: string;
  width?: number;
  height?: number;
  bytes?: number;
  alt?: string;
  caption?: string;
  title?: string;
  credit?: string;
  redirectUrl?: string;
  tags?: string[];
  createdAt: string;
  /** "article" when the file is used by a story but was never in the library. */
  source?: "article";
  /** Derived entries have no library document, so they cannot be edited or deleted. */
  readOnly?: boolean;
  usedIn?: MediaUsage;
}

export interface ImportIssue {
  row: number;
  field: string;
  message: string;
  value?: string;
}

export interface ImportJob {
  _id?: ID;
  batchId?: string;
  fileName?: string;
  mode?: "create" | "upsert";
  status: "validated" | "importing" | "completed" | "failed" | "rolled_back";
  totalRows: number;
  validRows?: number;
  errorRows?: number;
  createdCount: number;
  updatedCount: number;
  skippedCount: number;
  errorCount: number;
  willCreate?: number;
  willUpdate?: number;
  processed?: number;
  canRollback?: boolean;
  issues?: ImportIssue[];
  unknownHeaders?: string[];
  pendingSubCategories?: unknown[];
  preview?: {
    row: number;
    title: string;
    slug: string;
    category: string;
    status: string;
    action: "create" | "update";
    hasImage: boolean;
    galleryCount: number;
    valid: boolean;
  }[];
  createdByAdmin?: { name?: string; email?: string } | null;
  createdAt?: string;
  finishedAt?: string;
}
