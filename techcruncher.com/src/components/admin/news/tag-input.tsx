"use client";

import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useId, useState } from "react";
import { useDebounced } from "@/hooks/use-debounced";
import { adminApi } from "@/lib/api/admin";

/** Chip input for tag names. Unknown names are created by the API on save. */
export function TagInput({ id, value, onChange }: { id?: string; value: string[]; onChange: (tags: string[]) => void }) {
  const listId = useId();
  const [draft, setDraft] = useState("");
  const term = useDebounced(draft.trim(), 250);

  const { data } = useQuery({
    queryKey: ["admin", "tags", "suggest", term],
    queryFn: () => adminApi.tags({ search: term, limit: 8 }),
    enabled: term.length > 1,
    staleTime: 60_000,
  });

  const add = (raw: string) => {
    const next = [...value];
    raw
      .split(",")
      .map((name) => name.trim())
      .filter(Boolean)
      .forEach((name) => {
        if (!next.some((tag) => tag.toLowerCase() === name.toLowerCase())) next.push(name);
      });
    if (next.length !== value.length) onChange(next);
    setDraft("");
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      // Enter would otherwise submit the article form
      event.preventDefault();
      add(draft);
    } else if (event.key === "Backspace" && !draft && value.length) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div>
      <div className="flex min-h-9 flex-wrap items-center gap-1.5 border border-line bg-paper px-1.5 py-1 transition-colors focus-within:border-ink">
        {value.map((tag) => (
          <span key={tag} className="adm-badge gap-1 text-ink">
            {tag}
            <button
              type="button"
              aria-label={`Remove tag ${tag}`}
              onClick={() => onChange(value.filter((item) => item !== tag))}
              className="text-ink-mute hover:text-accent"
            >
              <X className="h-3 w-3" aria-hidden="true" />
            </button>
          </span>
        ))}
        <input
          id={id}
          list={listId}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => draft.trim() && add(draft)}
          placeholder={value.length ? "" : "Type a tag and press Enter"}
          className="h-7 min-w-[120px] flex-1 bg-transparent px-1 text-[13px] text-ink outline-none placeholder:text-ink-mute"
        />
      </div>
      <datalist id={listId}>
        {data?.data.map((tag) => (
          <option key={tag._id} value={tag.name} />
        ))}
      </datalist>
    </div>
  );
}
