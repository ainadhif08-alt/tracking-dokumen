import { createContext, useContext, useState, type ReactNode } from "react";
import { SEED, uid, completionGaps, type Doc, type Receipt, type Activity } from "./dts-data";

const nowIso = () => new Date().toISOString().slice(0, 19);

interface Store {
  docs: Doc[];
  loggedIn: boolean;
  setLoggedIn: (v: boolean) => void;
  getDoc: (id: string) => Doc | undefined;
  addDoc: (d: Omit<Doc, "id" | "nomor" | "dibuat" | "aktivitas" | "penerimaan" | "lifecycle">) => Doc;
  markSign: (docId: string, kind: "paraf" | "ttd", signerId: string) => void;
  voidReceipt: (docId: string, receiptId: string, alasan: string) => void;
  cancelDoc: (docId: string, alasan: string) => void;
  finishDoc: (docId: string) => string[];
  submitReceipt: (nomor: string, pin: string, rc: Omit<Receipt, "id" | "waktu">) => Doc | null;
}

const Ctx = createContext<Store | null>(null);

export function DtsProvider({ children }: { children: ReactNode }) {
  const [docs, setDocs] = useState<Doc[]>(SEED);
  const [loggedIn, setLoggedIn] = useState(false);

  const update = (id: string, fn: (d: Doc) => Doc) =>
    setDocs((all) => all.map((d) => (d.id === id ? fn(d) : d)));
  const log = (d: Doc, teks: string, tipe: Activity["tipe"]): Activity[] => [
    { id: uid(), waktu: nowIso(), teks, tipe },
    ...d.aktivitas,
  ];

  const store: Store = {
    docs,
    loggedIn,
    setLoggedIn,
    getDoc: (id) => docs.find((d) => d.id === id),
    addDoc: (input) => {
      const n = docs.length + 1;
      const doc: Doc = {
        ...input,
        id: uid(),
        nomor: `RPA-2026-${String(n).padStart(3, "0")}`,
        dibuat: nowIso(),
        lifecycle: "aktif",
        penerimaan: [],
        aktivitas: [{ id: uid(), waktu: nowIso(), teks: "Dokumen dibuat oleh Admin", tipe: "buat" }],
      };
      setDocs((all) => [doc, ...all]);
      return doc;
    },
    markSign: (docId, kind, signerId) =>
      update(docId, (d) => {
        const signer = d[kind].find((s) => s.id === signerId);
        return {
          ...d,
          [kind]: d[kind].map((s) => (s.id === signerId ? { ...s, status: "selesai", waktu: nowIso() } : s)),
          aktivitas: log(d, `${kind === "paraf" ? "Paraf" : "TTD"} ${signer?.nama} ditandai selesai`, kind),
        };
      }),
    voidReceipt: (docId, receiptId, alasan) =>
      update(docId, (d) => {
        const rc = d.penerimaan.find((x) => x.id === receiptId);
        return {
          ...d,
          penerimaan: d.penerimaan.map((x) => (x.id === receiptId ? { ...x, void: { alasan, waktu: nowIso() } } : x)),
          aktivitas: log(d, `Penerimaan oleh ${rc?.nama} di-void: ${alasan}`, "void"),
        };
      }),
    cancelDoc: (docId, alasan) =>
      update(docId, (d) => ({ ...d, lifecycle: "batal", alasanBatal: alasan, aktivitas: log(d, `Dokumen dibatalkan: ${alasan}`, "batal") })),
    finishDoc: (docId) => {
      const d = docs.find((x) => x.id === docId);
      if (!d) return ["Dokumen tidak ditemukan"];
      const gaps = completionGaps(d);
      if (gaps.length === 0)
        update(docId, (x) => ({ ...x, lifecycle: "selesai", aktivitas: log(x, "Dokumen diselesaikan oleh Admin", "selesai") }));
      return gaps;
    },
    submitReceipt: (nomor, pin, rc) => {
      const d = docs.find((x) => x.nomor.toLowerCase() === nomor.trim().toLowerCase() && x.pin === pin.trim());
      if (!d || d.lifecycle !== "aktif") return null;
      const receipt: Receipt = { ...rc, id: uid(), waktu: nowIso() };
      update(d.id, (x) => ({
        ...x,
        penerimaan: [...x.penerimaan, receipt],
        aktivitas: log(
          x,
          `${rc.jenis === "dikembalikan" ? "Dikembalikan ke Tim RPA" : "Diterima"} oleh ${rc.nama} — ${rc.unit}, ${rc.lokasi}`,
          "terima",
        ),
      }));
      return d;
    },
  };

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useDts() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useDts must be used inside DtsProvider");
  return c;
}
