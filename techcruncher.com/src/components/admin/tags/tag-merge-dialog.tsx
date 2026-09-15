"use client";

import { useState } from "react";
import type { Tag } from "@/types/api";
import { ConfirmDialog, SelectField } from "../ui";

export function TagMergeDialog({
  tags,
  busy,
  onMerge,
  onClose,
}: {
  tags: Tag[];
  busy: boolean;
  onMerge: (sourceIds: string[], targetId: string) => void;
  onClose: () => void;
}) {
  const [targetId, setTargetId] = useState(() => [...tags].sort((a, b) => b.usageCount - a.usageCount)[0]?._id ?? "");
  const sources = tags.filter((tag) => tag._id !== targetId);

  return (
    <ConfirmDialog
      open
      title="Merge tags"
      confirmLabel={`Merge ${sources.length}`}
      busy={busy}
      message={
        <div className="space-y-4">
          <SelectField
            label="Keep this tag"
            value={targetId}
            options={tags.map((tag) => ({ value: tag._id, label: `${tag.name} (${tag.usageCount})` }))}
            onChange={(event) => setTargetId(event.target.value)}
          />
          <p>
            Articles tagged{" "}
            {sources.map((tag, index) => (
              <span key={tag._id}>
                {index > 0 && ", "}
                <strong className="text-ink">{tag.name}</strong>
              </span>
            ))}{" "}
            move to the kept tag, then those tags are deleted.
          </p>
        </div>
      }
      onConfirm={() => targetId && sources.length && onMerge(sources.map((tag) => tag._id), targetId)}
      onClose={onClose}
    />
  );
}
