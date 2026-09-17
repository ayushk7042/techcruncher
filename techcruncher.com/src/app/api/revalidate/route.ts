import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

/**
 * On-demand revalidation, called by the admin API the moment something is
 * saved. Without it a change waits out the page's 60-second window, which is
 * what made a homepage edit look like it had not applied.
 *
 * POST /api/revalidate
 *   headers: x-revalidate-secret: <REVALIDATE_SECRET>
 *   body:    { "tags": ["homepage"], "paths": ["/", "/news/slug"] }
 *
 * With no secret configured the endpoint refuses every call, so an
 * unconfigured deployment simply keeps the old timed behaviour.
 */

const MAX_ENTRIES = 40;

const asList = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && item.length > 0).slice(0, MAX_ENTRIES) : [];

export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json({ revalidated: false, reason: "REVALIDATE_SECRET is not set" }, { status: 503 });
  }
  if (request.headers.get("x-revalidate-secret") !== secret) {
    return NextResponse.json({ revalidated: false, reason: "Bad secret" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const tags = asList((body as { tags?: unknown }).tags);
  const paths = asList((body as { paths?: unknown }).paths).filter((path) => path.startsWith("/"));

  // Nothing named means "the homepage and its stories", the common case.
  const tagList = tags.length || paths.length ? tags : ["homepage", "news"];
  const pathList = tags.length || paths.length ? paths : ["/"];

  // `{ expire: 0 }` purges at once; `updateTag` would be the alternative but it
  // is only callable from a Server Action, not from a route handler.
  tagList.forEach((tag) => revalidateTag(tag, { expire: 0 }));
  pathList.forEach((path) => revalidatePath(path));

  return NextResponse.json({ revalidated: true, tags: tagList, paths: pathList, at: new Date().toISOString() });
}
