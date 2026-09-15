import type { Device } from "@/types/api";

export const ADS_KEY = ["admin", "ads"] as const;

export const DEVICES: { value: Device; label: string }[] = [
  { value: "desktop", label: "Desktop" },
  { value: "tablet", label: "Tablet" },
  { value: "mobile", label: "Mobile" },
];
