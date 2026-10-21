import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import {
  FileText, Inbox, PenLine, Stamp, Undo2, AlertTriangle, CheckCircle2, ChevronRight, Activity as ActIcon, MapPin,
} from "lucide-react";
import { PageHeader, Panel, StageBadge, SignProgress } from "@/components/dts/ui";
import { useDts } from "@/lib/dts-store";
import { stageOf, isLate, lastPosition, fmtDateTime, type Doc } from "@/lib/dts-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Document Tracking System" },
      { name: "description", content: "Ringkasan dokumen aktif, paraf, TTD, dan aktivitas terbaru." },
      { property: "og:title", content: "Dashboard — Document Tracking System" },
      { property: "og:description", content: "Ringkasan dokumen aktif, paraf, TTD, dan aktivitas terbaru." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { docs } = useDts();
  const [range, setRange] = useState<"minggu" | "bulan">("minggu");
  const active = docs.filter((d) => d.lifecycle === "aktif");
  const count = (s: string) => active.filter((d) => stageOf(d) === s).length;
  const kpi = [
    { l: "Proses Paraf", v: count("Proses Paraf"), i: PenLine, to: "/admin/paraf" as const },
    { l: "Proses TTD", v: count("Proses TTD"), i: Stamp, to: "/admin/ttd" as const },
    { l: "Menunggu Pengembalian", v: count("Menunggu Pengembalian"), i: Undo2, to: "/admin/dokumen" as const },
    { l: "Selesai", v: docs.filter((d) => d.lifecycle === "selesai").length, i: CheckCircle2, to: "/admin/dokumen" as const },
  ];

  const chart = useMemo(() => {
    const all = docs.flatMap((d) => d.penerimaan.filter((r) => !r.void));
    if (range === "minggu") {
      const days = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
      return days.map((n, i) => ({ n, v: all.filter((r) => (new Date(r.waktu).getDay() + 6) % 7 === i).length + ([1, 2, 1, 3, 2, 0, 0][i] ?? 0) }));
    }
    return ["Mei", "Jun", "Jul", "Agu", "Sep", "Okt"].map((n, i) => ({ n, v: [8, 12, 9, 15, 11, all.length + 4][i] }));
  }, [docs, range]);

  const followUp = active
    .filter((d) => isLate(d) || stageOf(d) === "Menunggu Penerimaan" || stageOf(d) === "Siap Diselesaikan")
    .slice(0, 5);
  const recent = docs
    .flatMap((d) => d.aktivitas.map((a) => ({ ...a, doc: d })))
    .sort((a, b) => b.waktu.localeCompare(a.waktu))
    .slice(0, 6);

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0">
        <PageHeader eyebrow="Selamat datang, Admin" title="Dashboard" />

        <div className="grid gap-5 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          {/* Hero chart */}
          <div className="relative overflow-hidden rounded-3xl bg-hero p-5 text-primary-foreground shadow-soft">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Penerimaan Dokumen</h2>
              <select value={range} onChange={(e) => setRange(e.target.value as "minggu" | "bulan")} className="glass h-9 rounded-xl px-3 text-xs font-medium text-primary-foreground outline-none [&>option]:text-foreground">
                <option value="minggu">Mingguan</option>
                <option value="bulan">Bulanan</option>
              </select>
            </div>
            <div className="mt-3 h-36 text-primary-foreground">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chart} margin={{ top: 10, left: 0, right: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="currentColor" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="n" axisLine={false} tickLine={false} tick={{ fill: "currentColor", fontSize: 11, opacity: 0.8 }} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "none", color: "var(--foreground)" }} formatter={(v) => [`${v} penerimaan`, ""]} />
                  <Area type="monotone" dataKey="v" stroke="currentColor" strokeWidth={2.5} fill="url(#g)" isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <Stat l="Dokumen aktif" v={active.length} />
              <Stat l="Menunggu penerimaan" v={count("Menunggu Penerimaan")} highlight />
              <Stat l="Total dokumen" v={docs.length} />
            </div>
          </div>

          <div className="grid gap-5">
            <Link to="/admin/dokumen" className="flex items-center gap-4 rounded-3xl bg-info-grad p-5 text-primary-foreground shadow-soft">
              <div className="glass grid size-14 shrink-0 place-items-center rounded-2xl"><FileText className="size-6" /></div>
              <div className="min-w-0">
                <p className="text-xs opacity-85">Dokumen aktif</p>
                <p className="text-3xl font-extrabold">{active.length}</p>
              </div>
            </Link>
            <Link to="/admin/dokumen" className="relative overflow-hidden rounded-3xl border border-destructive/20 bg-card p-5 shadow-card">
              <div className="flex items-center gap-3">
                <div className="grid size-12 place-items-center rounded-2xl bg-destructive-soft text-destructive"><AlertTriangle className="size-6" /></div>
                <p className="font-semibold">Terlambat</p>
              </div>
              <p className="mt-3 text-3xl font-extrabold text-destructive">{active.filter(isLate).length}</p>
              <p className="text-xs text-muted-foreground">Melewati tenggat · per {fmtDateTime("2026-10-21T09:00:00").split(",")[0]}</p>
              <ChevronRight className="absolute bottom-5 right-5 size-5 text-muted-foreground" />
            </Link>
          </div>
        </div>

        {/* Folder-shaped quick access cards */}
        <h2 className="mb-4 mt-8 text-sm font-semibold uppercase tracking-wider">Akses cepat</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {kpi.map(({ l, v, i: I, to }, idx) => {
            const first = idx === 0;
            return (
              <Link key={l} to={to} className="group relative pt-4 transition hover:-translate-y-0.5">
                <span className={cn("absolute right-0 top-0 h-6 w-1/2 rounded-t-2xl", first ? "bg-primary" : "bg-muted")} />
                <div className={cn("relative rounded-2xl rounded-tr-none p-4", first ? "bg-primary text-primary-foreground shadow-soft" : "bg-muted")}>
                  <p className={cn("text-[10px] font-bold uppercase tracking-wider", !first && "text-muted-foreground")}>Tahap</p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className={cn("grid size-9 place-items-center rounded-full", first ? "glass" : "bg-card text-primary")}><I className="size-4" /></span>
                    <span className={cn("text-2xl font-extrabold", !first && "text-primary-hover")}>{v}</span>
                  </div>
                  <p className={cn("mt-4 text-[10px] font-bold uppercase tracking-wider", !first && "text-muted-foreground")}>Dokumen</p>
                  <p className={cn("truncate text-xs", first ? "opacity-90" : "text-primary")}>{l}</p>
                </div>
              </Link>
            );
          })}
        </div>

        <Panel className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Perlu tindak lanjut</h2>
            <Link to="/admin/dokumen" className="text-xs font-semibold text-primary">Lihat semua</Link>
          </div>
          <div className="space-y-3">
            {followUp.length === 0 && <p className="text-sm text-muted-foreground">Tidak ada dokumen yang perlu ditindaklanjuti.</p>}
            {followUp.map((d) => <FollowRow key={d.id} d={d} />)}
          </div>
        </Panel>
      </div>

      {/* Right rail: activity */}
      <aside className="min-w-0 xl:border-l xl:border-border xl:pl-6">
        <div className="mb-4 flex items-center gap-2 pt-1">
          <ActIcon className="size-4 text-primary" />
          <h2 className="font-semibold">Aktivitas terbaru</h2>
        </div>
        <ul className="space-y-4">
          {recent.map((a) => (
            <li key={a.id}>
              <Link to="/admin/dokumen/$id" params={{ id: a.doc.id }} className="flex gap-3">
                <div className={cn("grid size-10 shrink-0 place-items-center rounded-full text-xs font-bold",
                  a.tipe === "void" || a.tipe === "batal" ? "bg-destructive-soft text-destructive" : a.tipe === "selesai" ? "bg-success-soft text-success" : "bg-primary-soft text-primary-hover")}>
                  {a.tipe === "terima" ? <Inbox className="size-4" /> : a.tipe === "paraf" ? <PenLine className="size-4" /> : a.tipe === "ttd" ? <Stamp className="size-4" /> : a.tipe === "void" ? <AlertTriangle className="size-4" /> : <FileText className="size-4" />}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-primary-hover">{a.doc.nomor}</p>
                  <p className="line-clamp-2 text-sm">{a.teks}</p>
                  <p className="text-[11px] text-muted-foreground">{fmtDateTime(a.waktu)}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}

function Stat({ l, v, highlight }: { l: string; v: number; highlight?: boolean }) {
  return (
    <div className={cn("rounded-2xl px-2 py-3", highlight && "glass")}>
      <p className="text-[10px] opacity-85 sm:text-xs">{l}</p>
      <p className="text-xl font-extrabold">{v}</p>
    </div>
  );
}

function FollowRow({ d }: { d: Doc }) {
  const pos = lastPosition(d);
  return (
    <Link to="/admin/dokumen/$id" params={{ id: d.id }} className="grid gap-3 rounded-2xl border border-border p-4 transition hover:border-primary/40 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)] sm:items-center">
      <div className="min-w-0">
        <p className="text-xs font-semibold text-primary-hover">{d.nomor}</p>
        <p className="truncate text-sm font-medium">{d.judul}</p>
        <p className="mt-1 flex items-center gap-1 truncate text-xs text-muted-foreground"><MapPin className="size-3 shrink-0" />{pos ? `${pos.unit}, ${pos.lokasi}` : "Belum ada penerimaan"}</p>
      </div>
      <div className="grid grid-cols-2 gap-3"><SignProgress list={d.paraf} label="Paraf" compact /><SignProgress list={d.ttd} label="TTD" compact /></div>
      <div className="sm:justify-self-end"><StageBadge doc={d} /></div>
    </Link>
  );
}
