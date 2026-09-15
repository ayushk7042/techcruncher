"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";
import { AD_POSITIONS, type Advertisement } from "@/types/api";
import { adminApi } from "@/lib/api/admin";
import { errorMessage } from "@/lib/api/client";
import { useAdminAuth } from "../auth-provider";
import { useToast } from "../toast";
import { AdminPageHeader, ConfirmDialog, EmptyBlock, ErrorBlock, LoadingBlock, Spinner } from "../ui";
import { AdFormModal } from "./ad-form-modal";
import { ADS_KEY } from "./ad-query";
import { AdTable } from "./ad-table";

type Editing = { mode: "create" } | { mode: "edit"; ad: Advertisement };

export function AdManager() {
  const { can } = useAdminAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [position, setPosition] = useState("all");
  const [status, setStatus] = useState("all");
  const [editing, setEditing] = useState<Editing | null>(null);
  const [deleting, setDeleting] = useState<Advertisement | null>(null);

  const { data, isPending, isFetching, error, refetch } = useQuery({
    queryKey: [...ADS_KEY, { position, status }],
    queryFn: () => adminApi.ads({ position, status }),
  });

  const setStatusMutation = useMutation({
    mutationFn: (ad: Advertisement) => adminApi.updateAd(ad._id, { status: ad.status === "active" ? "paused" : "active" }),
    onSuccess: ({ data: ad }) => {
      queryClient.invalidateQueries({ queryKey: ADS_KEY });
      toast.success(`${ad.name} ${ad.status === "active" ? "activated" : "paused"}`);
    },
    onError: (err) => toast.error(errorMessage(err, "Could not change status")),
  });

  const remove = useMutation({
    mutationFn: (ad: Advertisement) => adminApi.deleteAd(ad._id),
    onSuccess: (_, ad) => {
      queryClient.invalidateQueries({ queryKey: ADS_KEY });
      setDeleting(null);
      toast.success(`Deleted ${ad.name}`);
    },
    onError: (err) => toast.error(errorMessage(err, "Could not delete ad")),
  });

  const ads = data?.data ?? [];
  const filtered = position !== "all" || status !== "all";

  const createButton = can("canPublish") && (
    <button type="button" className="adm-btn-primary" onClick={() => setEditing({ mode: "create" })}>
      <Plus className="h-3.5 w-3.5" aria-hidden="true" />
      New ad
    </button>
  );

  return (
    <>
      <AdminPageHeader
        title="Advertising"
        description="Banners and ad-network code for each slot on the public site. Active ads inside their schedule are served by priority."
        actions={createButton}
      />

      <section className="adm-card">
        <div className="adm-card-head flex-wrap justify-start">
          <label className="flex items-center gap-2">
            <span className="eyebrow">Position</span>
            <select className="adm-select w-auto font-mono text-[12px]" value={position} onChange={(e) => setPosition(e.target.value)}>
              <option value="all">All positions</option>
              {AD_POSITIONS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2">
            <span className="eyebrow">Status</span>
            <select className="adm-select w-auto" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
            </select>
          </label>
          {isFetching && !isPending && <Spinner className="h-3.5 w-3.5 text-ink-mute" />}
          {!isPending && <span className="meta ml-auto">{ads.length} ad(s)</span>}
        </div>

        {error ? (
          <div className="p-4">
            <ErrorBlock message={errorMessage(error, "Could not load ads")} onRetry={() => refetch()} />
          </div>
        ) : isPending ? (
          <LoadingBlock />
        ) : !ads.length ? (
          <EmptyBlock
            title={filtered ? "No matches" : "No ads yet"}
            message={filtered ? "No ads match these filters." : "Create an image banner or paste ad-network code."}
            action={filtered ? undefined : createButton}
          />
        ) : (
          <AdTable
            ads={ads}
            pendingStatusId={setStatusMutation.isPending ? setStatusMutation.variables?._id : undefined}
            onEdit={(ad) => setEditing({ mode: "edit", ad })}
            onToggleStatus={(ad) => setStatusMutation.mutate(ad)}
            onDelete={setDeleting}
          />
        )}
      </section>

      {editing && (
        <AdFormModal
          key={editing.mode === "edit" ? editing.ad._id : "new"}
          ad={editing.mode === "edit" ? editing.ad : undefined}
          onClose={() => setEditing(null)}
        />
      )}

      <ConfirmDialog
        open={deleting !== null}
        danger
        title="Delete ad"
        confirmLabel="Delete"
        busy={remove.isPending}
        message={
          <>
            Delete <strong className="text-ink">{deleting?.name}</strong>? Its impression and click history is lost.
          </>
        }
        onConfirm={() => deleting && remove.mutate(deleting)}
        onClose={() => setDeleting(null)}
      />
    </>
  );
}
