import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Inbox, Undo2, MapPin } from "lucide-react";
import { PageHeader, Panel, VoidButton } from "@/components/dts/ui";
import { useDts } from "@/lib/dts-store";
import { fmtDateTime } from "@/lib/dts-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/penerimaan")({
  head: () => ({
    meta: [
      { title: "Penerimaan — Document Tracking System" },
      { name: "description", content: "Riwayat semua konfirmasi penerimaan dokumen dan aksi void." },
      { property: "og:title", content: "Penerimaan — Document Tracking System" },
      { property: "og:description", content: "Riwayat semua konfirmasi penerimaan dokumen dan aksi void." },
    ],
  }),
  component: Receipts,
});

function Receipts() {
  const { docs } = useDts();
  const [f, setF] = useState<"semua" | "valid" | "void">("semua");
  const all = docs
    .flatMap((d) => d.penerimaan.map((r) => ({ r, d })))
    .sort((a, b) => b.r.waktu.localeCompare(a.r.waktu))
    .filter(({ r }) => (f === "semua" ? true : f === "void" ? !!r.void : !r.void));

  return (
    <div>
      <PageHeader eyebrow="Riwayat" title="Penerimaan" />
      <div className="mb-5 inline-flex rounded-2xl bg-card p-1 shadow-card">
        {(["semua", "valid", "void"] as const).map((t) => (
          <button key={t} onClick={() => setF(t)} className={cn("h-10 rounded-xl px-4 text-sm font-semibold capitalize", f === t ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>{t}</button>
        ))}
      </div>
      <div className="space-y-3">
        {all.length === 0 && <Panel className="text-center text-sm text-muted-foreground">Tidak ada data.</Panel>}
        {all.map(({ r, d }) => (
          <Panel key={r.id} className={cn("p-4", r.void && "border-destructive/30 bg-destructive-soft")}>
            <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3">
              <div className={cn("grid size-11 place-items-center rounded-2xl", r.void ? "bg-card text-destructive" : r.jenis === "dikembalikan" ? "bg-success-soft text-success" : "bg-primary-soft text-primary")}>
                {r.jenis === "dikembalikan" ? <Undo2 className="size-5" /> : <Inbox className="size-5" />}
              </div>
              <div className={cn("min-w-0", r.void && "text-destructive line-through decoration-2")}>
                <Link to="/admin/dokumen/$id" params={{ id: d.id }} className="text-xs font-semibold text-primary-hover hover:underline">{d.nomor}</Link>
                <p className="truncate text-sm font-medium">{d.judul}</p>
                <p className="mt-1 text-sm"><b>{r.nama}</b> · {r.jenis === "dikembalikan" ? "Dikembalikan ke Tim RPA" : "Diterima"}</p>
                <p className="flex items-center gap-1 text-xs opacity-80"><MapPin className="size-3 shrink-0" />{r.unit}, {r.lokasi} · {fmtDateTime(r.waktu)}</p>
              </div>
              {r.void ? (
                <span className="rounded-full bg-card px-2.5 py-1 text-xs font-bold text-destructive">VOID</span>
              ) : d.lifecycle === "aktif" ? (
                <VoidButton doc={d} receiptId={r.id} name={r.nama} />
              ) : null}
            </div>
            {r.void && <p className="mt-2 pl-14 text-xs font-medium text-destructive">Alasan: {r.void.alasan}</p>}
          </Panel>
        ))}
      </div>
    </div>
  );
}
