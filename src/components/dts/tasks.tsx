import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, Panel, SignStatusPill, MarkSignButton, StageBadge } from "@/components/dts/ui";
import { useDts } from "@/lib/dts-store";
import { fmtDate, fmtDateTime, isLate } from "@/lib/dts-data";
import { cn } from "@/lib/utils";

export function TaskPage({ kind }: { kind: "paraf" | "ttd" }) {
  const { docs } = useDts();
  const [tab, setTab] = useState<"belum" | "selesai">("belum");
  const label = kind === "paraf" ? "Paraf" : "TTD";
  const all = docs
    .filter((d) => d.lifecycle !== "batal")
    .flatMap((d) => d[kind].map((s) => ({ s, d })));
  const rows = all.filter(({ s }) => s.status === tab);

  return (
    <div>
      <PageHeader eyebrow="Tugas" title={`Tugas ${label}`} />
      <div className="mb-5 inline-flex rounded-2xl bg-card p-1 shadow-card">
        {(["belum", "selesai"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={cn("h-10 rounded-xl px-5 text-sm font-semibold", tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>
            {t === "belum" ? "Belum" : "Selesai"} ({all.filter(({ s }) => s.status === t).length})
          </button>
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {rows.length === 0 && <Panel className="md:col-span-2 text-center text-sm text-muted-foreground">Tidak ada tugas {label.toLowerCase()} di sini.</Panel>}
        {rows.map(({ s, d }) => (
          <Panel key={s.id} className="p-4">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3">
              <div className="min-w-0">
                <Link to="/admin/dokumen/$id" params={{ id: d.id }} className="text-xs font-semibold text-primary-hover hover:underline">{d.nomor}</Link>
                <p className="truncate text-sm font-medium">{d.judul}</p>
              </div>
              <SignStatusPill s={s} />
            </div>
            <div className="mt-3 rounded-xl bg-muted p-3">
              <p className="font-semibold">{s.nama}</p>
              <p className="text-xs text-muted-foreground">{s.jabatan}</p>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <p className={cn("text-xs", isLate(d) ? "font-semibold text-destructive" : "text-muted-foreground")}>
                {s.waktu ? `Selesai ${fmtDateTime(s.waktu)}` : `Tenggat ${fmtDate(d.tenggat)}`}
              </p>
              {d.lifecycle === "aktif" ? <MarkSignButton doc={d} kind={kind} signer={s} /> : <StageBadge doc={d} />}
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
