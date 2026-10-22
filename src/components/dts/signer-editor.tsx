import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, inputCls } from "@/components/dts/ui";
import { uid, type Signer } from "@/lib/dts-data";

export function SignerEditor({ title, list, setList, error }: { title: string; list: Signer[]; setList: (list: Signer[]) => void; error?: string | undefined }) {
  const update = (id: string, key: "nama" | "jabatan", value: string) => setList(list.map((s) => s.id === id ? { ...s, [key]: value } : s));
  return <section className="space-y-3">
    <h2 className="font-semibold">{title} <span className="text-xs font-normal text-muted-foreground">(opsional)</span></h2>
    {!list.length && <p className="text-sm text-muted-foreground">Belum ada pihak dalam daftar.</p>}
    {list.map((s, i) => <div key={s.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2">
      <div className="grid gap-2 sm:grid-cols-2">
        <Field label={`Nama ${i + 1}`}><input className={inputCls} value={s.nama} onChange={(e) => update(s.id, "nama", e.target.value)} /></Field>
        <Field label="Jabatan (opsional)"><input className={inputCls} value={s.jabatan} onChange={(e) => update(s.id, "jabatan", e.target.value)} /></Field>
      </div>
      <Button type="button" variant="ghost" size="icon" aria-label={`Hapus ${s.nama || `pihak ${i + 1}`}`} onClick={() => setList(list.filter((p) => p.id !== s.id))}><Trash2 /></Button>
    </div>)}
    {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    <Button type="button" variant="outline" onClick={() => setList([...list, { id: uid(), nama: "", jabatan: "", status: "belum" }])}><Plus /> Tambah pihak</Button>
  </section>;
}