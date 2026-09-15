"use client";

import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { StatusBadge, TableScroll } from "@/components/admin/ui";
import { compactNumber, formatDate, formatDateTime } from "@/lib/format";
import { categoryOf, flagsOf, imageOf, newsHref, subCategoryOf } from "@/lib/news";
import type { News } from "@/types/api";
import { NewsRowActions } from "./news-row-actions";

function DateCell({ news }: { news: News }) {
  if (news.status === "scheduled" && news.scheduledAt) {
    return (
      <>
        <span className="eyebrow-accent block">Scheduled</span>
        <span className="mt-1 block">{formatDateTime(news.scheduledAt)}</span>
      </>
    );
  }
  return <>{formatDate(news.publishedDate) || "—"}</>;
}

export function NewsTable({
  items,
  selected,
  onSelectedChange,
}: {
  items: News[];
  selected: string[];
  onSelectedChange: (ids: string[]) => void;
}) {
  const allSelected = items.length > 0 && items.every((news) => selected.includes(news._id));

  const toggle = (id: string) =>
    onSelectedChange(selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id]);

  return (
    <TableScroll>
      <table className="adm-table">
        <thead>
          <tr>
            <th className="w-8">
              <input
                type="checkbox"
                aria-label="Select all articles on this page"
                checked={allSelected}
                onChange={() => onSelectedChange(allSelected ? [] : items.map((news) => news._id))}
              />
            </th>
            <th className="w-[76px]">
              <span className="sr-only">Image</span>
            </th>
            <th>Title</th>
            <th>Category</th>
            <th>Status</th>
            <th>Flags</th>
            <th className="text-right">Views</th>
            <th>Published</th>
            <th>
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((news) => {
            const image = imageOf(news);
            const category = categoryOf(news);
            const subCategory = subCategoryOf(news);
            const flags = flagsOf(news);

            return (
              <tr key={news._id}>
                <td>
                  <input
                    type="checkbox"
                    aria-label={`Select ${news.title}`}
                    checked={selected.includes(news._id)}
                    onChange={() => toggle(news._id)}
                  />
                </td>
                <td>
                  {image?.url ? (
                    <img src={image.thumbnailUrl || image.url} alt="" loading="lazy" className="h-10 w-16 bg-raise object-cover" />
                  ) : (
                    <div className="h-10 w-16 bg-raise" />
                  )}
                </td>
                <td className="min-w-[260px] max-w-[420px]">
                  <Link href={`/admin/news/${news._id}`} className="clamp-2 font-semibold leading-snug text-ink hover:text-accent">
                    {news.title}
                  </Link>
                  <a
                    href={newsHref(news)}
                    target="_blank"
                    rel="noreferrer"
                    className="meta mt-1.5 inline-flex max-w-full items-center gap-1 hover:text-accent"
                  >
                    <span className="truncate">/{news.slug}</span>
                    <ExternalLink className="h-3 w-3 shrink-0" aria-hidden="true" />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </td>
                <td className="whitespace-nowrap text-ink-soft">
                  {category?.name || "—"}
                  {subCategory && <span className="meta mt-1 block">{subCategory.name}</span>}
                </td>
                <td>
                  <StatusBadge status={news.status} />
                </td>
                <td>
                  {flags.length ? (
                    <div className="flex max-w-[180px] flex-wrap gap-1">
                      {flags.map((flag) => (
                        <span key={flag} className="adm-badge">
                          {flag}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="meta">—</span>
                  )}
                </td>
                <td className="meta whitespace-nowrap text-right">{compactNumber(news.views)}</td>
                <td className="meta whitespace-nowrap">
                  <DateCell news={news} />
                </td>
                <td>
                  <NewsRowActions news={news} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </TableScroll>
  );
}
