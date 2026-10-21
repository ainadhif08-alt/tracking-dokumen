import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Plus, ChevronLeft, ChevronRight, MapPin, CalendarDays } from "lucide-react";
import { PageHeader, Panel, StageBadge, SignProgress, inputCls } from "@/components/dts/ui";
import { useDts } from "@/lib/dts-store";
import { stageOf, isLate, lastPosition, fmtDate, type Stage } from "@/lib/dts-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/dokumen/")({
  head: () => ({
    meta: [
      { title: "Daftar Dokumen — Document Tracking System" },
      { name: "description", content: "Cari, filter, dan pantau semua dokumen beserta progres paraf dan TTD." },
      { property: "og:title", content: "Daftar Dokumen — Document Tracking System" },
      { property: "og:description", content: "Cari, filter, dan pantau semua dokumen beserta progres paraf dan TTD." },
    ],
  }),
  component: DocList,
});

const STAGES: (Stage | "Terlambat")[] = ["Menunggu Penerimaan", "Proses Paraf", "Proses TTD", "Menunggu Pengembalian", "Siap Diselesaikan", "Terlambat", "Selesai", "Dibatalkan"];
const PER = 5;

function DocList() {
  const { docs } = useDts();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("semua");
  const [sort, setSort] = useState("terbaru");
  const [page, setPage] = useState(1);

  const rows = useMemo(() => {
    let r = docs.filter((d) => (d.nomor + d.judul).toLowerCase().includes(q.toLowerCase()));
    if (filter === "Terlambat") r = r.filter(isLate);
    else if (filter !== "semua") r = r.filter((d) => stageOf(d) === filter);
    r = [...r].sort((a, b) =>
      sort === "tenggat" ? a.tenggat.localeCompare(b.tenggat) : sort === "nomor" ? a.nomor.localeCompare(b.nomor) : b.dibuat.localeCompare(a.dibuat),
    );
    return r;
  }, [docs, q, filter, sort]);
  const pages = Math.max(1, Math.ceil(rows.length / PER));
  const cur = Math.min(page, pages);
  const shown = rows.slice((cur - 1) * PER, cur * PER);

  return (
    <div>
      <PageHeader eyebrow="Kelola" title="Daftar Dokumen" action={
        <Link to="/admin/dokumen/baru" className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-soft hover:bg-primary-hover">
          <Plus className="size-4" /><span className="hidden sm:inline">Tambah</span>
        </Link>
      } />

      <Panel className="mb-5 p-4">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px_180px]">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input className={cn(inputCls, "pl-10")} placeholder="Cari nomor atau judul…" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
          </div>
          <select className={inputCls} value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }} aria-label="Filter status">
            <option value="semua">Semua status</option>
            {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className={inputCls} value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Urutkan">
            <option value="terbaru">Terbaru dibuat</option>
            <option value="tenggat">Tenggat terdekat</option>
            <option value="nomor">Nomor</option>
          </select>
        </div>
      </Panel>

      {/* Desktop table */}
      <Panel className="hidden overflow-hidden p-0 lg:block">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-xs font-semibold text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Nomor</th><th className="px-4 py-3">Judul</th><th className="px-4 py-3">Posisi terakhir</th>
              <th className="w-32 px-4 py-3">Paraf</th><th className="w-32 px-4 py-3">TTD</th><th className="px-4 py-3">Tenggat</th><th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((d) => {
              const pos = lastPosition(d);
              return (
                <tr key={d.id} className="border-t border-border hover:bg-primary-soft/40">
                  <td className="px-4 py-3 font-semibold text-primary-hover"><Link to="/admin/dokumen/$id" params={{ id: d.id }} className="hover:underline">{d.nomor}</Link></td>
                  <td className="max-w-56 px-4 py-3"><Link to="/admin/dokumen/$id" params={{ id: d.id }} className="line-clamp-2 font-medium">{d.judul}</Link></td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{pos ? <>{pos.unit}<br />{pos.lokasi}</> : "—"}</td>
                  <td className="px-4 py-3"><SignProgress list={d.paraf} label="Paraf" compact /></td>
                  <td className="px-4 py-3"><SignProgress list={d.ttd} label="TTD" compact /></td>
                  <td className={cn("px-4 py-3 text-xs", isLate(d) && "font-semibold text-destructive")}>{fmtDate(d.tenggat)}</td>
                  <td className="px-4 py-3"><StageBadge doc={d} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {shown.length === 0 && <p className="p-8 text-center text-sm text-muted-foreground">Tidak ada dokumen yang cocok.</p>}
      </Panel>

      {/* Mobile cards */}
      <div className="space-y-3 lg:hidden">
        {shown.map((d) => {
          const pos = lastPosition(d);
          return (
            <Link key={d.id} to="/admin/dokumen/$id" params={{ id: d.id }} className="block rounded-2xl border border-border bg-card p-4 shadow-card">
              <p className="text-xs font-semibold text-primary-hover">{d.nomor}</p>
              <p className="font-medium">{d.judul}</p>
              <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                <p className="flex items-center gap-1"><MapPin className="size-3 shrink-0" />{pos ? `${pos.unit}, ${pos.lokasi}` : "Belum ada penerimaan"}</p>
                <p className={cn("flex items-center gap-1", isLate(d) && "font-semibold text-destructive")}><CalendarDays className="size-3 shrink-0" />Tenggat {fmtDate(d.tenggat)}</p>
              </div>
              <div className="my-3 grid grid-cols-2 gap-3"><SignProgress list={d.paraf} label="Paraf" compact /><SignProgress list={d.ttd} label="TTD" compact /></div>
              <StageBadge doc={d} />
            </Link>
          );
        })}
        {shown.length === 0 && <p className="p-8 text-center text-sm text-muted-foreground">Tidak ada dokumen yang cocok.</p>}
      </div>

      <div className="mt-5 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{rows.length} dokumen · Hal. {cur}/{pages}</span>
        <div className="flex gap-2">
          <button disabled={cur <= 1} onClick={() => setPage(cur - 1)} aria-label="Sebelumnya" className="grid size-11 place-items-center rounded-xl border border-border bg-card disabled:opacity-40"><ChevronLeft className="size-4" /></button>
          <button disabled={cur >= pages} onClick={() => setPage(cur + 1)} aria-label="Berikutnya" className="grid size-11 place-items-center rounded-xl border border-border bg-card disabled:opacity-40"><ChevronRight className="size-4" /></button>
        </div>
      </div>
    </div>
  );
}
