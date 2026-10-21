import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, LogIn, QrCode, FileSearch, PenLine, Stamp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logos, Field, inputCls, DemoTag } from "@/components/dts/ui";
import { useDts } from "@/lib/dts-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Masuk Admin — Document Tracking System" },
      { name: "description", content: "Masuk sebagai admin untuk memantau perjalanan dokumen, paraf, dan TTD." },
      { property: "og:title", content: "Masuk Admin — Document Tracking System" },
      { property: "og:description", content: "Pantau posisi dokumen fisik, paraf, dan TTD antarbagian." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { setLoggedIn } = useDts();
  const nav = useNavigate();
  const [user, setUser] = useState("admin.rpa");
  const [pass, setPass] = useState("admin123");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState<{ user?: string; pass?: string; form?: string }>({});

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const n: typeof err = {};
    if (!user.trim()) n.user = "Username wajib diisi.";
    if (!pass) n.pass = "Password wajib diisi.";
    if (!n.user && !n.pass && (user !== "admin.rpa" || pass !== "admin123")) n.form = "Username atau password tidak sesuai.";
    setErr(n);
    if (Object.keys(n).length) return;
    setLoggedIn(true);
    nav({ to: "/admin" });
  };

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:py-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex items-center justify-between rounded-2xl bg-card px-5 py-4 shadow-card">
          <Logos size="sm" />
          <Link to="/track" className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary-soft px-4 text-sm font-semibold text-primary-hover hover:bg-secondary">
            <QrCode className="size-4" /> <span className="hidden sm:inline">Konfirmasi Penerimaan</span><span className="sm:hidden">Penerimaan</span>
          </Link>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
          <section className="relative overflow-hidden rounded-3xl bg-hero p-7 text-primary-foreground shadow-soft sm:p-10">
            <div className="absolute -right-16 -top-16 size-64 rounded-full glass" />
            <div className="absolute -bottom-20 right-24 size-48 rounded-full glass" />
            <div className="relative">
              <span className="glass inline-flex rounded-full px-3 py-1 text-xs font-semibold">Tim RPA · Internal</span>
              <h1 className="mt-5 max-w-lg text-3xl font-extrabold leading-tight sm:text-4xl">Document Tracking System</h1>
              <p className="mt-3 max-w-md text-sm opacity-90 sm:text-base">
                Lacak perjalanan dokumen fisik antarbagian — posisi terakhir, paraf, dan tanda tangan dalam satu tempat.
              </p>
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {[
                  { i: FileSearch, t: "Posisi real-time", d: "Dari scan QR penerima" },
                  { i: PenLine, t: "Paraf terpisah", d: "Progres per pejabat" },
                  { i: Stamp, t: "TTD terkontrol", d: "Selesai bila lengkap" },
                ].map(({ i: I, t, d }) => (
                  <div key={t} className="glass rounded-2xl p-4">
                    <I className="size-5" />
                    <p className="mt-3 text-sm font-semibold">{t}</p>
                    <p className="text-xs opacity-80">{d}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <form onSubmit={submit} className="rounded-3xl bg-card p-6 shadow-card sm:p-8" noValidate>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold">Masuk Admin</h2>
              <DemoTag />
            </div>
            <div className="space-y-4">
              <Field label="Username" error={err.user}>
                <input className={inputCls} value={user} onChange={(e) => setUser(e.target.value)} placeholder="Masukkan username" />
              </Field>
              <Field label="Password" error={err.pass}>
                <div className="relative">
                  <input type={show ? "text" : "password"} className={inputCls + " pr-12"} value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Masukkan password" />
                  <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Sembunyikan password" : "Tampilkan password"} className="absolute right-1 top-0 grid size-11 place-items-center text-muted-foreground">
                    {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </Field>
              {err.form && <p className="rounded-xl bg-destructive-soft px-3 py-2 text-sm font-medium text-destructive">{err.form}</p>}
              <Button type="submit" className="w-full" size="lg"><LogIn /> Masuk</Button>
              <p className="text-center text-xs text-muted-foreground">Mockup: kredensial contoh sudah terisi.</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
