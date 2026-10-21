import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, MapPin, MessageCircle, Clock, Inbox, Undo2, User } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Panel, StageBadge, SignProgress, SignStatusPill, MarkSignButton, VoidButton, CancelDocButton, FinishDocButton,
} from "@/components/dts/ui";
import { useDts } from "@/lib/dts-store";
import { lastPosition, fmtDate, fmtDateTime, type Doc } from "@/lib/dts-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/dokumen/$id")({
  head: () => ({
    meta: [
      { title: "Detail Dokumen — Document Tracking System" },
      { name: "description", content: "Posisi, penerimaan, paraf, TTD, dan riwayat aktivitas dokumen." },
      { property: "og:title", content: "Detail Dokumen — Document Tracking System" },
      { property: "og:description", content: "Posisi, penerimaan, paraf, TTD, dan riwayat aktivitas dokumen." },
    ],
  }),
  component: DocDetail,
});

function DocDetail() {
  const { id } = Route.useParams();
  const doc = useDts().getDoc(id);
  if (!doc)
    return (
      <Panel className="text-center">
        <p className="font-semibold">Dokumen tidak ditemukan.</p>
        <Link to="/admin/dokumen" className="mt-3 inline-block text-sm font-semibold text-primary">Kembali ke daftar</Link>
      </Panel>
    );

  return (
    <div>
      <Link to="/admin/dokumen" className="mb-3 inline-flex h-11 items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary"><ArrowLeft className="size-4" /> Daftar Dokumen</Link>
      <div className="relative mb-6 overflow-hidden rounded-3xl bg-hero p-5 text-primary-foreground shadow-soft sm:p-6">
        <div className="absolute -right-12 -top-12 size-48 rounded-full glass" />
        <div className="relative grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <div className="min-w-0">
            <p className="text-xs font-semibold opacity-85">{doc.nomor} · {doc.kategori}</p>
            <h1 className="mt-1 text-xl font-bold sm:text-2xl">{doc.judul}</h1>
            <div className="mt-3 rounded-full bg-card/95 p-0.5 w-fit"><StageBadge doc={doc} /></div>
          </div>
          <div className="flex flex-wrap gap-2 [&_button]:bg-card">
            <CancelDocButton doc={doc} />
            <FinishDocButton doc={doc} />
          </div>
        </div>
      </div>

      <Tabs defaultValue="ringkasan">
        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <TabsList className="h-12 rounded-2xl bg-card p-1 shadow-card">
            {[["ringkasan", "Ringkasan"], ["posisi", "Posisi & Penerimaan"], ["paraf", "Paraf"], ["ttd", "TTD"], ["riwayat", "Riwayat"]].map(([v, l]) => (
              <TabsTrigger key={v} value={v} className="h-10 rounded-xl px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">{l}</TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="ringkasan" className="mt-5">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <Panel>
              <h2 className="mb-4 font-semibold">Informasi</h2>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <Info k="Pemilik" v={doc.pemilik} /><Info k="Dibuat" v={fmtDate(doc.dibuat)} />
                <Info k="Tenggat" v={fmtDate(doc.tenggat)} /><Info k="PIN" v={doc.pin} />
                <div className="col-span-2"><Info k="Rencana perjalanan" v={doc.rute.join(" → ")} /></div>
                {doc.alasanBatal && <div className="col-span-2"><Info k="Alasan batal" v={doc.alasanBatal} /></div>}
              </dl>
            </Panel>
            <Panel className="space-y-5">
              <h2 className="font-semibold">Progres</h2>
              <SignProgress list={doc.paraf} label="Paraf" />
              <SignProgress list={doc.ttd} label="TTD" />
              <PositionCard doc={doc} />
            </Panel>
          </div>
        </TabsContent>

        <TabsContent value="posisi" className="mt-5">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
            <Panel><PositionCard doc={doc} /></Panel>
            <Panel>
              <h2 className="mb-1 font-semibold">Timeline penerimaan</h2>
              <p className="mb-4 text-xs text-muted-foreground">Penerimaan tidak mengubah status paraf/TTD. Penerimaan void dicoret dan tidak dihitung sebagai posisi.</p>
              <Timeline doc={doc} />
            </Panel>
          </div>
        </TabsContent>

        <TabsContent value="paraf" className="mt-5"><SignerList doc={doc} kind="paraf" /></TabsContent>
        <TabsContent value="ttd" className="mt-5"><SignerList doc={doc} kind="ttd" /></TabsContent>

        <TabsContent value="riwayat" className="mt-5">
          <Panel>
            <ol className="relative space-y-5 border-l-2 border-border pl-6">
              {doc.aktivitas.map((a) => (
                <li key={a.id} className="relative">
                  <span className={cn("absolute -left-[31px] top-1 size-3 rounded-full ring-4 ring-card",
                    a.tipe === "void" || a.tipe === "batal" ? "bg-destructive" : a.tipe === "selesai" ? "bg-success" : "bg-primary")} />
                  <p className="text-sm">{a.teks}</p>
                  <p className="text-xs text-muted-foreground">{fmtDateTime(a.waktu)}</p>
                </li>
              ))}
            </ol>
          </Panel>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Info({ k, v }: { k: string; v: string }) {
  return <div className="rounded-xl bg-muted p-3"><dt className="text-xs text-muted-foreground">{k}</dt><dd className="font-medium break-words">{v}</dd></div>;
}

function PositionCard({ doc }: { doc: Doc }) {
  const pos = lastPosition(doc);
  if (!pos) return <div className="rounded-2xl bg-warning-soft p-4 text-sm font-medium text-warning-foreground"><Inbox className="mb-1 size-5" />Belum ada penerimaan valid.</div>;
  const wa = pos.wa.startsWith("0") ? "62" + pos.wa.slice(1) : pos.wa;
  return (
    <div className="rounded-2xl bg-primary-soft p-4">
      <p className="text-xs font-semibold text-primary-hover">Posisi terakhir</p>
      <p className="mt-2 flex items-center gap-2 font-bold"><MapPin className="size-4 shrink-0 text-primary" />{pos.unit}, {pos.lokasi}</p>
      <p className="mt-1 flex items-center gap-2 text-sm"><User className="size-4 shrink-0 text-muted-foreground" />{pos.nama}</p>
      <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground"><Clock className="size-4 shrink-0" />{fmtDateTime(pos.waktu)}</p>
      <a href={`https://wa.me/${wa}?text=${encodeURIComponent(`Halo ${pos.nama}, menanyakan dokumen ${doc.nomor} - ${doc.judul}.`)}`} target="_blank" rel="noreferrer"
        className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-success text-sm font-semibold text-success-foreground hover:bg-success/90">
        <MessageCircle className="size-4" /> Hubungi via WhatsApp
      </a>
    </div>
  );
}

function Timeline({ doc }: { doc: Doc }) {
  const items = [...doc.penerimaan].sort((a, b) => b.waktu.localeCompare(a.waktu));
  if (!items.length) return <p className="text-sm text-muted-foreground">Belum ada penerimaan.</p>;
  return (
    <ol className="space-y-3">
      {items.map((r) => (
        <li key={r.id} className={cn("rounded-2xl border p-4", r.void ? "border-destructive/30 bg-destructive-soft" : "border-border")}>
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
            <div className={cn("min-w-0", r.void && "text-destructive line-through decoration-2")}>
              <p className="flex items-center gap-1.5 text-xs font-semibold">
                {r.jenis === "dikembalikan" ? <Undo2 className="size-3.5" /> : <Inbox className="size-3.5" />}
                {r.jenis === "dikembalikan" ? "Dikembalikan ke Tim RPA" : "Diterima"}
              </p>
              <p className="font-semibold">{r.nama}</p>
              <p className="text-sm">{r.unit}, {r.lokasi}</p>
              <p className="text-xs opacity-80">{fmtDateTime(r.waktu)}</p>
            </div>
            {!r.void && doc.lifecycle === "aktif" && <VoidButton doc={doc} receiptId={r.id} name={r.nama} />}
          </div>
          {r.catatan && <p className="mt-2 text-xs text-muted-foreground">Catatan: {r.catatan}</p>}
          {r.void && <p className="mt-2 text-xs font-semibold text-destructive">VOID · {r.void.alasan}</p>}
        </li>
      ))}
    </ol>
  );
}

function SignerList({ doc, kind }: { doc: Doc; kind: "paraf" | "ttd" }) {
  const list = doc[kind];
  return (
    <Panel>
      <div className="mb-5 max-w-sm"><SignProgress list={list} label={kind === "paraf" ? "Paraf" : "TTD"} /></div>
      {list.length === 0 ? <p className="text-sm text-muted-foreground">Tidak diperlukan untuk dokumen ini.</p> : (
        <ul className="space-y-3">
          {list.map((s, i) => (
            <li key={s.id} className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-2xl border border-border p-4 sm:grid-cols-[auto_minmax(0,1fr)_auto_auto]">
              <span className="grid size-10 place-items-center rounded-full bg-primary-soft text-sm font-bold text-primary-hover">{i + 1}</span>
              <div className="min-w-0">
                <p className="font-semibold">{s.nama}</p>
                <p className="text-xs text-muted-foreground">{s.jabatan}{s.waktu && ` · ${fmtDateTime(s.waktu)}`}</p>
              </div>
              <div className="col-start-2 sm:col-start-auto"><SignStatusPill s={s} /></div>
              <div className="col-start-2 sm:col-start-auto"><MarkSignButton doc={doc} kind={kind} signer={s} /></div>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
