import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, Clock, Send, XCircle, Inbox, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logos, Field, inputCls, DemoTag } from "@/components/dts/ui";
import { useDts } from "@/lib/dts-store";
import type { ReceiptKind } from "@/lib/dts-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/track")({
  head: () => ({
    meta: [
      { title: "Konfirmasi Penerimaan Dokumen — Tim RPA" },
      { name: "description", content: "Konfirmasi penerimaan dokumen fisik dengan nomor tracking dan PIN." },
      { property: "og:title", content: "Konfirmasi Penerimaan Dokumen" },
      { property: "og:description", content: "Scan QR, isi nomor tracking & PIN, lalu konfirmasi penerimaan dokumen." },
    ],
  }),
  component: TrackPage,
});

const empty = { nomor: "", pin: "", nama: "", wa: "", unit: "", lokasi: "", jenis: "diterima" as ReceiptKind, catatan: "" };

function TrackPage() {
  const { submitReceipt } = useDts();
  const [f, setF] = useState(empty);
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [state, setState] = useState<{ kind: "form" } | { kind: "ok"; judul: string } | { kind: "err" }>({ kind: "form" });
  const set = (k: keyof typeof empty, v: string) => setF((p) => ({ ...p, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const n: Record<string, string> = {};
    if (!f.nomor.trim()) n.nomor = "Nomor tracking wajib diisi.";
    if (!/^\d{4,6}$/.test(f.pin)) n.pin = "PIN berupa 4–6 digit angka.";
    if (!f.nama.trim()) n.nama = "Nama wajib diisi.";
    if (!/^(08|62)\d{8,12}$/.test(f.wa.replace(/\D/g, ""))) n.wa = "Nomor WA tidak valid (contoh 081234567890).";
    if (!f.unit.trim()) n.unit = "Unit wajib diisi.";
    if (!f.lokasi.trim()) n.lokasi = "Lokasi wajib diisi.";
    setErrs(n);
    if (Object.keys(n).length) return;
    const doc = submitReceipt(f.nomor, f.pin, {
      nama: f.nama.trim(), wa: f.wa.replace(/\D/g, ""), unit: f.unit.trim(), lokasi: f.lokasi.trim(), jenis: f.jenis, catatan: f.catatan.trim() || undefined,
    });
    setState(doc ? { kind: "ok", judul: doc.judul } : { kind: "err" });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
          <Logos size="sm" />
          <DemoTag />
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 pb-32 pt-5">
        <div className="relative mb-5 overflow-hidden rounded-3xl bg-hero p-5 text-primary-foreground shadow-soft">
          <div className="absolute -right-10 -top-10 size-36 rounded-full glass" />
          <p className="relative text-xs font-medium opacity-85">Document Tracking System</p>
          <h1 className="relative mt-1 text-xl font-bold">Konfirmasi Penerimaan Dokumen</h1>
          <p className="relative mt-1 text-sm opacity-90">Isi data di bawah sesuai label pada dokumen.</p>
        </div>

        {state.kind === "ok" ? (
          <div className="rounded-3xl bg-card p-6 text-center shadow-card">
            <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-success-soft text-success"><CheckCircle2 className="size-8" /></div>
            <h2 className="mt-4 text-lg font-bold">Konfirmasi berhasil dikirim</h2>
            <p className="mt-1 text-sm text-muted-foreground">Terima kasih. Penerimaan untuk dokumen berikut telah tercatat:</p>
            <p className="mt-3 rounded-xl bg-primary-soft px-4 py-3 text-sm font-semibold text-primary-hover">{state.judul}</p>
            <Button className="mt-6 w-full" onClick={() => { setF(empty); setState({ kind: "form" }); }}>Kirim konfirmasi lain</Button>
          </div>
        ) : (
          <form id="track-form" onSubmit={submit} noValidate className="space-y-4 rounded-3xl bg-card p-5 shadow-card">
            {state.kind === "err" && (
              <div className="flex items-start gap-2 rounded-xl bg-destructive-soft px-3 py-3 text-sm font-medium text-destructive">
                <XCircle className="mt-0.5 size-4 shrink-0" /> Nomor tracking atau PIN tidak sesuai.
              </div>
            )}
            <div className="grid grid-cols-[minmax(0,1fr)_110px] gap-3">
              <Field label="Nomor tracking" error={errs.nomor}>
                <input className={inputCls} value={f.nomor} onChange={(e) => set("nomor", e.target.value.toUpperCase())} placeholder="RPA-2026-001" />
              </Field>
              <Field label="PIN" error={errs.pin}>
                <input className={inputCls} inputMode="numeric" maxLength={6} value={f.pin} onChange={(e) => set("pin", e.target.value.replace(/\D/g, ""))} placeholder="••••" />
              </Field>
            </div>
            <Field label="Nama lengkap" error={errs.nama}><input className={inputCls} value={f.nama} onChange={(e) => set("nama", e.target.value)} /></Field>
            <Field label="Nomor WhatsApp" error={errs.wa}><input className={inputCls} inputMode="tel" value={f.wa} onChange={(e) => set("wa", e.target.value)} placeholder="081234567890" /></Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Unit / Bagian" error={errs.unit}><input className={inputCls} value={f.unit} onChange={(e) => set("unit", e.target.value)} placeholder="Sekretaris Tim A" /></Field>
              <Field label="Lokasi" error={errs.lokasi}><input className={inputCls} value={f.lokasi} onChange={(e) => set("lokasi", e.target.value)} placeholder="Lantai 3" /></Field>
            </div>
            <div>
              <span className="mb-1.5 block text-sm font-medium">Jenis penerimaan</span>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { v: "diterima", l: "Diterima", i: Inbox },
                  { v: "dikembalikan", l: "Dikembalikan ke Tim RPA", i: Undo2 },
                ] as const).map(({ v, l, i: I }) => (
                  <button type="button" key={v} onClick={() => set("jenis", v)} aria-pressed={f.jenis === v}
                    className={cn("flex min-h-14 items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm font-medium transition",
                      f.jenis === v ? "border-primary bg-primary-soft text-primary-hover" : "border-border bg-card")}>
                    <I className="size-4 shrink-0" /> {l}
                  </button>
                ))}
              </div>
            </div>
            <Field label="Catatan (opsional)"><textarea className={cn(inputCls, "h-20 py-2.5")} value={f.catatan} onChange={(e) => set("catatan", e.target.value)} /></Field>
            <p className="flex items-center gap-2 rounded-xl bg-info-soft px-3 py-2.5 text-xs font-medium text-primary-hover">
              <Clock className="size-4 shrink-0" /> Waktu dicatat otomatis oleh sistem.
            </p>
            <p className="text-center text-xs text-muted-foreground">Contoh untuk dicoba: RPA-2026-001 · PIN 4821</p>
          </form>
        )}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Admin? <Link to="/" className="font-semibold text-primary">Masuk di sini</Link>
        </p>
      </main>

      {state.kind !== "ok" && (
        <div className="fixed inset-x-0 bottom-0 border-t border-border bg-card/95 p-4 backdrop-blur">
          <div className="mx-auto max-w-lg">
            <Button type="submit" form="track-form" size="lg" className="w-full"><Send /> Kirim konfirmasi</Button>
          </div>
        </div>
      )}
    </div>
  );
}
