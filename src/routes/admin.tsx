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

  return (
    <div className="min-h-screen lg:p-6">
      <div className="mx-auto flex min-h-screen max-w-[1440px] bg-background lg:min-h-[calc(100vh-3rem)] lg:gap-6 lg:rounded-[2rem] lg:border lg:border-card lg:p-5 lg:shadow-frame">
        {/* Desktop sidebar */}
        <aside className="sticky top-5 hidden h-[calc(100vh-5.5rem)] w-[88px] shrink-0 flex-col items-center rounded-3xl bg-sidebar-grad py-5 text-sidebar-foreground shadow-soft lg:flex">
          <Link to="/admin/dokumen" className="glass grid size-11 place-items-center rounded-2xl" aria-label={`${late} dokumen terlambat`}>
            <div className="relative">
              <Bell className="size-5" />
              {late > 0 && <span className="absolute -right-2 -top-2 grid size-4 place-items-center rounded-full bg-destructive text-[9px] font-bold">{late}</span>}
            </div>
          </Link>
          <nav className="mt-8 flex flex-1 flex-col gap-2">
            {NAV.map(({ to, label, icon: I, ...rest }) => (
              <Link
                key={to}
                to={to}
                activeOptions={{ exact: "exact" in rest }}
                className="group flex w-[68px] flex-col items-center gap-1 rounded-2xl py-2 text-[10px] font-medium opacity-80 transition hover:bg-sidebar-accent hover:opacity-100 data-[status=active]:bg-sidebar-primary data-[status=active]:opacity-100 data-[status=active]:shadow-soft"
              >
                <I className="size-5" />
                {label}
              </Link>
            ))}
          </nav>
          <button onClick={logout} className="glass grid size-11 place-items-center rounded-2xl" aria-label="Keluar">
            <LogOut className="size-5" />
          </button>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Top bar */}
          <header className="sticky top-0 z-20 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border bg-card/95 px-4 py-3 backdrop-blur lg:static lg:mb-6 lg:rounded-2xl lg:border lg:shadow-card">
            <Logos size="sm" className="min-w-0" />
            <div className="flex items-center gap-2">
              <DemoTag className="hidden sm:inline-flex" />
              <Link to="/admin/dokumen/baru" className="hidden h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-soft hover:bg-primary-hover sm:inline-flex">
                <Plus className="size-4" /> Tambah Dokumen
              </Link>
              <div className="grid size-11 place-items-center rounded-full bg-primary-soft text-sm font-bold text-primary-hover" aria-label="Admin">AD</div>
            </div>
          </header>

          <main className="flex-1 px-4 pb-28 pt-5 sm:px-6 lg:px-1 lg:pb-4 lg:pt-0">
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
