import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { PageHeader, Panel, Field, inputCls } from "@/components/dts/ui";

export const Route = createFileRoute("/admin/pengaturan")({
  head: () => ({
    meta: [
      { title: "Pengaturan — Document Tracking System" },
      { name: "description", content: "Pengaturan sederhana aplikasi pelacak dokumen." },
      { property: "og:title", content: "Pengaturan — Document Tracking System" },
      { property: "og:description", content: "Pengaturan sederhana aplikasi pelacak dokumen." },
    ],
  }),
  component: Settings,
});

function Settings() {
  const [s, setS] = useState({ tim: "Tim RPA", wa: "081200001111", hari: "7", notif: true, ulang: false });
  const [err, setErr] = useState<Partial<Record<"tim" | "wa" | "hari", string>>>({});
  const save = () => {
    const n: Partial<Record<"tim" | "wa" | "hari", string>> = {};
    if (!s.tim.trim()) n.tim = "Nama tim wajib diisi.";
    if (!/^(08|62)\d{8,12}$/.test(s.wa)) n.wa = "Nomor WA tidak valid.";
    if (!(Number(s.hari) >= 1)) n.hari = "Minimal 1 hari.";
    setErr(n);
    if (!Object.keys(n).length) toast.success("Pengaturan disimpan");
  };
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader eyebrow="Admin" title="Pengaturan" />
      <Panel className="space-y-4">
        <Field label="Nama tim pemilik dokumen" error={err.tim}><input className={inputCls} value={s.tim} onChange={(e) => setS({ ...s, tim: e.target.value })} /></Field>
        <Field label="Nomor WhatsApp admin" error={err.wa}><input className={inputCls} value={s.wa} onChange={(e) => setS({ ...s, wa: e.target.value.replace(/\D/g, "") })} /></Field>
        <Field label="Tenggat default (hari)" error={err.hari}><input type="number" min={1} className={inputCls} value={s.hari} onChange={(e) => setS({ ...s, hari: e.target.value })} /></Field>
        {[
          { k: "notif" as const, l: "Tandai otomatis dokumen terlambat", d: "Badge Terlambat muncul setelah tenggat lewat." },
          { k: "ulang" as const, l: "Wajibkan PIN 6 digit", d: "PIN baru dibuat 6 digit." },
        ].map(({ k, l, d }) => (
          <div key={k} className="flex items-center justify-between gap-4 rounded-xl bg-muted p-4">
            <div><p className="text-sm font-medium">{l}</p><p className="text-xs text-muted-foreground">{d}</p></div>
            <Switch checked={s[k]} onCheckedChange={(v) => setS({ ...s, [k]: v })} aria-label={l} />
          </div>
        ))}
        <Button onClick={save} className="w-full sm:w-auto"><Save /> Simpan</Button>
      </Panel>
    </div>
  );
}
