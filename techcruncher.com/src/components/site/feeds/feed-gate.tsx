import { EmptyState, ErrorState } from "@/components/site/states";
import { cn } from "@/lib/cn";

export type FeedState = "loading" | "error" | "empty" | "ready";

export function feedState(query: { isPending: boolean; isError: boolean; data: unknown }, isEmpty: boolean): FeedState {
  if (query.isPending) return "loading";
  if (query.isError && !query.data) return "error";
  return isEmpty ? "empty" : "ready";
}

interface FeedGateProps {
  state: FeedState;
  skeleton: React.ReactNode;
  onRetry: () => void;
  /** Dims the content while a new topic loads behind the previous result. */
  dimmed?: boolean;
  emptyTitle?: string;
  emptyMessage?: string;
  children: () => React.ReactNode;
}

export function FeedGate({ state, skeleton, onRetry, dimmed = false, emptyTitle, emptyMessage, children }: FeedGateProps) {
  if (state === "loading") return <>{skeleton}</>;
  if (state === "error") return <ErrorState onRetry={onRetry} />;
  if (state === "empty") return <EmptyState title={emptyTitle} message={emptyMessage} />;
  return <div className={cn("transition-opacity", dimmed && "opacity-50")}>{children()}</div>;
}
