import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Printer, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, Panel, Field, inputCls, Logos } from "@/components/dts/ui";
import { SignerEditor } from "@/components/dts/signer-editor";
import { useDts } from "@/lib/dts-store";
import { documentErrors, trackingPath, type Doc, type Signer } from "@/lib/dts-data";

export const Route = createFileRoute("/admin/dokumen/baru")({
  head: () => ({ meta: [
    { title: "Tambah Dokumen — Document Tracking System" },
    { name: "description", content: "Buat dokumen dengan judul, nama tim, dan daftar paraf serta TTD opsional." },
    { property: "og:title", content: "Tambah Dokumen — Document Tracking System" },
    { property: "og:description", content: "Pembuatan dokumen dan QR tracking per dokumen." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }), component: NewDoc,
});

function NewDoc() {
  const { addDoc } = useDts();
  const [judul, setJudul] = useState("");
  const [tim, setTim] = useState("");
  const [paraf, setParaf] = useState<Signer[]>([]);
  const [ttd, setTtd] = useState<Signer[]>([]);
  const [errors, setErrors] = useState<ReturnType<typeof documentErrors>>({});
  const [created, setCreated] = useState<Doc | null>(null);
  if (created) return <SuccessView doc={created} />;
  return <div className="mx-auto max-w-3xl">
    <PageHeader eyebrow="Dokumen" title="Tambah Dokumen" />
    <form className="space-y-6" noValidate onSubmit={(e) => {
      e.preventDefault();
      const errors = documentErrors(judul, tim, paraf, ttd); setErrors(errors);
      if (Object.keys(errors).length) return;
      setCreated(addDoc({ judul: judul.trim(), pemilik: tim.trim(), kategori: "Dokumen", tenggat: "", rute: [], paraf: paraf.map((s) => ({ ...s, nama: s.nama.trim() })), ttd: ttd.map((s) => ({ ...s, nama: s.nama.trim() })), pin: String(Math.floor(1000 + Math.random() * 9000)) }));
    }}>
      <section className="space-y-4">
        <h2 className="font-semibold">Informasi dokumen</h2>
        <Field label="Judul dokumen" error={errors.judul}><input className={inputCls} value={judul} onChange={(e) => setJudul(e.target.value)} /></Field>
        <Field label="Nama tim" error={errors.tim}><input className={inputCls} value={tim} onChange={(e) => setTim(e.target.value)} /></Field>
      </section>
      <div className="border-t border-border pt-5"><SignerEditor title="Daftar Paraf" list={paraf} setList={setParaf} error={errors.list} /></div>
      <div className="border-t border-border pt-5"><SignerEditor title="Daftar TTD" list={ttd} setList={setTtd} error={errors.list} /></div>
      <div className="flex flex-wrap justify-end gap-3 border-t border-border pt-5">
        <Button type="button" variant="outline" asChild><Link to="/admin/dokumen">Batal</Link></Button>
        <Button type="submit"><CheckCircle2 /> Buat dokumen</Button>
      </div>
    </form>
  </div>;
}

function SuccessView({ doc }: { doc: Doc }) {
  const url = typeof window !== "undefined" ? `${window.location.origin}${trackingPath(doc.nomor)}` : trackingPath(doc.nomor);
  return (
    <div className="mx-auto max-w-2xl">
      <Panel className="text-center">
        <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-success-soft text-success"><CheckCircle2 className="size-8" /></div>
        <h1 className="mt-4 text-xl font-bold">Dokumen berhasil dibuat</h1>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-primary-soft p-4"><p className="text-xs text-muted-foreground">Nomor tracking</p><p className="text-lg font-extrabold text-primary-hover">{doc.nomor}</p></div>
          <div className="rounded-2xl bg-primary-soft p-4"><p className="text-xs text-muted-foreground">PIN</p><p className="text-lg font-extrabold tracking-widest text-primary-hover">{doc.pin}</p></div>
        </div>
        <p className="mb-3 mt-6 text-left text-sm font-semibold">Pratinjau label cetak</p>
        <div className="flex items-center gap-4 rounded-2xl border-2 border-dashed border-border p-4 text-left">
          <QRCodeSVG value={url} size={96} className="shrink-0" />
          <div className="min-w-0">
            <Logos size="sm" />
            <p className="mt-2 truncate text-sm font-semibold">{doc.judul}</p>
            <p className="text-xs">No: <b>{doc.nomor}</b> · PIN: <b>{doc.pin}</b></p>
            <p className="text-[11px] text-muted-foreground">Scan QR untuk konfirmasi penerimaan</p>
          </div>
        </div>
        <div className="mt-6 grid gap-2 sm:grid-cols-3">
          <Button variant="outline" onClick={() => window.print()}><Printer /> Cetak label</Button>
          <Link to="/admin/dokumen/$id" params={{ id: doc.id }} className="inline-flex h-11 items-center justify-center rounded-xl border border-border text-sm font-semibold">Lihat detail</Link>
          <Link to="/admin/dokumen" className="inline-flex h-11 items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground">Ke daftar</Link>
        </div>
      </Panel>
    </div>
  );
}
