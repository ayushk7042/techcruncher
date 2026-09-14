export const slugifyTitle = (title = "") =>
  title
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

export const getNewsSlug = (news) => news?.slug || slugifyTitle(news?.title) || news?._id || "";

export const getNewsPath = (news) => `/news/${getNewsSlug(news)}`;
