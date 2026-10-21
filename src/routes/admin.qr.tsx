import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, Panel, Logos } from "@/components/dts/ui";

export const Route = createFileRoute("/admin/qr")({
  head: () => ({
    meta: [
      { title: "QR Code — Document Tracking System" },
      { name: "description", content: "QR code umum untuk konfirmasi penerimaan dokumen." },
      { property: "og:title", content: "QR Code — Document Tracking System" },
      { property: "og:description", content: "QR code umum untuk konfirmasi penerimaan dokumen." },
    ],
  }),
  component: QrPage,
});

function QrPage() {
  const [url, setUrl] = useState("/track");
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => setUrl(`${window.location.origin}/track`), []);
  const download = () => {
    const c = ref.current?.querySelector("canvas");
    if (!c) return;
    const a = document.createElement("a");
    a.href = c.toDataURL("image/png");
    a.download = "qr-penerimaan-dokumen.png";
    a.click();
  };
  return (
    <div className="mx-auto max-w-xl">
      <PageHeader eyebrow="Publik" title="QR Code Penerimaan" />
      <Panel className="text-center">
        <Logos className="justify-center" />
        <div ref={ref} className="mx-auto mt-6 w-fit rounded-3xl bg-hero p-4 shadow-soft">
          <div className="rounded-2xl bg-card p-4"><QRCodeCanvas value={url} size={220} marginSize={1} /></div>
        </div>
        <p className="mt-5 font-semibold">Scan untuk konfirmasi penerimaan dokumen</p>
        <p className="mt-1 break-all text-xs text-muted-foreground">{url}</p>
        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          <Button onClick={download}><Download /> Unduh PNG</Button>
          <Link to="/track" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border text-sm font-semibold"><ExternalLink className="size-4" /> Buka form</Link>
        </div>
      </Panel>
    </div>
  );
}
