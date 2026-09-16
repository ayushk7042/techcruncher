import { ArticleCard, ArticleListRow } from "@/components/site/cards";
import { SectionHeader } from "@/components/site/headers";
import type { Category, CategorySection, News } from "@/types/api";
import { categoryHref, isPopulated } from "@/lib/news";

export interface ResolvedCategorySection {
  category: Category;
  lead: News;
  rest: News[];
}

/**
 * The "Category sections" the panel curates: one band per category, its lead
 * story large with the supporting stories listed beside it. A section is only
 * rendered once its category and lead story are both present — a half-filled
 * row would otherwise appear as an empty heading.
 */
export function resolveCategorySections(sections: CategorySection[] | undefined): ResolvedCategorySection[] {
  return (sections || []).flatMap((section) => {
    const category = section.category;
    if (!category || typeof category !== "object" || !("slug" in category)) return [];

    const lead = isPopulated(section.trending) ? section.trending : null;
    if (!lead?.slug) return [];

    const rest = (section.subTrending || []).filter(isPopulated).filter((news) => news.slug && news._id !== lead._id);

    return [{ category, lead, rest }];
  });
}

export function CategoryBands({ sections }: { sections: ResolvedCategorySection[] }) {
  if (!sections.length) return null;

  return (
    <>
      {sections.map(({ category, lead, rest }) => (
        <section key={category._id}>
          <SectionHeader title={category.name} action={{ label: `All ${category.shortLabel || category.name}`, href: categoryHref(category) }} />
          <div className="grid gap-x-8 gap-y-7 lg:grid-cols-12">
            <div className="min-w-0 lg:col-span-7">
              <ArticleCard news={lead} wideImage />
            </div>
            {rest.length > 0 && (
              // The rows share the lead card's height, so the column ends level
              // with it instead of trailing off into blank space.
              <div className="flex min-w-0 flex-col divide-y divide-line border-t border-ink lg:col-span-5">
                {rest.map((news) => (
                  <div key={news._id} className="flex flex-1 flex-col justify-center">
                    <ArticleListRow news={news} large />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      ))}
    </>
  );
}
