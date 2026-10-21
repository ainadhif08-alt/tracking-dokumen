import { useState, type ReactNode } from "react";
import {
  CheckCircle2,
  Clock,
  PenLine,
  Stamp,
  Undo2,
  XCircle,
  Inbox,
  AlertTriangle,
  BadgeCheck,
  ListChecks,
} from "lucide-react";
import briLogo from "@/assets/bri-logo.png.asset.json";
import danantaraLogo from "@/assets/danantara-logo.png.asset.json";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useDts } from "@/lib/dts-store";
import { completionGaps, isLate, progress, stageOf, type Doc, type Signer, type Stage } from "@/lib/dts-data";
import { toast } from "sonner";

export function Logos({ className, size = "md" }: { className?: string; size?: "sm" | "md" }) {
  const h = size === "sm" ? "h-6" : "h-8";
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <img src={danantaraLogo.url} alt="Danantara Indonesia" className={cn(h, "w-auto object-contain")} />
      <span className="h-6 w-px bg-border" />
      <img src={briLogo.url} alt="BRI - Bank Rakyat Indonesia" className={cn(h, "w-auto object-contain")} />
    </div>
  );
}

export function DemoTag({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full bg-warning-soft px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-warning-foreground", className)}>
      Data contoh
    </span>
  );
}

const STAGE_STYLE: Record<Stage, { cls: string; icon: typeof Clock }> = {
  "Menunggu Penerimaan": { cls: "bg-warning-soft text-warning-foreground", icon: Inbox },
  "Proses Paraf": { cls: "bg-primary-soft text-primary-hover", icon: PenLine },
  "Proses TTD": { cls: "bg-info-soft text-primary-hover", icon: Stamp },
  "Menunggu Pengembalian": { cls: "bg-warning-soft text-warning-foreground", icon: Undo2 },
  "Siap Diselesaikan": { cls: "bg-success-soft text-success", icon: ListChecks },
  Selesai: { cls: "bg-success-soft text-success", icon: CheckCircle2 },
  Dibatalkan: { cls: "bg-destructive-soft text-destructive", icon: XCircle },
};

export function StageBadge({ doc }: { doc: Doc }) {
  const st = stageOf(doc);
  const { cls, icon: Icon } = STAGE_STYLE[st];
  return (
    <div className="flex flex-wrap gap-1.5">
      <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold", cls)}>
        <Icon className="size-3.5" /> {st}
      </span>
      {isLate(doc) && (
        <span className="inline-flex items-center gap-1 rounded-full bg-destructive-soft px-2.5 py-1 text-xs font-semibold text-destructive">
          <AlertTriangle className="size-3.5" /> Terlambat
        </span>
      )}
    </div>
  );
}

export function SignStatusPill({ s }: { s: Signer }) {
  return s.status === "selesai" ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2.5 py-1 text-xs font-semibold text-success">
      <CheckCircle2 className="size-3.5" /> Selesai
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-warning-soft px-2.5 py-1 text-xs font-semibold text-warning-foreground">
      <Clock className="size-3.5" /> Belum
    </span>
  );
}

export function SignProgress({ list, label, compact }: { list: Signer[]; label: string; compact?: boolean }) {
  if (list.length === 0)
    return (
      <div className="min-w-0">
        {!compact && <p className="mb-1 text-xs font-medium text-muted-foreground">{label}</p>}
        <p className="text-xs italic text-muted-foreground">Tidak diperlukan</p>
      </div>
    );
  const p = progress(list);
  return (
    <div className="min-w-0">
      <div className="mb-1 flex items-center justify-between gap-2 text-xs">
        <span className="font-medium text-muted-foreground">{compact ? label : `Progres ${label}`}</span>
        <span className="font-semibold">
          {p.done}/{p.total}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full transition-all", p.pct === 100 ? "bg-success" : "bg-primary")} style={{ width: `${p.pct}%` }} />
      </div>
    </div>
  );
}

export function PageHeader({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: ReactNode }) {
  return (
    <div className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
      <div className="min-w-0">
        {eyebrow && <p className="text-xs font-medium text-muted-foreground">{eyebrow}</p>}
        <h1 className="truncate text-xl font-bold text-primary-hover sm:text-2xl">{title}</h1>
      </div>
      {action}
    </div>
  );
}

export function Panel({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("rounded-2xl border border-border bg-card p-5 shadow-card", className)}>{children}</div>;
}

export const inputCls =
  "h-11 w-full rounded-xl border border-input bg-card px-3.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground";

export function Field({ label, error, hint, children }: { label: string; error?: string | undefined; hint?: string | undefined; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>}
      {error && <span className="mt-1 block text-xs font-medium text-destructive">{error}</span>}
    </label>
  );
}

/* ---------------- Dialogs ---------------- */

export function MarkSignButton({ doc, kind, signer }: { doc: Doc; kind: "paraf" | "ttd"; signer: Signer }) {
  const { markSign } = useDts();
  const [open, setOpen] = useState(false);
  if (signer.status === "selesai" || doc.lifecycle !== "aktif") return null;
  const label = kind === "paraf" ? "Paraf" : "TTD";
  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        <BadgeCheck /> Tandai selesai
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Tandai {label} selesai?</DialogTitle>
            <DialogDescription>
              {label} oleh <b>{signer.nama}</b> ({signer.jabatan}) pada dokumen {doc.nomor} akan ditandai selesai. Penerimaan dokumen tidak terpengaruh.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button
              variant="success"
              onClick={() => {
                markSign(doc.id, kind, signer.id);
                setOpen(false);
                toast.success(`${label} ${signer.nama} ditandai selesai`);
              }}
            >
              <CheckCircle2 /> Ya, tandai selesai
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function VoidButton({ doc, receiptId, name }: { doc: Doc; receiptId: string; name: string }) {
  const { voidReceipt } = useDts();
  const [open, setOpen] = useState(false);
  const [alasan, setAlasan] = useState("");
  const [err, setErr] = useState("");
  return (
    <>
      <Button size="sm" variant="outline" className="text-destructive" onClick={() => setOpen(true)}>
        <XCircle /> Void
      </Button>
      <Dialog open={open} onOpenChange={(v) => { setOpen(v); setErr(""); setAlasan(""); }}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Void penerimaan</DialogTitle>
            <DialogDescription>
              Penerimaan oleh <b>{name}</b> akan dibatalkan. Posisi terakhir dokumen kembali ke penerimaan valid sebelumnya.
            </DialogDescription>
          </DialogHeader>
          <Field label="Alasan void (wajib)" error={err}>
            <textarea className={cn(inputCls, "h-24 py-2.5")} value={alasan} onChange={(e) => setAlasan(e.target.value)} placeholder="Contoh: salah input nomor tracking" />
          </Field>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (alasan.trim().length < 5) return setErr("Alasan wajib diisi (minimal 5 karakter).");
                voidReceipt(doc.id, receiptId, alasan.trim());
                setOpen(false);
                toast.success("Penerimaan berhasil di-void");
              }}
            >
              Void penerimaan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function CancelDocButton({ doc }: { doc: Doc }) {
  const { cancelDoc } = useDts();
  const [open, setOpen] = useState(false);
  const [alasan, setAlasan] = useState("");
  const [err, setErr] = useState("");
  if (doc.lifecycle !== "aktif") return null;
  return (
    <>
      <Button variant="outline" className="text-destructive" onClick={() => setOpen(true)}>
        <XCircle /> Batalkan
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Batalkan dokumen {doc.nomor}?</DialogTitle>
            <DialogDescription>Dokumen yang dibatalkan tidak dapat menerima konfirmasi penerimaan baru.</DialogDescription>
          </DialogHeader>
          <Field label="Alasan pembatalan (wajib)" error={err}>
            <textarea className={cn(inputCls, "h-24 py-2.5")} value={alasan} onChange={(e) => setAlasan(e.target.value)} />
          </Field>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Kembali</Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (alasan.trim().length < 5) return setErr("Alasan wajib diisi (minimal 5 karakter).");
                cancelDoc(doc.id, alasan.trim());
                setOpen(false);
                toast.success("Dokumen dibatalkan");
              }}
            >
              Batalkan dokumen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function FinishDocButton({ doc }: { doc: Doc }) {
  const { finishDoc } = useDts();
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  if (doc.lifecycle !== "aktif" && !done) return null;
  const gaps = completionGaps(doc);
  return (
    <>
      <Button variant="success" onClick={() => { setDone(false); setOpen(true); }}>
        <CheckCircle2 /> Selesaikan
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-2xl">
          {done ? (
            <>
              <DialogHeader>
                <div className="mx-auto mb-2 grid size-14 place-items-center rounded-2xl bg-success-soft text-success"><CheckCircle2 className="size-7" /></div>
                <DialogTitle className="text-center">Dokumen berhasil diselesaikan</DialogTitle>
                <DialogDescription className="text-center">{doc.nomor} — {doc.judul} kini berstatus Selesai.</DialogDescription>
              </DialogHeader>
              <DialogFooter><Button className="w-full" onClick={() => setOpen(false)}>Tutup</Button></DialogFooter>
            </>
          ) : gaps.length ? (
            <>
              <DialogHeader>
                <div className="mb-2 grid size-12 place-items-center rounded-2xl bg-destructive-soft text-destructive"><AlertTriangle className="size-6" /></div>
                <DialogTitle>Dokumen belum bisa diselesaikan</DialogTitle>
                <DialogDescription>Lengkapi kekurangan berikut terlebih dahulu:</DialogDescription>
              </DialogHeader>
              <ul className="space-y-2">
                {gaps.map((g) => (
                  <li key={g} className="flex items-start gap-2 rounded-xl bg-destructive-soft px-3 py-2 text-sm text-destructive">
                    <XCircle className="mt-0.5 size-4 shrink-0" /> {g}
                  </li>
                ))}
              </ul>
              <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Mengerti</Button></DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Selesaikan dokumen {doc.nomor}?</DialogTitle>
                <DialogDescription>Semua paraf & TTD lengkap dan dokumen sudah dikembalikan ke Tim RPA.</DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
                <Button variant="success" onClick={() => { finishDoc(doc.id); setDone(true); }}>
                  <CheckCircle2 /> Ya, selesaikan
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
