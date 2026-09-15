import { AdSlot } from "@/components/site/ad-slot";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { getCategories, getTags, getTopHeadline } from "@/lib/api/server-data";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [categories, tags, headline] = await Promise.all([getCategories(), getTags(), getTopHeadline()]);

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-canvas"
      >
        Skip to content
      </a>
      <Header categories={categories} headline={headline} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer categories={categories} tags={tags} />
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 lg:hidden">
        <div className="pointer-events-auto">
          <AdSlot position="mobile-sticky-bottom" ratio="aspect-[320/50]" label={false} className="container border-t border-line bg-canvas/95 py-2 backdrop-blur" />
        </div>
      </div>
    </div>
  );
}
