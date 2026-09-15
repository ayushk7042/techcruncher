import { ArrowRight, FilePlus2, FileSpreadsheet, Home } from "lucide-react";
import Link from "next/link";
import { Card } from "../ui";

const ACTIONS = [
  { label: "New article", note: "Open a blank draft", href: "/admin/news/new", icon: FilePlus2 },
  { label: "Import sheet", note: "Bulk create or update from .xlsx", href: "/admin/import", icon: FileSpreadsheet },
  { label: "Manage homepage", note: "Curate rails and lead stories", href: "/admin/homepage", icon: Home },
];

export function QuickActions() {
  return (
    <Card title="Quick actions" bodyClassName="p-0">
      <ul>
        {ACTIONS.map(({ label, note, href, icon: Icon }) => (
          <li key={href} className="border-b border-line last:border-b-0">
            <Link href={href} className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-raise/60">
              <Icon className="h-4 w-4 shrink-0 text-ink-mute group-hover:text-accent" aria-hidden="true" />
              <span className="min-w-0 flex-1">
                <span className="block text-[13.5px] font-medium text-ink">{label}</span>
                <span className="meta mt-1 block">{note}</span>
              </span>
              <ArrowRight className="h-3.5 w-3.5 text-ink-mute transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}
