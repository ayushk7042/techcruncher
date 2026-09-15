"use client";

import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import type { Category } from "@/types/api";
import { errorMessage } from "@/lib/api/client";
import { useAdminAuth } from "../auth-provider";
import { AdminPageHeader, Card, EmptyBlock, ErrorBlock, LoadingBlock } from "../ui";
import { CategoryDeleteDialog } from "./category-delete-dialog";
import { CategoryFormModal } from "./category-form-modal";
import { categoryListQuery } from "./category-query";
import { CategoryTable } from "./category-table";
import { flattenTree } from "./category-tree";

type Editing = { mode: "create" } | { mode: "edit"; category: Category };

export function CategoryManager() {
  const { can } = useAdminAuth();
  const { data, isPending, error, refetch } = useQuery(categoryListQuery);
  const [editing, setEditing] = useState<Editing | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);

  const categories = useMemo(() => data ?? [], [data]);
  const rows = useMemo(() => flattenTree(categories), [categories]);
  const rootCount = rows.filter((row) => row.depth === 0).length;

  const createButton = can("canPublish") && (
    <button type="button" className="adm-btn-primary" onClick={() => setEditing({ mode: "create" })}>
      <Plus className="h-3.5 w-3.5" aria-hidden="true" />
      New category
    </button>
  );

  return (
    <>
      <AdminPageHeader
        title="Categories"
        description="Sections of the site. Sub-categories sit under their parent; order controls move a category among its siblings."
        actions={createButton}
      />

      {error ? (
        <ErrorBlock message={errorMessage(error, "Could not load categories")} onRetry={() => refetch()} />
      ) : (
        <Card
          title={isPending ? "All categories" : `${categories.length} categories / ${rootCount} top level`}
          bodyClassName="p-0"
        >
          {isPending ? (
            <LoadingBlock />
          ) : rows.length ? (
            <CategoryTable
              rows={rows}
              onEdit={(category) => setEditing({ mode: "edit", category })}
              onDelete={setDeleting}
            />
          ) : (
            <EmptyBlock title="No categories" message="Create the first section of the site." action={createButton} />
          )}
        </Card>
      )}

      {editing && (
        <CategoryFormModal
          key={editing.mode === "edit" ? editing.category._id : "new"}
          category={editing.mode === "edit" ? editing.category : undefined}
          categories={categories}
          onClose={() => setEditing(null)}
        />
      )}

      {deleting && (
        <CategoryDeleteDialog key={deleting._id} category={deleting} categories={categories} onClose={() => setDeleting(null)} />
      )}
    </>
  );
}
