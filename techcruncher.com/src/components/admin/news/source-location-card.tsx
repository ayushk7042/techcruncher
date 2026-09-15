"use client";

import { useQuery } from "@tanstack/react-query";
import { TextAreaField, TextField } from "@/components/admin/ui";
import { adminApi } from "@/lib/api/admin";
import { CollapsibleCard } from "./collapsible-card";
import type { SectionProps } from "./news-form-state";

function Suggestions({ id, values = [] }: { id: string; values?: string[] }) {
  return (
    <datalist id={id}>
      {values.map((value) => (
        <option key={value} value={value} />
      ))}
    </datalist>
  );
}

export function SourceLocationCard({ form, set, currentReadTime }: SectionProps & { currentReadTime?: number }) {
  const { data: facets } = useQuery({
    queryKey: ["admin", "news", "facets"],
    queryFn: adminApi.facets,
    staleTime: 5 * 60_000,
  });

  return (
    <CollapsibleCard title="Source, location & read time">
      <div className="grid gap-3 sm:grid-cols-2">
        <TextField label="Source name" value={form.sourceName} onChange={(event) => set("sourceName", event.target.value)} />
        <TextField label="Source URL" type="url" value={form.sourceUrl} onChange={(event) => set("sourceUrl", event.target.value)} />
      </div>
      <TextAreaField
        label="Source links"
        rows={3}
        value={form.sourceLinks}
        onChange={(event) => set("sourceLinks", event.target.value)}
        hint="One URL per line."
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <TextField label="Language" list="news-languages" value={form.language} onChange={(event) => set("language", event.target.value)} />
        <TextField label="Country" list="news-countries" value={form.country} onChange={(event) => set("country", event.target.value)} />
        <TextField label="Region" list="news-regions" value={form.region} onChange={(event) => set("region", event.target.value)} />
        <TextField
          label="Destination"
          list="news-destinations"
          value={form.destination}
          onChange={(event) => set("destination", event.target.value)}
        />
      </div>
      <Suggestions id="news-languages" values={facets?.languages} />
      <Suggestions id="news-countries" values={facets?.countries} />
      <Suggestions id="news-regions" values={facets?.regions} />
      <Suggestions id="news-destinations" values={facets?.destinations} />

      <TextField
        label="Read time override (minutes)"
        type="number"
        min={0}
        className="sm:w-1/2"
        value={form.readTime}
        onChange={(event) => set("readTime", event.target.value)}
        hint={`Leave empty to calculate from the body${currentReadTime ? ` (currently ${currentReadTime} min)` : ""}.`}
      />
    </CollapsibleCard>
  );
}
