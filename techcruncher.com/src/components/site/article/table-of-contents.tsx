"use client";

import { useEffect, useState } from "react";
import type { TocItem } from "@/lib/article-html";
import { cn } from "@/lib/cn";

function scrollToHeading(event: React.MouseEvent<HTMLAnchorElement>, id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  event.preventDefault();
  window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 128, behavior: "smooth" });
  window.history.replaceState(null, "", `#${id}`);
}

function useActiveHeading(items: TocItem[]) {
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-120px 0px -70% 0px" },
    );
    items.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [items]);

  return active;
}

function TocList({ items, active }: { items: TocItem[]; active?: string }) {
  return (
    <ol className="mt-3 max-h-[52vh] space-y-0.5 overflow-y-auto">
      {items.map((item) => (
        <li key={item.id}>
          <a
            href={`#${item.id}`}
            onClick={(event) => scrollToHeading(event, item.id)}
            aria-current={active === item.id ? "location" : undefined}
            className={cn(
              "block border-l-2 py-1.5 pl-3 text-[13px] leading-snug transition-colors",
              item.level === 3 && "pl-6",
              active === item.id ? "border-accent font-medium text-ink" : "border-line text-ink-mute hover:border-ink hover:text-ink",
            )}
          >
            {item.text}
          </a>
        </li>
      ))}
    </ol>
  );
}

export function TableOfContents({ items }: { items: TocItem[] }) {
  const active = useActiveHeading(items);
  if (items.length < 2) return null;

  return (
    <nav aria-label="On this page" className="hidden lg:block">
      <p className="eyebrow border-b border-ink pb-3 text-ink">In this story</p>
      <TocList items={items} active={active} />
    </nav>
  );
}

export function MobileTableOfContents({ items }: { items: TocItem[] }) {
  if (items.length < 2) return null;

  return (
    <details className="mt-7 border-y border-line py-2.5 lg:hidden">
      <summary className="cursor-pointer text-[13px] font-medium text-ink">In this story ({items.length})</summary>
      <TocList items={items} />
    </details>
  );
}
