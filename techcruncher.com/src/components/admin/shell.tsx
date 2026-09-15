"use client";

import {
  FileSpreadsheet,
  FileText,
  FolderTree,
  Home,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Mail,
  Megaphone,
  Menu,
  Moon,
  Newspaper,
  Sun,
  Tags,
  Users,
  X,
} from "lucide-react";
import { LogoMark, Wordmark } from "@/components/site/logo";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { site } from "@/config/site";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/cn";
import { useAdminAuth } from "./auth-provider";
import { LoadingBlock } from "./ui";

const NAV = [
  {
    group: "Overview",
    items: [{ label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard }],
  },
  {
    group: "Content",
    items: [
      { label: "Articles", href: "/admin/news", icon: Newspaper },
      { label: "Categories", href: "/admin/categories", icon: FolderTree },
      { label: "Tags", href: "/admin/tags", icon: Tags },
      { label: "Media", href: "/admin/media", icon: ImageIcon },
      { label: "Import / export", href: "/admin/import", icon: FileSpreadsheet },
    ],
  },
  {
    group: "Site",
    items: [
      { label: "Homepage", href: "/admin/homepage", icon: Home },
      { label: "Advertising", href: "/admin/ads", icon: Megaphone },
    ],
  },
  {
    group: "Audience",
    items: [
      { label: "Messages", href: "/admin/contacts", icon: Mail },
      { label: "Subscribers", href: "/admin/subscribers", icon: Users },
    ],
  },
];

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin" className="flex-1 overflow-y-auto px-3 py-4">
      {NAV.map((section) => (
        <div key={section.group} className="mb-5">
          <p className="eyebrow mb-2 px-2">{section.group}</p>
          <ul className="space-y-px">
            {section.items.map(({ label, href, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-2.5 border-l-2 px-2 py-2 text-[13px] transition-colors",
                      active ? "border-accent bg-raise font-semibold text-ink" : "border-transparent text-ink-soft hover:bg-raise hover:text-ink",
                    )}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function Brand() {
  return (
    <Link href="/admin/dashboard" aria-label={`${site.name} admin`} className="flex items-center gap-2">
      <LogoMark className="h-5" />
      <Wordmark size="sm" />
      <span className="eyebrow ml-auto border border-line px-1 py-0.5">Admin</span>
    </Link>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { admin, ready, logout } = useAdminAuth();
  const { theme, toggle } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [drawer, setDrawer] = useState(false);

  useEffect(() => {
    if (ready && !admin) router.replace(`/admin/login?next=${encodeURIComponent(pathname)}`);
  }, [ready, admin, router, pathname]);

  if (!ready || !admin) return <LoadingBlock label="Checking your session…" />;

  return (
    <div className="flex min-h-screen bg-canvas">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-line bg-paper lg:flex">
        <div className="border-b-2 border-ink px-4 py-4">
          <Brand />
        </div>
        <Sidebar />
        <div className="border-t border-line p-3">
          <Link href="/" target="_blank" className="link-muted flex items-center gap-2 px-2 py-1.5">
            <FileText className="h-3.5 w-3.5" aria-hidden="true" /> View site
          </Link>
        </div>
      </aside>

      {drawer && (
        <div className="fixed inset-0 z-[80] lg:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-ink-950/50" onClick={() => setDrawer(false)} />
          <div className="absolute inset-y-0 left-0 flex w-72 flex-col bg-paper">
            <div className="flex items-center justify-between border-b-2 border-ink px-4 py-4">
              <Brand />
              <button type="button" aria-label="Close menu" onClick={() => setDrawer(false)}>
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <Sidebar onNavigate={() => setDrawer(false)} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-line bg-canvas/90 px-4 backdrop-blur-xl sm:px-6">
          <button type="button" aria-label="Open menu" onClick={() => setDrawer(true)} className="-ml-1 p-1 lg:hidden">
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
          <div className="ml-auto flex items-center gap-3">
            <button
              type="button"
              onClick={toggle}
              aria-label="Toggle theme"
              className="flex h-8 w-8 items-center justify-center text-ink-soft hover:bg-raise hover:text-ink"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
            </button>
            <div className="hidden text-right sm:block">
              <p className="text-[13px] font-medium leading-tight text-ink">{admin.name || admin.email}</p>
              <p className="eyebrow mt-1">{admin.role}</p>
            </div>
            <button type="button" onClick={logout} className="adm-btn adm-btn-sm">
              <LogOut className="h-3 w-3" aria-hidden="true" /> Sign out
            </button>
          </div>
        </header>
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
