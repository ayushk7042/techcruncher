"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import type { Homepage } from "@/types/api";
import { adminApi } from "@/lib/api/admin";
import { errorMessage } from "@/lib/api/client";
import { useAdminAuth } from "../auth-provider";
import { useToast } from "../toast";
import { Card, Spinner } from "../ui";
import { CategorySectionsEditor } from "./category-sections-editor";
import { GalleryEditor } from "./gallery-editor";
import { NewsPicker } from "./news-picker";
import { RailCard, RAILS } from "./rail-card";
import { MAX_SUB_TRENDING, serializeDraft, toDraft, toPayload, type HomepageDraft } from "./state";

export function HomepageEditor({ initial }: { initial: Homepage }) {
  const { can } = useAdminAuth();
  const readOnly = !can("canPublish");
  const toast = useToast();
  const queryClient = useQueryClient();

  const [saved, setSaved] = useState(() => toDraft(initial));
  const [draft, setDraft] = useState(saved);
  const savedSnapshot = useMemo(() => serializeDraft(saved), [saved]);
  const dirty = serializeDraft(draft) !== savedSnapshot;

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const save = useMutation({
    mutationFn: (next: HomepageDraft) => adminApi.saveHomepage(toPayload(next)),
    onSuccess: (response) => {
      // The server drops invalid refs and empty tiles, so its answer is the new baseline.
      const next = toDraft(response);
      setSaved(next);
      setDraft(next);
      queryClient.invalidateQueries({ queryKey: ["admin", "homepage"] });
      toast.success("Homepage saved");
    },
    onError: (error) => toast.error(errorMessage(error, "Could not save the homepage")),
  });

  const update = <K extends keyof HomepageDraft>(key: K, value: HomepageDraft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));

  return (
    <>
      <div className="space-y-10">
        <Card title="Lead stories">
          <div className="grid gap-6 lg:grid-cols-2">
            <NewsPicker
              label="Main story"
              hint="The single top trending story."
              max={1}
              value={draft.mainTrending ? [draft.mainTrending] : []}
              onChange={(list) => update("mainTrending", list[0] ?? null)}
              disabled={readOnly}
            />
            <NewsPicker
              label="Secondary stories"
              hint="Stories that sit under the main story, in this order."
              max={MAX_SUB_TRENDING}
              value={draft.subTrending}
              onChange={(list) => update("subTrending", list)}
              disabled={readOnly}
            />
          </div>
        </Card>

        <section>
          <SectionHeading title="Rails" note="Auto follows the live feed; manual pins the stories you choose." />
          <div className="grid gap-6 lg:grid-cols-2">
            {RAILS.map((rail) => (
              <RailCard
                key={rail.key}
                railKey={rail.key}
                label={rail.label}
                drives={rail.drives}
                value={draft.sections[rail.key]}
                onChange={(value) => update("sections", { ...draft.sections, [rail.key]: value })}
                disabled={readOnly}
              />
            ))}
          </div>
        </section>

        <Card title="Category sections">
          <CategorySectionsEditor
            value={draft.categorySections}
            onChange={(value) => update("categorySections", value)}
            disabled={readOnly}
          />
        </Card>

        <Card title="Gallery block">
          <GalleryEditor value={draft.gallery} onChange={(value) => update("gallery", value)} disabled={readOnly} />
        </Card>
      </div>

      <div className="sticky bottom-0 z-20 mt-10 flex flex-wrap items-center justify-between gap-3 border-t-2 border-ink bg-paper px-4 py-3">
        <p className="meta" role="status">
          {readOnly ? (
            "Read only: publishing permission is required to change the homepage."
          ) : dirty ? (
            <span className="text-accent">Unsaved changes</span>
          ) : (
            "All changes saved"
          )}
        </p>
        {!readOnly && (
          <div className="flex gap-2">
            <button type="button" className="adm-btn" disabled={!dirty || save.isPending} onClick={() => setDraft(saved)}>
              Discard
            </button>
            <button
              type="button"
              className="adm-btn-primary"
              disabled={!dirty || save.isPending}
              onClick={() => save.mutate(draft)}
            >
              {save.isPending && <Spinner className="h-3.5 w-3.5" />}
              Save homepage
            </button>
          </div>
        )}
      </div>
    </>
  );
}

function SectionHeading({ title, note }: { title: string; note: string }) {
  return (
    <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2 border-b-2 border-ink pb-2">
      <h2 className="headline text-[20px] uppercase">{title}</h2>
      <p className="meta">{note}</p>
    </div>
  );
}
