"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAdminAuth } from "@/components/admin/auth-provider";
import { AdminPageHeader, EmptyBlock, ErrorBlock, LoadingBlock, SimplePager } from "@/components/admin/ui";
import { adminApi } from "@/lib/api/admin";
import { errorMessage } from "@/lib/api/client";
import { cn } from "@/lib/cn";
import type { NewsListParams, NewsStatus } from "@/types/api";
import { NewsBulkBar } from "./news-bulk-bar";
import { FLAG_FILTERS, NewsFilters, SORT_OPTIONS, STATUS_FILTERS, type NewsFilterValues } from "./news-filters";
import { NewsTable } from "./news-table";

const PAGE_SIZE = 20;

const statusParam = (value: string): NewsStatus | undefined =>
  STATUS_FILTERS.find((option) => option.value && option.value === value)?.value || undefined;

export function NewsList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { can } = useAdminAuth();

  const urlSearch = searchParams.get("q") ?? "";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const values: Omit<NewsFilterValues, "search"> = {
    status: statusParam(searchParams.get("status") ?? "") ?? "",
    category: searchParams.get("category") ?? "",
    sort: SORT_OPTIONS.find((option) => option.value === searchParams.get("sort"))?.value ?? "latest",
    flags: FLAG_FILTERS.filter((flag) => searchParams.get(flag.key) === "1").map((flag) => flag.key),
  };

  const [search, setSearch] = useState(urlSearch);
  const [syncedSearch, setSyncedSearch] = useState(urlSearch);
  const searchTimer = useRef<number | undefined>(undefined);

  // the URL changed from outside the input (clear filters, nav link): mirror it
  if (urlSearch !== syncedSearch) {
    setSyncedSearch(urlSearch);
    if (urlSearch !== search.trim()) setSearch(urlSearch);
  }

  // selection belongs to one exact result set and is dropped when the query changes
  const scope = searchParams.toString();
  const [selection, setSelection] = useState({ scope, ids: [] as string[] });
  const selected = selection.scope === scope ? selection.ids : [];
  const setSelected = (ids: string[]) => setSelection({ scope, ids });

  const updateUrl = useCallback(
    (patch: Record<string, string | null>) => {
      // read the live URL so a delayed search update never overwrites newer filters
      const next = new URLSearchParams(window.location.search);
      Object.entries(patch).forEach(([key, value]) => (value ? next.set(key, value) : next.delete(key)));
      if (!("page" in patch)) next.delete("page");
      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [router, pathname],
  );

  const onSearch = (value: string) => {
    setSearch(value);
    window.clearTimeout(searchTimer.current);
    searchTimer.current = window.setTimeout(() => updateUrl({ q: value.trim() || null }), 350);
  };

  useEffect(() => () => window.clearTimeout(searchTimer.current), []);

  const params: NewsListParams = {
    page,
    limit: PAGE_SIZE,
    sort: values.sort,
    search: urlSearch || undefined,
    category: values.category || undefined,
    status: statusParam(values.status),
    featured: values.flags.includes("featured") || undefined,
    trending: values.flags.includes("trending") || undefined,
    breaking: values.flags.includes("breaking") || undefined,
    editorsPick: values.flags.includes("editorsPick") || undefined,
  };

  const list = useQuery({
    queryKey: ["admin", "news", "list", params],
    queryFn: ({ signal }) => adminApi.listNews(params, signal),
    placeholderData: keepPreviousData,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["admin", "categories", "options"],
    queryFn: () => adminApi.categories(),
    staleTime: 5 * 60_000,
  });

  const filtered = Boolean(urlSearch || values.status || values.category || values.flags.length);

  return (
    <>
      <AdminPageHeader
        title="Articles"
        description="Write, schedule and curate every story on the site."
        actions={
          can("canPublish") && (
            <Link href="/admin/news/new" className="adm-btn-primary">
              <Plus className="h-3.5 w-3.5" aria-hidden="true" /> New article
            </Link>
          )
        }
      />

      <NewsFilters values={{ ...values, search }} categories={categories} onSearch={onSearch} onChange={updateUrl} />

      <section className="adm-card" aria-busy={list.isFetching}>
        {selected.length > 0 && <NewsBulkBar ids={selected} categories={categories} onDone={() => setSelected([])} />}

        {list.isPending ? (
          <LoadingBlock label="Loading articles…" />
        ) : list.error ? (
          <div className="p-4">
            <ErrorBlock message={errorMessage(list.error, "Could not load articles")} onRetry={() => list.refetch()} />
          </div>
        ) : !list.data.data.length ? (
          <EmptyBlock
            title={filtered ? "No matching articles" : "No articles yet"}
            message={filtered ? "Try a different search or clear some filters." : "Stories you write appear here."}
            action={
              filtered ? (
                <Link href={pathname} className="adm-btn">
                  Clear filters
                </Link>
              ) : (
                can("canPublish") && (
                  <Link href="/admin/news/new" className="adm-btn-primary">
                    New article
                  </Link>
                )
              )
            }
          />
        ) : (
          <>
            <div className={cn("transition-opacity", list.isPlaceholderData && "opacity-60")}>
              <NewsTable items={list.data.data} selected={selected} onSelectedChange={setSelected} />
            </div>
            <SimplePager
              page={list.data.pagination.page}
              pages={list.data.pagination.pages}
              total={list.data.pagination.total}
              onChange={(next) => updateUrl({ page: next > 1 ? String(next) : null })}
            />
          </>
        )}
      </section>
    </>
  );
}
