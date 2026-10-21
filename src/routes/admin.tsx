import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  LayoutDashboard,
  FileText,
  Inbox,
  PenLine,
  Stamp,
  QrCode,
  Settings,
  LogOut,
  Plus,
  Menu,
  Bell,
} from "lucide-react";
import { Logos, DemoTag } from "@/components/dts/ui";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useDts } from "@/lib/dts-store";
import { isLate } from "@/lib/dts-data";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/dokumen", label: "Dokumen", icon: FileText },
  { to: "/admin/penerimaan", label: "Penerimaan", icon: Inbox },
  { to: "/admin/paraf", label: "Paraf", icon: PenLine },
  { to: "/admin/ttd", label: "TTD", icon: Stamp },
  { to: "/admin/qr", label: "QR Code", icon: QrCode },
  { to: "/admin/pengaturan", label: "Pengaturan", icon: Settings },
] as const;

function AdminLayout() {
  const { setLoggedIn, docs } = useDts();
  const nav = useNavigate();
  const [menu, setMenu] = useState(false);
  const late = docs.filter(isLate).length;
  const logout = () => {
    setLoggedIn(false);
    nav({ to: "/" });
  };

  const active = docs.filter((d) => d.lifecycle === "aktif").length;
  const done = docs.filter((d) => d.lifecycle === "selesai").length;
  return (
    <div className="min-h-screen bg-brand-canvas lg:p-8">
      <div className="mx-auto flex min-h-screen max-w-[1440px] flex-col overflow-hidden bg-card lg:min-h-[calc(100vh-4rem)] lg:rounded-[2.5rem] lg:shadow-frame">
        {/* Top bar spanning full width */}
        <header className="sticky top-0 z-20 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border bg-card px-4 py-3 lg:static lg:grid-cols-[260px_minmax(0,1fr)_auto] lg:border-0 lg:px-8 lg:py-6">
          <Logos size="sm" className="min-w-0" />
          <div className="relative hidden max-w-md lg:block">
            <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Link to="/admin/dokumen" className="flex h-11 items-center rounded-full bg-muted pl-11 text-sm text-muted-foreground">Cari dokumen…</Link>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <DemoTag className="hidden sm:inline-flex" />
            <Link to="/admin/dokumen" className="relative grid size-11 place-items-center rounded-full hover:bg-muted" aria-label={`${late} dokumen terlambat`}>
              <Bell className="size-5" />
              {late > 0 && <span className="absolute right-2 top-2 grid size-4 place-items-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">{late}</span>}
            </Link>
            <Link to="/admin/pengaturan" className="hidden size-11 place-items-center rounded-full hover:bg-muted sm:grid" aria-label="Pengaturan"><Settings className="size-5" /></Link>
            <span className="ml-2 hidden text-sm font-medium md:inline">Admin RPA</span>
            <div className="grid size-10 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground" aria-label="Admin">A</div>
          </div>
        </header>

        <div className="flex min-h-0 flex-1">
          {/* Desktop sidebar: solid blue panel with curved top-right corner */}
          <aside className="hidden w-[260px] shrink-0 flex-col rounded-tr-[4rem] bg-primary px-6 pb-8 pt-10 text-sidebar-foreground lg:flex">
            <Link to="/admin/dokumen/baru" className="mb-8 flex h-11 items-center justify-center gap-2 rounded-full bg-card text-sm font-semibold text-primary shadow-soft hover:bg-primary-soft">
              <Plus className="size-4" /> Tambah Dokumen
            </Link>
            <nav className="flex flex-1 flex-col gap-1">
              {NAV.map(({ to, label, icon: I, ...rest }) => (
                <Link
                  key={to}
                  to={to}
                  activeOptions={{ exact: "exact" in rest }}
                  className="flex h-11 items-center gap-4 rounded-xl px-3 text-sm font-medium opacity-85 transition hover:bg-sidebar-accent hover:opacity-100 data-[status=active]:bg-sidebar-accent data-[status=active]:font-semibold data-[status=active]:opacity-100"
                >
                  <I className="size-5" />
                  {label}
                </Link>
              ))}
            </nav>
            <div className="mt-6 space-y-4 text-xs">
              <p className="font-semibold uppercase tracking-wider opacity-80">Ringkasan</p>
              {[{ l: "Dokumen aktif", v: active }, { l: "Dokumen selesai", v: done }].map(({ l, v }) => (
                <div key={l}>
                  <p className="mb-1.5 opacity-90">{l}</p>
                  <div className="h-1.5 overflow-hidden rounded-full bg-sidebar-accent"><div className="h-full rounded-full bg-card" style={{ width: `${docs.length ? (v / docs.length) * 100 : 0}%` }} /></div>
                  <p className="mt-1.5 opacity-80">{v} dari {docs.length} dokumen</p>
                </div>
              ))}
              <button onClick={logout} className="mt-2 flex h-11 items-center gap-2 font-semibold"><LogOut className="size-4" /> Keluar</button>
            </div>
          </aside>

          <main className="min-w-0 flex-1 px-4 pb-28 pt-5 sm:px-6 lg:px-10 lg:pb-10 lg:pt-8">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-5 items-end">
          {[NAV[0], NAV[1]].map(({ to, label, icon: I }, idx) => (
            <Link key={to} to={to} activeOptions={{ exact: idx === 0 }} className="flex min-h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium text-muted-foreground data-[status=active]:text-primary">
              <I className="size-5" /> {label}
            </Link>
          ))}
          <Link to="/admin/dokumen/baru" className="mx-auto -mt-6 grid size-14 place-items-center rounded-2xl bg-hero text-primary-foreground shadow-soft" aria-label="Tambah dokumen">
            <Plus className="size-6" />
          </Link>
          <Link to="/admin/penerimaan" className="flex min-h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium text-muted-foreground data-[status=active]:text-primary">
            <Inbox className="size-5" /> Penerimaan
          </Link>
          <button onClick={() => setMenu(true)} className="flex min-h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium text-muted-foreground">
            <Menu className="size-5" /> Lainnya
          </button>
        </div>
      </nav>

      <Sheet open={menu} onOpenChange={setMenu}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader><SheetTitle>Menu</SheetTitle></SheetHeader>
          <div className="grid grid-cols-3 gap-3 p-4">
            {NAV.map(({ to, label, icon: I }) => (
              <Link key={to} to={to} onClick={() => setMenu(false)} className="flex min-h-20 flex-col items-center justify-center gap-2 rounded-2xl bg-primary-soft text-xs font-semibold text-primary-hover">
                <I className="size-5" /> {label}
              </Link>
            ))}
            <button onClick={logout} className="flex min-h-20 flex-col items-center justify-center gap-2 rounded-2xl bg-destructive-soft text-xs font-semibold text-destructive">
              <LogOut className="size-5" /> Keluar
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
