"use client";

import { Bookmark, ChevronDown, Menu, Moon, Search, Sun, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { sections } from "@/config/site";
import type { Category, News } from "@/types/api";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { useHydrated } from "@/hooks/use-hydrated";
import { useDismiss, useScrollLock } from "@/hooks/use-dismiss";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/cn";
import { formatLongDate } from "@/lib/format";
import { categoryHref, newsHref } from "@/lib/news";
import { CategoryStrip } from "./category-strip";
import { Logo } from "./logo";
import { SearchBox } from "./search-box";

interface HeaderProps {
  categories: Category[];
  headline: Pick<News, "title" | "slug"> | null;
}

const subscribeScroll = (listener: () => void) => {
  window.addEventListener("scroll", listener, { passive: true });
  return () => window.removeEventListener("scroll", listener);
};

const iconButton =
  "relative flex h-8 w-8 items-center justify-center text-ink-soft transition-colors hover:bg-raise hover:text-ink";

export function Header({ categories, headline }: HeaderProps) {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();
  const { items: saved } = useBookmarks();

  const scrolled = useSyncExternalStore(subscribeScroll, () => window.scrollY > 32, () => false);
  const hydrated = useHydrated();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [browseOpen, setBrowseOpen] = useState(false);

  // Close every menu on navigation (state adjusted during render, not in an effect).
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setDrawerOpen(false);
    setSearchOpen(false);
    setBrowseOpen(false);
  }

  const browseRef = useRef<HTMLDivElement>(null);
  const closeBrowse = useCallback(() => setBrowseOpen(false), []);
  useDismiss(browseOpen, browseRef, closeBrowse);

  // The toggle counts as inside the search panel: otherwise its mousedown closes
  // the panel and its click reopens it, which reads as "needs a double click".
  const searchPanelRef = useRef<HTMLDivElement>(null);
  const searchToggleRef = useRef<HTMLButtonElement>(null);
  const searchRefs = useMemo(() => [searchPanelRef, searchToggleRef], []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);
  useDismiss(searchOpen, searchRefs, closeSearch);
  useScrollLock(drawerOpen);

  const menuCategories = categories.filter((c) => c.showInMenu !== false && !c.parent);
  // The dropdown lists sections only; sub-topics live on the /categories page.
  const mainCategories = categories.filter((c) => !c.parent);
  const activeSlug = pathname.startsWith("/category/") ? decodeURIComponent(pathname.split("/")[2] || "") : undefined;
  // "Today" renders only on the client so server and browser never disagree on the date.
  const today = hydrated ? formatLongDate(new Date()) : "";

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setDrawerOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  return (
    <>
      <header className="glass-masthead sticky top-0 z-50">
        {/* Band 1 — dateline */}
        <div
          className={cn(
            "hidden overflow-hidden border-b border-line transition-[height,opacity] duration-300 lg:block",
            scrolled ? "h-0 opacity-0" : "h-8 opacity-100",
          )}
        >
          <div className="container flex h-8 items-center justify-between gap-6">
            <span className="meta shrink-0" suppressHydrationWarning>
              {today}
            </span>
            {headline && (
              <div className="flex min-w-0 items-center gap-3">
                <span className="chip-live shrink-0">Breaking</span>
                <Link href={newsHref(headline)} className="truncate text-[12.5px] font-medium text-ink hover:text-accent">
                  {headline.title}
                </Link>
              </div>
            )}
            <div className="flex shrink-0 gap-5">
              <Link href="/about" className="link-muted">
                About
              </Link>
              <Link href="/contact" className="link-muted">
                Contact
              </Link>
            </div>
          </div>
        </div>

        {/* Band 2 — masthead */}
        <div className="container">
          <div
            className={cn(
              "flex items-center gap-3 transition-[height] duration-300 lg:gap-8",
              scrolled ? "h-[52px]" : "h-[60px] sm:h-[66px]",
            )}
          >
            <button type="button" aria-label="Open menu" onClick={() => setDrawerOpen(true)} className={cn(iconButton, "-ml-2 lg:hidden")}>
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>

            <Logo compact={scrolled} />

            <nav aria-label="Sections" className="hidden items-center gap-5 lg:flex">
              {sections.map((section) => {
                const active = pathname === section.href;
                return (
                  <Link
                    key={section.href}
                    href={section.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative whitespace-nowrap py-1 font-mono text-[11px] font-medium uppercase tracking-eyebrow transition-colors",
                      active
                        ? "text-ink after:absolute after:inset-x-0 after:-bottom-1 after:h-[2px] after:bg-accent after:content-['']"
                        : "text-ink-soft hover:text-ink",
                    )}
                  >
                    {section.label}
                  </Link>
                );
              })}
            </nav>

            <SearchBox topics={menuCategories} hotkey className="ml-auto hidden w-full max-w-[240px] md:block xl:max-w-[280px]" />

            <div className="ml-auto flex shrink-0 items-center gap-1 md:ml-0">
              <button
                ref={searchToggleRef}
                type="button"
                aria-label="Search"
                aria-expanded={searchOpen}
                onClick={() => setSearchOpen((v) => !v)}
                className={cn(iconButton, "md:hidden")}
              >
                <Search className="h-[18px] w-[18px]" aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
                onClick={toggle}
                className={iconButton}
              >
                {theme === "dark" ? (
                  <Sun className="h-[18px] w-[18px]" aria-hidden="true" />
                ) : (
                  <Moon className="h-[18px] w-[18px]" aria-hidden="true" />
                )}
              </button>
              <Link href="/bookmarks" aria-label={`Reading list (${saved.length})`} className={iconButton}>
                <Bookmark className="h-[18px] w-[18px]" aria-hidden="true" />
                {saved.length > 0 && <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-accent" />}
              </Link>
              <Link href="/newsletter" className="btn-primary ml-2 hidden h-8 px-3.5 sm:inline-flex">
                Subscribe
              </Link>
            </div>
          </div>

          {searchOpen && (
            <div ref={searchPanelRef} className="pb-3 md:hidden">
              <SearchBox topics={menuCategories} autoFocus onNavigate={closeSearch} onDismiss={closeSearch} />
            </div>
          )}
        </div>

        {/* Band 3 — section rail */}
        {menuCategories.length > 0 && (
          <div className="border-t border-line">
            <div className="container flex items-center gap-3">
              <div ref={browseRef} className="relative shrink-0">
                <button
                  type="button"
                  aria-expanded={browseOpen}
                  aria-haspopup="true"
                  onClick={() => setBrowseOpen((v) => !v)}
                  className="inline-flex h-9 items-center gap-1.5 pr-3.5 font-mono text-[11px] font-medium uppercase tracking-eyebrow text-ink transition-colors hover:text-accent"
                >
                  All topics
                  <ChevronDown className={cn("h-3 w-3 transition-transform", browseOpen && "rotate-180")} aria-hidden="true" />
                </button>

                {browseOpen && (
                  <div className="absolute left-0 top-10 z-50 w-[min(680px,92vw)] overflow-hidden border-2 border-ink bg-paper shadow-pop">
                    <div className="flex items-baseline justify-between border-b border-line px-4 py-2.5">
                      <span className="eyebrow text-ink">Main sections</span>
                      <span className="meta">{mainCategories.length} sections</span>
                    </div>
                    <div className="grid max-h-[60vh] grid-cols-2 overflow-y-auto sm:grid-cols-3">
                      {mainCategories.map((category) => {
                        const active = category.slug === activeSlug;
                        return (
                          <Link
                            key={category._id}
                            href={categoryHref(category)}
                            className={cn(
                              "flex items-baseline justify-between gap-2 border-b border-r border-line px-4 py-2 text-[13px] transition-colors",
                              active ? "bg-raise font-semibold text-ink" : "text-ink-soft hover:bg-raise hover:text-ink",
                            )}
                          >
                            <span className="clamp-1">{category.name}</span>
                            <span className="meta shrink-0 tabular-nums">{category.articleCount ?? 0}</span>
                          </Link>
                        );
                      })}
                    </div>
                    <Link href="/categories" className="link-muted block border-t border-line px-4 py-2.5 text-center">
                      Browse all topics
                    </Link>
                  </div>
                )}
              </div>

              <span aria-hidden="true" className="h-4 w-px shrink-0 bg-line" />

              <CategoryStrip categories={menuCategories} activeSlug={activeSlug} />
            </div>
          </div>
        )}
      </header>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="absolute inset-0 bg-ink-950/50" onClick={() => setDrawerOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-[88%] max-w-sm flex-col bg-canvas">
            <div className="flex items-center justify-between border-b-2 border-ink px-5 py-3.5">
              <Logo compact />
              <button type="button" aria-label="Close menu" onClick={() => setDrawerOpen(false)} className={iconButton}>
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5">
              <SearchBox topics={menuCategories} onNavigate={() => setDrawerOpen(false)} />

              <p className="eyebrow mt-7">Sections</p>
              <nav aria-label="Sections" className="mt-3 border-t border-line">
                {sections.map((section) => (
                  <Link
                    key={section.href}
                    href={section.href}
                    className={cn(
                      "headline block border-b border-line py-2.5 text-[20px] uppercase transition-colors",
                      pathname === section.href ? "text-accent" : "text-ink hover:text-accent",
                    )}
                  >
                    {section.label}
                  </Link>
                ))}
              </nav>

              <p className="eyebrow mt-7">Topics</p>
              <div className="mt-3 border-t border-line">
                {categories.map((category) => (
                  <Link
                    key={category._id}
                    href={categoryHref(category)}
                    className={cn(
                      "flex items-baseline justify-between gap-3 border-b border-line py-2 text-[14px]",
                      category.slug === activeSlug ? "font-semibold text-accent" : "text-ink-soft hover:text-ink",
                    )}
                  >
                    {category.name}
                    <span className="meta">{category.articleCount ?? 0}</span>
                  </Link>
                ))}
              </div>

              <Link href="/newsletter" className="btn-primary mt-6 h-11 w-full">
                Subscribe to the newsletter
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
