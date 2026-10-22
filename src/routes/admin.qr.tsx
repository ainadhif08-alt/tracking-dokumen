import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, Panel, Logos, Field, inputCls } from "@/components/dts/ui";

import { useDts } from "@/lib/dts-store";
import { trackingPath } from "@/lib/dts-data";

export const Route = createFileRoute("/admin/qr")({
  head: () => ({
    meta: [
      { title: "QR Code — Document Tracking System" },
      { name: "description", content: "QR code per dokumen untuk akses tracking dengan PIN." },
      { property: "og:title", content: "QR Code — Document Tracking System" },
      { property: "og:description", content: "QR code per dokumen untuk akses tracking dengan PIN." },
    ],
  }),
  component: QrPage,
});

function QrPage() {
  const { docs } = useDts();
  const [selected, setSelected] = useState(docs[0]?.id ?? "");
  const doc = docs.find((d) => d.id === selected);
  const [origin, setOrigin] = useState("");
  const url = doc ? `${origin}${trackingPath(doc.nomor)}` : "";
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => setOrigin(window.location.origin), []);
  const download = () => {
    const c = ref.current?.querySelector("canvas");
    if (!c) return;
    const a = document.createElement("a");
    a.href = c.toDataURL("image/png");
    a.download = `qr-${doc?.nomor ?? "dokumen"}.png`;
    a.click();
  };
  return (
    <div className="mx-auto max-w-xl">
      <PageHeader eyebrow="Publik" title="QR Code Penerimaan" />
      <Field label="Dokumen"><select className={inputCls} value={selected} onChange={(e) => setSelected(e.target.value)}>{docs.map((d) => <option key={d.id} value={d.id}>{d.nomor} — {d.judul}</option>)}</select></Field>
      {doc && <Panel className="mt-5 text-center">
        <Logos className="justify-center" />
        <div ref={ref} className="mx-auto mt-6 w-fit rounded-3xl bg-hero p-4 shadow-soft">
          <div className="rounded-2xl bg-card p-4"><QRCodeCanvas value={url} size={220} marginSize={1} /></div>
        </div>
        <p className="mt-5 font-semibold">{doc.judul}</p>
        <p className="mt-2 text-sm font-semibold">{doc.nomor} · PIN: {doc.pin}</p>
        <p className="mt-1 break-all text-xs text-muted-foreground">{url}</p>
        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          <Button onClick={download}><Download /> Unduh PNG</Button>
          <Link to="/track" search={{ doc: doc.nomor }} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border text-sm font-semibold"><ExternalLink className="size-4" /> Buka tracking</Link>
        </div>
      </Panel>}
    </div>
  );
}
