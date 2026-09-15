import { ChevronDown } from "lucide-react";

export function CollapsibleCard({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details className="adm-card group" open={defaultOpen}>
      <summary className="adm-card-head cursor-pointer select-none list-none border-b-0 group-open:border-b [&::-webkit-details-marker]:hidden">
        <h2 className="eyebrow text-ink">{title}</h2>
        <ChevronDown className="h-4 w-4 text-ink-mute transition-transform group-open:rotate-180" aria-hidden="true" />
      </summary>
      <div className="space-y-4 p-4">{children}</div>
    </details>
  );
}
