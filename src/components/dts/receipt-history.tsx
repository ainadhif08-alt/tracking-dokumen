import { MapPin, Phone, Clock, Inbox } from "lucide-react";
import { VoidButton } from "@/components/dts/ui";
import { fmtDateTime, type Doc } from "@/lib/dts-data";
import { cn } from "@/lib/utils";

export function ReceiptHistory({ doc, admin = false }: { doc: Doc; admin?: boolean }) {
  const items = [...doc.penerimaan].reverse();
  if (!items.length) return <p className="text-sm text-muted-foreground">Belum ada catatan penerimaan.</p>;
  return <ol className="space-y-3">{items.map((r) => <li key={r.id} className={cn("rounded-xl border p-4", r.void ? "border-destructive/30 bg-destructive-soft" : "border-border")}>
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 space-y-1 break-words">
        <p className="flex items-center gap-2 text-xs font-semibold text-primary"><Inbox className="size-4" />{r.jenis === "dikembalikan" ? "Dikembalikan" : "Penerimaan"}</p>
        <p className={cn("font-semibold", r.void && "line-through")}>{r.nama}</p>
        <p className="text-sm">Tim: {r.unit}</p>
        <p className="flex items-center gap-2 text-sm"><Phone className="size-4 shrink-0 text-muted-foreground" />{r.wa}</p>
        <p className="flex items-start gap-2 text-sm"><MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />{r.lokasi}</p>
        <p className="flex items-center gap-2 text-xs text-muted-foreground"><Clock className="size-4 shrink-0" />{fmtDateTime(r.waktu)}</p>
      </div>
      {admin && !r.void && doc.lifecycle === "aktif" && <VoidButton doc={doc} receiptId={r.id} name={r.nama} />}
    </div>
    <p className="mt-3 border-t border-border pt-2 text-sm">{r.catatan}</p>
    {r.void && <p className="mt-2 text-xs font-semibold text-destructive">VOID · {r.void.alasan} · {fmtDateTime(r.void.waktu)}</p>}
  </li>)}</ol>;
}