import type { Category } from "@/types/api";

export interface CategoryRow {
  category: Category;
  depth: number;
  /** Siblings in display order, including this category. */
  siblings: Category[];
}

export type CategoryFlag = "hidden" | "showInMenu" | "showOnHome" | "showInFooter" | "featured";

/** Mirrors the defaults in models/Category.js, which apply to documents that predate a field. */
const FLAG_DEFAULTS: Record<CategoryFlag, boolean> = {
  showInMenu: true,
  showOnHome: true,
  showInFooter: false,
  featured: false,
  hidden: false,
};

/** The effective value of a visibility flag, falling back to the model default. */
export const categoryFlag = (category: Category | undefined, key: CategoryFlag): boolean =>
  category?.[key] ?? FLAG_DEFAULTS[key];

/** Same order as the API: priority desc, order asc, name asc. */
const byApiOrder = (a: Category, b: Category) =>
  (b.priority ?? 0) - (a.priority ?? 0) || (a.order ?? 0) - (b.order ?? 0) || a.name.localeCompare(b.name);

/** Group a flat category list by parent. Orphans (parent missing) sit at the root. */
export function groupByParent(categories: Category[]): Map<string | null, Category[]> {
  const ids = new Set(categories.map((c) => c._id));
  const groups = new Map<string | null, Category[]>();
  for (const category of categories) {
    const key = category.parent && ids.has(category.parent) ? category.parent : null;
    groups.set(key, [...(groups.get(key) ?? []), category]);
  }
  groups.forEach((list) => list.sort(byApiOrder));
  return groups;
}

/** Depth-first flattening so parents are immediately followed by their children. */
export function flattenTree(categories: Category[]): CategoryRow[] {
  const groups = groupByParent(categories);
  const rows: CategoryRow[] = [];
  const visit = (parent: string | null, depth: number) => {
    const siblings = groups.get(parent) ?? [];
    for (const category of siblings) {
      rows.push({ category, depth, siblings });
      visit(category._id, depth + 1);
    }
  };
  visit(null, 0);
  return rows;
}

/** The category itself plus every category below it. */
export function descendantIds(categories: Category[], rootId: string): Set<string> {
  const groups = groupByParent(categories);
  const result = new Set<string>([rootId]);
  const stack = [rootId];
  while (stack.length) {
    const id = stack.pop() as string;
    for (const child of groups.get(id) ?? []) {
      if (!result.has(child._id)) {
        result.add(child._id);
        stack.push(child._id);
      }
    }
  }
  return result;
}

/** Indented select options, e.g. "— Child". */
export function treeOptions(categories: Category[], exclude: Set<string> = new Set()) {
  return flattenTree(categories)
    .filter(({ category }) => !exclude.has(category._id))
    .map(({ category, depth }) => ({ value: category._id, label: `${"— ".repeat(depth)}${category.name}` }));
}

/** Mirrors the API's slugify({ lower, strict }) closely enough for a preview. */
export const slugify = (text: string) =>
  text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s-]+/g, "-");
