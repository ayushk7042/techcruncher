import { cn } from "@/lib/cn";

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("skeleton", className)} />;
}

export function CardSkeleton({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex gap-3 py-3">
        <Skeleton className="h-14 w-16 shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-2.5 w-16" />
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-3/4" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      <Skeleton className="aspect-[4/3] w-full" />
      <Skeleton className="mt-3 h-2.5 w-16" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-2.5 w-24" />
    </div>
  );
}

export function ListSkeleton({ count = 4, compact = false }: { count?: number; compact?: boolean }) {
  const items = Array.from({ length: count }, (_, i) => <CardSkeleton key={i} compact={compact} />);
  return compact ? (
    <div className="divide-y divide-line">{items}</div>
  ) : (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{items}</div>
  );
}

export function PageSkeleton() {
  return (
    <div className="container space-y-8 py-14">
      <Skeleton className="h-12 w-80 max-w-full" />
      <Skeleton className="h-4 w-96 max-w-full" />
      <div className="grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-72" />
        ))}
      </div>
    </div>
  );
}
