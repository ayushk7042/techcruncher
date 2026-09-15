"use client";

import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin";
import { errorMessage } from "@/lib/api/client";
import { ErrorBlock, LoadingBlock } from "../ui";
import { HomepageEditor } from "./homepage-editor";

export function HomepageManager() {
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ["admin", "homepage"],
    queryFn: adminApi.homepage,
  });

  if (isPending) return <LoadingBlock label="Loading homepage…" />;
  if (isError) return <ErrorBlock message={errorMessage(error, "Could not load the homepage")} onRetry={() => refetch()} />;

  return <HomepageEditor initial={data} />;
}
