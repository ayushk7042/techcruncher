"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { adminApi } from "@/lib/api/admin";

/** Every category (active or not) as select options; sub-categories are marked with a dash. */
export function useCategoryOptions() {
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ["admin", "categories", "list"],
    queryFn: adminApi.categories,
  });

  const options = useMemo(
    () => (data ?? []).map((category) => ({ label: category.parent ? `— ${category.name}` : category.name, value: category._id })),
    [data],
  );

  return { options, isPending, isError, error, refetch };
}
