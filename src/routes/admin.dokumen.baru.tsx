import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Check, ChevronLeft, ChevronRight, Plus, Trash2, Printer, RefreshCw, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, Panel, Field, inputCls, Logos } from "@/components/dts/ui";
import { useDts } from "@/lib/dts-store";
import { uid, fmtDate, type Doc, type Signer } from "@/lib/dts-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/dokumen/baru")({
  head: () => ({
    meta: [
      { title: "Tambah Dokumen — Document Tracking System" },
      { name: "description", content: "Buat dokumen baru: perjalanan, daftar paraf, daftar TTD, dan PIN." },
      { property: "og:title", content: "Tambah Dokumen — Document Tracking System" },
      { property: "og:description", content: "Buat dokumen baru: perjalanan, daftar paraf, daftar TTD, dan PIN." },
    ],
  }),
  component: NewDoc,
});

const STEPS = ["Info", "Perjalanan", "Paraf", "TTD", "PIN", "Review"];
const randPin = () => String(Math.floor(1000 + Math.random() * 9000));

function NewDoc() {
  const { addDoc } = useDts();
  const [step, setStep] = useState(0);
  const [info, setInfo] = useState({ judul: "", kategori: "Pengajuan", tenggat: "2026-11-04" });
  const [rute, setRute] = useState<string[]>(["Tim RPA", ""]);
  const [paraf, setParaf] = useState<Signer[]>([]);
  const [ttd, setTtd] = useState<Signer[]>([]);
  const [pin, setPin] = useState(randPin());
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [created, setCreated] = useState<Doc | null>(null);

  const validate = () => {
    const n: Record<string, string> = {};
    if (step === 0) {
      if (info.judul.trim().length < 5) n.judul = "Judul minimal 5 karakter.";
      if (!info.tenggat) n.tenggat = "Tenggat wajib diisi.";
    }
    if (step === 1 && rute.filter((r) => r.trim()).length < 2) n.rute = "Isi minimal 2 titik perjalanan.";
    if (step === 2 || step === 3) {
      const list = step === 2 ? paraf : ttd;
      if (list.some((s) => !s.nama.trim() || !s.jabatan.trim())) n.list = "Lengkapi nama dan jabatan, atau hapus baris kosong.";
    }
    if (step === 4 && !/^\d{4,6}$/.test(pin)) n.pin = "PIN berupa 4–6 digit angka.";
    setErrs(n);
    return Object.keys(n).length === 0;
  };
  const next = () => validate() && setStep((s) => s + 1);
  const save = () => {
    const d = addDoc({ ...info, judul: info.judul.trim(), pemilik: "Tim RPA", rute: rute.filter((r) => r.trim()), paraf, ttd, pin });
    setCreated(d);
  };

  if (created) return <SuccessView doc={created} />;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader eyebrow="Dokumen" title="Tambah Dokumen" />

      {/* Stepper */}
      <ol className="mb-6 grid grid-cols-6 gap-1">
        {STEPS.map((s, i) => (
          <li key={s} className="flex flex-col items-center gap-1.5 text-center">
            <span className={cn("grid size-9 place-items-center rounded-xl text-xs font-bold transition",
              i < step ? "bg-success text-success-foreground" : i === step ? "bg-primary text-primary-foreground shadow-soft" : "bg-muted text-muted-foreground")}>
              {i < step ? <Check className="size-4" /> : i + 1}
            </span>
            <span className={cn("text-[10px] font-medium sm:text-xs", i === step ? "text-primary-hover" : "text-muted-foreground")}>{s}</span>
          </li>
        ))}
      </ol>

      <Panel>
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="font-semibold">Informasi dokumen</h2>
            <Field label="Judul dokumen" error={errs.judul}><input className={inputCls} value={info.judul} onChange={(e) => setInfo({ ...info, judul: e.target.value })} placeholder="Contoh: Nota Dinas Implementasi Bot" /></Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Kategori">
                <select className={inputCls} value={info.kategori} onChange={(e) => setInfo({ ...info, kategori: e.target.value })}>
                  {["Pengajuan", "Nota Dinas", "Berita Acara", "Surat", "Laporan", "SOP"].map((k) => <option key={k}>{k}</option>)}
                </select>
              </Field>
              <Field label="Tenggat" error={errs.tenggat}><input type="date" className={inputCls} value={info.tenggat} onChange={(e) => setInfo({ ...info, tenggat: e.target.value })} /></Field>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-3">
            <h2 className="font-semibold">Rencana perjalanan dokumen</h2>
            {rute.map((r, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary-soft text-xs font-bold text-primary-hover">{i + 1}</span>
                <input className={inputCls} value={r} onChange={(e) => setRute(rute.map((x, j) => (j === i ? e.target.value : x)))} placeholder="Unit / bagian tujuan" />
                <Button variant="ghost" size="icon" disabled={rute.length <= 1} onClick={() => setRute(rute.filter((_, j) => j !== i))} aria-label="Hapus titik"><Trash2 /></Button>
              </div>
            ))}
            {errs.rute && <p className="text-xs font-medium text-destructive">{errs.rute}</p>}
            <Button variant="outline" onClick={() => setRute([...rute, ""])}><Plus /> Tambah titik</Button>
          </div>
        )}

        {(step === 2 || step === 3) && (
          <SignerEditor
            title={step === 2 ? "Daftar Paraf" : "Daftar Tanda Tangan (TTD)"}
            list={step === 2 ? paraf : ttd}
            setList={step === 2 ? setParaf : setTtd}
            error={errs.list}
          />
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h2 className="font-semibold">PIN dokumen</h2>
            <p className="text-sm text-muted-foreground">PIN dicetak pada label dan dipakai penerima saat konfirmasi lewat QR.</p>
            <div className="flex gap-2">
              <input className={cn(inputCls, "max-w-48 text-center text-2xl font-bold tracking-[0.4em]")} value={pin} maxLength={6} inputMode="numeric" onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} />
              <Button variant="outline" onClick={() => setPin(randPin())}><RefreshCw /> Acak</Button>
            </div>
            {errs.pin && <p className="text-xs font-medium text-destructive">{errs.pin}</p>}
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4 text-sm">
            <h2 className="font-semibold">Review</h2>
            <dl className="grid gap-3 sm:grid-cols-2">
              <Item k="Judul" v={info.judul} /><Item k="Kategori" v={info.kategori} />
              <Item k="Tenggat" v={fmtDate(info.tenggat)} /><Item k="PIN" v={pin} />
              <Item k="Perjalanan" v={rute.filter(Boolean).join(" → ")} />
              <Item k="Paraf" v={paraf.length ? paraf.map((s) => s.nama).join(", ") : "Tidak diperlukan"} />
              <Item k="TTD" v={ttd.length ? ttd.map((s) => s.nama).join(", ") : "Tidak diperlukan"} />
            </dl>
          </div>
        )}

        <div className="mt-6 flex justify-between gap-2 border-t border-border pt-5">
          {step === 0 ? (
            <Link to="/admin/dokumen" className="inline-flex h-11 items-center rounded-xl border border-border px-4 text-sm font-semibold">Batal</Link>
          ) : (
            <Button variant="outline" onClick={() => setStep(step - 1)}><ChevronLeft /> Kembali</Button>
          )}
          {step < 5 ? <Button onClick={next}>Lanjut <ChevronRight /></Button> : <Button variant="success" onClick={save}><CheckCircle2 /> Simpan dokumen</Button>}
        </div>
      </Panel>
    </div>
  );
}

function Item({ k, v }: { k: string; v: string }) {
  return <div className="rounded-xl bg-muted p-3"><dt className="text-xs text-muted-foreground">{k}</dt><dd className="font-medium break-words">{v}</dd></div>;
}

function SignerEditor({ title, list, setList, error }: { title: string; list: Signer[]; setList: (l: Signer[]) => void; error?: string }) {
  const upd = (id: string, k: "nama" | "jabatan", v: string) => setList(list.map((s) => (s.id === id ? { ...s, [k]: v } : s)));
  return (
    <div className="space-y-3">
      <h2 className="font-semibold">{title}</h2>
      {list.length === 0 && <p className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">Belum ada. Biarkan kosong jika <b>tidak diperlukan</b>.</p>}
      {list.map((s, i) => (
        <div key={s.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-2">
          <span className="mt-1 grid size-9 place-items-center rounded-full bg-primary-soft text-xs font-bold text-primary-hover">{i + 1}</span>
          <div className="grid gap-2 sm:grid-cols-2">
            <input className={inputCls} placeholder="Nama" value={s.nama} onChange={(e) => upd(s.id, "nama", e.target.value)} />
            <input className={inputCls} placeholder="Jabatan" value={s.jabatan} onChange={(e) => upd(s.id, "jabatan", e.target.value)} />
          </div>
          <Button variant="ghost" size="icon" onClick={() => setList(list.filter((x) => x.id !== s.id))} aria-label="Hapus"><Trash2 /></Button>
        </div>
      ))}
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
      <Button variant="outline" onClick={() => setList([...list, { id: uid(), nama: "", jabatan: "", status: "belum" }])}><Plus /> Tambah orang</Button>
    </div>
  );
}

function SuccessView({ doc }: { doc: Doc }) {
  const url = typeof window !== "undefined" ? `${window.location.origin}/track` : "/track";
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
