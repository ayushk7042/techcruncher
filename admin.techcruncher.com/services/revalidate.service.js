/**
 * Tells the public site to rebuild what an edit just changed, so a save in the
 * panel shows up at once instead of waiting out the page's cache window.
 *
 * Fire-and-forget by design: the panel must never fail a save because the site
 * was slow to answer, and a missed ping only means the change appears on the
 * normal timed refresh.
 */

// SITE_REVALIDATE_URL wins so a local API can refresh the local site while
// FRONTEND_URL still points at production for links in email.
const SITE_URL = (process.env.SITE_REVALIDATE_URL || process.env.FRONTEND_URL || process.env.SITE_URL || "").replace(/\/+$/, "");
const SECRET = process.env.REVALIDATE_SECRET || "";
const TIMEOUT_MS = 4000;

let warned = false;

/**
 * @param {{ tags?: string[], paths?: string[] }} what
 */
const revalidateSite = (what = {}) => {
  if (!SITE_URL || !SECRET) {
    if (!warned) {
      warned = true;
      console.warn("[revalidate] FRONTEND_URL or REVALIDATE_SECRET is unset; the site will refresh on its own schedule.");
    }
    return;
  }

  const body = JSON.stringify({
    tags: what.tags || ["homepage", "news"],
    paths: what.paths || ["/"],
  });

  fetch(`${SITE_URL}/api/revalidate`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-revalidate-secret": SECRET },
    body,
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
    .then((response) => {
      if (!response.ok) console.warn(`[revalidate] site answered ${response.status}`);
    })
    .catch((error) => console.warn(`[revalidate] ${error.message}`));
};

/** Paths worth rebuilding when one article changes. */
const articlePaths = (news) => {
  const paths = ["/", "/latest"];
  if (news?.slug) paths.push(`/news/${news.slug}`);
  return paths;
};

module.exports = { revalidateSite, articlePaths };
