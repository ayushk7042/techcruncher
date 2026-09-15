"use client";

import { Code2, Monitor, Pause, Pencil, Play, Smartphone, Tablet, Trash2 } from "lucide-react";
import type { Advertisement, Device } from "@/types/api";
import { compactNumber, formatDateTime } from "@/lib/format";
import { useAdminAuth } from "../auth-provider";
import { Spinner, StatusBadge, TableScroll } from "../ui";
import { DEVICES } from "./ad-query";

const DEVICE_ICON: Record<Device, typeof Monitor> = { desktop: Monitor, tablet: Tablet, mobile: Smartphone };

const ctr = (ad: Advertisement) => (ad.impressions ? `${(((ad.clicks ?? 0) / ad.impressions) * 100).toFixed(2)}%` : "—");

export function AdTable({
  ads,
  pendingStatusId,
  onEdit,
  onToggleStatus,
  onDelete,
}: {
  ads: Advertisement[];
  /** Ad whose pause/activate request is in flight. */
  pendingStatusId?: string;
  onEdit: (ad: Advertisement) => void;
  onToggleStatus: (ad: Advertisement) => void;
  onDelete: (ad: Advertisement) => void;
}) {
  const { can } = useAdminAuth();
  const canPublish = can("canPublish");
  const canDelete = can("canDelete");

  return (
    <TableScroll>
      <table className="adm-table">
        <thead>
          <tr>
            <th className="w-24">Creative</th>
            <th>Name</th>
            <th>Position</th>
            <th>Type</th>
            <th>Devices</th>
            <th>Schedule</th>
            <th className="text-right">Priority</th>
            <th className="text-right">Impr.</th>
            <th className="text-right">Clicks</th>
            <th className="text-right">CTR</th>
            <th>Status</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {ads.map((ad) => {
            const image = ad.image?.thumbnailUrl || ad.image?.url;
            const devices = new Set(ad.devices);
            return (
              <tr key={ad._id}>
                <td>
                  {ad.type === "script" ? (
                    <span className="chip flex h-12 w-20 items-center justify-center border border-line text-ink-soft">
                      <Code2 className="h-3 w-3" aria-hidden="true" />
                      Script
                    </span>
                  ) : image ? (
                    <img src={image} alt="" className="h-12 w-20 border border-line bg-raise object-contain" />
                  ) : (
                    <span className="meta flex h-12 w-20 items-center justify-center border border-dashed border-line">No image</span>
                  )}
                </td>
                <td>
                  <p className="font-medium text-ink">{ad.name}</p>
                  {ad.categories && ad.categories.length > 0 && (
                    <p className="meta mt-1">
                      {ad.categories.map((c) => (typeof c === "string" ? c : c.name)).join(", ")}
                    </p>
                  )}
                </td>
                <td className="whitespace-nowrap font-mono text-[12px]">{ad.position}</td>
                <td className="whitespace-nowrap">
                  <span className="adm-badge">{ad.type === "script" ? "script" : ad.display}</span>
                  {ad.type === "image" && ad.maxHeight ? <p className="meta mt-1">max {ad.maxHeight}px</p> : null}
                </td>
                <td>
                  <div className="flex gap-1.5">
                    {DEVICES.map(({ value, label }) => {
                      const Icon = DEVICE_ICON[value];
                      const on = devices.has(value);
                      return (
                        <span key={value} title={`${label}: ${on ? "on" : "off"}`} className={on ? "text-ink" : "text-ink-mute/40"}>
                          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                          <span className="sr-only">
                            {label} {on ? "on" : "off"}
                          </span>
                        </span>
                      );
                    })}
                  </div>
                </td>
                <td className="whitespace-nowrap text-[12px] text-ink-soft">
                  {ad.startsAt || ad.endsAt ? (
                    <>
                      <p>{ad.startsAt ? formatDateTime(ad.startsAt) : "Now"}</p>
                      <p className="meta mt-1">→ {ad.endsAt ? formatDateTime(ad.endsAt) : "No end"}</p>
                    </>
                  ) : (
                    <span className="meta">Always</span>
                  )}
                </td>
                <td className="text-right font-mono text-[12px] tabular-nums">{ad.priority}</td>
                <td className="text-right font-mono text-[12px] tabular-nums">{compactNumber(ad.impressions)}</td>
                <td className="text-right font-mono text-[12px] tabular-nums">{compactNumber(ad.clicks)}</td>
                <td className="text-right font-mono text-[12px] tabular-nums">{ctr(ad)}</td>
                <td>
                  <StatusBadge status={ad.status} />
                </td>
                <td>
                  <div className="flex justify-end gap-1">
                    {canPublish && (
                      <>
                        <button
                          type="button"
                          className="adm-btn adm-btn-sm"
                          disabled={pendingStatusId === ad._id}
                          aria-label={ad.status === "active" ? `Pause ${ad.name}` : `Activate ${ad.name}`}
                          title={ad.status === "active" ? "Pause" : "Activate"}
                          onClick={() => onToggleStatus(ad)}
                        >
                          {pendingStatusId === ad._id ? (
                            <Spinner className="h-3 w-3" />
                          ) : ad.status === "active" ? (
                            <Pause className="h-3 w-3" aria-hidden="true" />
                          ) : (
                            <Play className="h-3 w-3" aria-hidden="true" />
                          )}
                        </button>
                        <button type="button" className="adm-btn adm-btn-sm" onClick={() => onEdit(ad)}>
                          <Pencil className="h-3 w-3" aria-hidden="true" />
                          Edit
                        </button>
                      </>
                    )}
                    {canDelete && (
                      <button
                        type="button"
                        className="adm-btn adm-btn-sm hover:border-accent hover:text-accent"
                        aria-label={`Delete ${ad.name}`}
                        onClick={() => onDelete(ad)}
                      >
                        <Trash2 className="h-3 w-3" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </TableScroll>
  );
}
