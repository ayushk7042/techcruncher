const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const longDateFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
});

const compactFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const toDate = (value?: string | number | Date | null): Date | null => {
  if (value === undefined || value === null || value === "") return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

/** "Sep 11, 2026" */
export const formatDate = (value?: string | Date | null) => {
  const date = toDate(value);
  return date ? dateFormatter.format(date) : "";
};

/** "Sep 11, 2026, 3:04 PM" */
export const formatDateTime = (value?: string | Date | null) => {
  const date = toDate(value);
  return date ? dateTimeFormatter.format(date) : "";
};

/** "Thursday, September 11, 2026" */
export const formatLongDate = (value: Date) => longDateFormatter.format(value);

/** 12345 -> "12.3K" */
export const compactNumber = (value?: number) => compactFormatter.format(Math.max(0, value || 0));

export const readTimeLabel = (minutes?: number) => `${Math.max(1, Math.round(minutes || 1))} min read`;

/** 1 -> "01" */
export const pad2 = (value: number) => String(value).padStart(2, "0");

/** yyyy-mm-dd for <input type="date"> */
export const toDateInput = (value?: string | null) => {
  const date = toDate(value);
  return date ? date.toISOString().slice(0, 10) : "";
};

/** yyyy-mm-ddThh:mm in local time for <input type="datetime-local"> */
export const toDateTimeInput = (value?: string | null) => {
  const date = toDate(value);
  if (!date) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
};

/** Day buckets for the Latest feed. */
export function dayGroupLabel(value?: string | null, now = new Date()): string {
  const date = toDate(value);
  if (!date) return "Undated";

  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((startOfDay(now) - startOfDay(date)) / 86_400_000);

  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return "This week";
  return formatDate(date);
}

export const formatBytes = (bytes?: number) => {
  if (!bytes) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit += 1;
  }
  return `${size.toFixed(size < 10 && unit > 0 ? 1 : 0)} ${units[unit]}`;
};
