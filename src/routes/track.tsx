import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, Send, LockKeyhole, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logos, Field, inputCls, DemoTag, SignProgress, SignStatusPill } from "@/components/dts/ui";
import { ReceiptHistory } from "@/components/dts/receipt-history";
import { useDts } from "@/lib/dts-store";
import { receiptErrors, unlockDocument, lastPosition, fmtDateTime, type ReceiptInput } from "@/lib/dts-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/track")({
  validateSearch: (search: Record<string, unknown>): { doc?: string | undefined } => ({ doc: typeof search.doc === "string" ? search.doc : undefined }),
  head: () => ({ meta: [
    { title: "Tracking Dokumen — Tim RPA" },
    { name: "description", content: "Akses dokumen dengan PIN, catat perjalanan fisik dan lihat progres paraf serta TTD terpisah." },
    { property: "og:title", content: "Tracking Dokumen — Tim RPA" },
    { property: "og:description", content: "Riwayat penerimaan lengkap dan progres paraf serta TTD dokumen." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }), component: TrackPage,
});
const empty: ReceiptInput = { nama: "", wa: "", unit: "", lokasi: "", jenis: "diterima", catatan: "" };
function TrackPage() {
  const search = Route.useSearch();
  const { docs, submitReceipt } = useDts();
  const [nomor, setNomor] = useState(search.doc ?? "");
  const [pin, setPin] = useState("");
  const [access, setAccess] = useState<{ id: string; pin: string } | null>(null);
  const [accessError, setAccessError] = useState("");
  const [f, setF] = useState<ReceiptInput>(empty);
  const [errors, setErrors] = useState<ReturnType<typeof receiptErrors>>({});
  const [success, setSuccess] = useState(false);
  const doc = access ? docs.find((d) => d.id === access.id) : undefined;
  const set = (key: keyof ReceiptInput, value: string) => { setF((prev) => ({ ...prev, [key]: value })); setSuccess(false); };
  const pos = doc ? lastPosition(doc) : undefined;
  return <div className="min-h-screen bg-background">
    <header className="border-b border-border bg-card"><div className="mx-auto flex max-w-3xl items-center justify-between gap-2 px-4 py-4"><Logos size="sm" /><DemoTag /></div></header>
    <main className="mx-auto max-w-3xl px-4 py-6">
      {!doc ? <div className="mx-auto max-w-md">
        <div className="mb-6"><LockKeyhole className="mb-3 size-8 text-primary" /><p className="text-xs text-muted-foreground">Document Tracking System</p><h1 className="mt-1 text-2xl font-bold text-primary-hover">Akses Dokumen</h1></div>
        <form className="space-y-4" noValidate onSubmit={(e) => {
          e.preventDefault(); const found = unlockDocument(docs, nomor, pin);
          if (!found) { setAccessError("Nomor tracking atau PIN tidak sesuai."); return; }
          setAccess({ id: found.id, pin }); setAccessError("");
        }}>
          <Field label="Nomor tracking"><input className={inputCls} readOnly={!!search.doc} value={nomor} onChange={(e) => setNomor(e.target.value.toUpperCase())} /></Field>
          <Field label="PIN"><input className={inputCls} type="password" inputMode="numeric" maxLength={6} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} /></Field>
          {accessError && <p role="alert" className="text-sm text-destructive">{accessError}</p>}
          <Button type="submit" className="w-full"><LockKeyhole /> Buka dokumen</Button>
        </form>
      </div> : <>
        <div className="mb-6 border-b border-border pb-5"><p className="text-xs font-semibold text-primary">{doc.nomor} · {doc.pemilik}</p><h1 className="mt-1 break-words text-2xl font-bold">{doc.judul}</h1>
          <div className="mt-4 flex items-start gap-2 text-sm"><MapPin className="size-5 shrink-0 text-primary" /><div><p className="font-semibold">{pos ? `${pos.unit} · ${pos.lokasi}` : "Belum ada penerimaan"}</p>{pos && <p className="text-xs text-muted-foreground">{pos.nama} · {fmtDateTime(pos.waktu)}</p>}</div></div>
        </div>
        <div className="mb-6 grid gap-5 sm:grid-cols-2">{(["paraf", "ttd"] as const).map((kind) => <section key={kind} className="min-w-0 space-y-3"><SignProgress list={doc[kind]} label={kind === "paraf" ? "Paraf" : "TTD"} /><ul className="space-y-2">{doc[kind].map((s) => <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2 text-sm"><span className="min-w-0 break-words">{s.nama}</span><SignStatusPill s={s} /></li>)}</ul></section>)}</div>
        <section className="border-t border-border pt-5"><h2 className="mb-4 text-lg font-semibold">Update Penerimaan Dokumen</h2>
          {doc.lifecycle === "batal" ? <p className="text-sm text-destructive">Dokumen dibatalkan.</p> : <form className="space-y-4" noValidate onSubmit={(e) => {
            e.preventDefault(); const errors = receiptErrors(f); setErrors(errors); if (Object.keys(errors).length || !access) return;
            const result = submitReceipt(doc.nomor, access.pin, { ...f, nama: f.nama.trim(), wa: f.wa.trim(), unit: f.unit.trim(), lokasi: f.lokasi.trim(), catatan: f.catatan.trim() });
            if (!result) { setAccessError("Penerimaan belum tercatat. Periksa akses dokumen."); return; }
            setF(empty); setSuccess(true); setAccessError("");
          }}>
            {success && <p role="status" className="flex items-center gap-2 rounded-xl bg-success-soft p-3 text-sm font-medium text-success"><CheckCircle2 className="size-5 shrink-0" />Penerimaan berhasil dicatat.</p>}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nama penerima" error={errors.nama}><input className={inputCls} value={f.nama} onChange={(e) => set("nama", e.target.value)} /></Field>
              <Field label="Nomor telepon" error={errors.wa}><input className={inputCls} type="tel" value={f.wa} onChange={(e) => set("wa", e.target.value)} /></Field>
              <Field label="Nama tim penerima" error={errors.unit}><input className={inputCls} value={f.unit} onChange={(e) => set("unit", e.target.value)} /></Field>
              <Field label="Lokasi penerimaan" error={errors.lokasi}><input className={inputCls} placeholder="Gedung BRI, lantai 3" value={f.lokasi} onChange={(e) => set("lokasi", e.target.value)} /></Field>
            </div>
            <Field label="Deskripsi / keterangan penerimaan" error={errors.catatan}><textarea className={cn(inputCls, "h-24 py-3")} value={f.catatan} onChange={(e) => set("catatan", e.target.value)} /></Field>
            {accessError && <p role="alert" className="text-sm text-destructive">{accessError}</p>}
            <Button type="submit"><Send /> Simpan penerimaan</Button>
          </form>}
        </section>
        <section className="mt-8 border-t border-border pt-5"><h2 className="mb-4 text-lg font-semibold">Riwayat Perjalanan ({doc.penerimaan.length})</h2><ReceiptHistory doc={doc} /></section>
      </>}
      <p className="mt-8 text-center text-xs text-muted-foreground"><Link to="/" className="font-semibold text-primary">Masuk Admin</Link></p>
    </main>
  </div>;
}
