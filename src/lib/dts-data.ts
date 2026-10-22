// DATA CONTOH — mock data & pure business rules for the Document Tracking System mockup.

export type SignStatus = "belum" | "selesai";
export interface Signer {
  id: string;
  nama: string;
  jabatan: string;
  status: SignStatus;
  waktu?: string | undefined;
}

export type ReceiptKind = "diterima" | "dikembalikan";
export interface Receipt {
  id: string;
  nama: string;
  wa: string;
  unit: string;
  lokasi: string;
  jenis: ReceiptKind;
  catatan: string;
  waktu: string;
  void?: { alasan: string; waktu: string } | undefined;
}

export interface Activity {
  id: string;
  waktu: string;
  teks: string;
  tipe: "buat" | "terima" | "paraf" | "ttd" | "void" | "selesai" | "batal" | "edit";
}

export type DocLifecycle = "aktif" | "selesai" | "batal";

export interface Doc {
  id: string;
  nomor: string;
  judul: string;
  kategori: string;
  pemilik: string;
  rute: string[];
  tenggat: string; // yyyy-mm-dd
  pin: string;
  dibuat: string;
  lifecycle: DocLifecycle;
  alasanBatal?: string | undefined;
  paraf: Signer[];
  ttd: Signer[];
  penerimaan: Receipt[];
  aktivitas: Activity[];
}

export type Stage =
  | "Menunggu Penerimaan"
  | "Proses Paraf"
  | "Proses TTD"
  | "Menunggu Pengembalian"
  | "Siap Diselesaikan"
  | "Selesai"
  | "Dibatalkan";

/** Mockup "today" so the dummy data stays consistent. */
export const TODAY = "2026-10-21";

export const uid = () => Math.random().toString(36).slice(2, 10);

export const validReceipts = (d: Doc) => d.penerimaan.filter((r) => !r.void);

/** Posisi terakhir = penerimaan valid terakhir (void diabaikan). */
export const lastPosition = (d: Doc): Receipt | undefined => {
  const v = validReceipts(d);
  return v.length ? [...v].sort((a, b) => a.waktu.localeCompare(b.waktu)).at(-1) : undefined;
};

export const progress = (list: Signer[]) => {
  const done = list.filter((s) => s.status === "selesai").length;
  return { done, total: list.length, pct: list.length ? Math.round((done / list.length) * 100) : 100 };
};

export const isComplete = (list: Signer[]) => list.every((s) => s.status === "selesai");

export const hasReturn = (d: Doc) => validReceipts(d).some((r) => r.jenis === "dikembalikan");

export const stageOf = (d: Doc): Stage => {
  if (d.lifecycle === "batal") return "Dibatalkan";
  if (d.lifecycle === "selesai") return "Selesai";
  if (validReceipts(d).length === 0) return "Menunggu Penerimaan";
  if (!isComplete(d.paraf)) return "Proses Paraf";
  if (!isComplete(d.ttd)) return "Proses TTD";
  return "Siap Diselesaikan";
};

export const isLate = (d: Doc) => d.lifecycle === "aktif" && !!d.tenggat && d.tenggat < TODAY;

/** Daftar kekurangan sebelum dokumen boleh diselesaikan. Kosong = boleh. */
export const completionGaps = (d: Doc): string[] => {
  const gaps: string[] = [];
  d.paraf.filter((s) => s.status !== "selesai").forEach((s) => gaps.push(`Paraf belum selesai: ${s.nama} (${s.jabatan})`));
  d.ttd.filter((s) => s.status !== "selesai").forEach((s) => gaps.push(`TTD belum selesai: ${s.nama} (${s.jabatan})`));
  if (!validReceipts(d).length) gaps.push("Belum ada catatan penerimaan dokumen");
  return gaps;
};

export type ReceiptInput = Pick<Receipt, "nama" | "wa" | "unit" | "lokasi" | "jenis" | "catatan">;
export const receiptErrors = (rc: ReceiptInput): Partial<Record<keyof ReceiptInput, string>> => {
  const errors: Partial<Record<keyof ReceiptInput, string>> = {};
  if (!rc.nama.trim()) errors.nama = "Nama penerima wajib diisi.";
  if (!/^\+?\d[\d\s()-]{7,18}$/.test(rc.wa.trim())) errors.wa = "Nomor telepon tidak valid.";
  if (!rc.unit.trim()) errors.unit = "Nama tim penerima wajib diisi.";
  if (!rc.lokasi.trim()) errors.lokasi = "Lokasi penerimaan wajib diisi.";
  if (!rc.catatan.trim()) errors.catatan = "Deskripsi penerimaan wajib diisi.";
  return errors;
};
export const documentErrors = (judul: string, tim: string, paraf: Signer[], ttd: Signer[]) => {
  const errors: { judul?: string; tim?: string; list?: string } = {};
  if (!judul.trim()) errors.judul = "Judul dokumen wajib diisi.";
  if (!tim.trim()) errors.tim = "Nama tim wajib diisi.";
  if ([...paraf, ...ttd].some((s) => !s.nama.trim())) errors.list = "Lengkapi nama pihak atau hapus baris kosong.";
  return errors;
};
export const trackingPath = (nomor: string) => `/track?doc=${encodeURIComponent(nomor)}`;
export const unlockDocument = (docs: Doc[], nomor: string, pin: string) =>
  docs.find((d) => d.nomor.toLowerCase() === nomor.trim().toLowerCase() && d.pin === pin.trim());
export const appendReceipt = (doc: Doc, input: ReceiptInput, waktu: string): Doc => {
  if (Object.keys(receiptErrors(input)).length || doc.lifecycle === "batal") return doc;
  const receipt: Receipt = { ...input, id: uid(), waktu };
  return { ...doc, penerimaan: [...doc.penerimaan, receipt], aktivitas: [
    { id: uid(), waktu, teks: `Diterima oleh ${input.nama} — ${input.wa}, ${input.unit}, ${input.lokasi}. ${input.catatan}`, tipe: "terima" },
    ...doc.aktivitas,
  ] };
};
export const replaceSigners = (doc: Doc, kind: "paraf" | "ttd", list: Signer[], waktu: string): Doc => {
  if (list.some((s) => !s.nama.trim()) || doc.lifecycle === "batal") return doc;
  const updated = list.map((s) => {
    const existing = doc[kind].find((p) => p.id === s.id);
    return { ...s, nama: s.nama.trim(), jabatan: s.jabatan.trim(), status: existing?.status ?? "belum", waktu: existing?.waktu };
  });
  const describe = (items: Signer[]) => items.map((s) => `${s.nama} (${s.jabatan || "—"}; ${s.status}${s.waktu ? `; ${s.waktu}` : ""})`).join(", ") || "kosong";
  return { ...doc, [kind]: updated, aktivitas: [{ id: uid(), waktu, teks: `Daftar ${kind === "paraf" ? "paraf" : "TTD"} diperbarui. Sebelumnya: ${describe(doc[kind])}. Sekarang: ${describe(updated)}.`, tipe: "edit" }, ...doc.aktivitas] };
};

export const fmtDate = (iso: string) =>
  new Date(iso.length === 10 ? iso + "T00:00:00" : iso).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
export const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const s = (nama: string, jabatan: string, status: SignStatus = "belum", waktu?: string): Signer => ({
  id: uid(),
  nama,
  jabatan,
  status,
  waktu,
});
const r = (
  nama: string,
  unit: string,
  lokasi: string,
  waktu: string,
  jenis: ReceiptKind = "diterima",
  extra: Partial<Receipt> = {},
): Receipt => ({ id: uid(), nama, wa: "0812" + Math.floor(10000000 + Math.random() * 89999999), unit, lokasi, catatan: "Dokumen fisik diterima untuk diteruskan ke pihak terkait.", waktu, jenis, ...extra });

export const SEED: Doc[] = [
  {
    id: "d1",
    nomor: "RPA-2026-001",
    judul: "Dokumen Pengajuan Perubahan RPA",
    kategori: "Pengajuan",
    pemilik: "Tim RPA",
    rute: ["Tim RPA", "Sekretaris Tim A", "Kepala Divisi"],
    tenggat: "2026-10-28",
    pin: "4821",
    dibuat: "2026-10-14T09:00:00",
    lifecycle: "aktif",
    paraf: [s("Andi Pratama", "Kepala Bagian Operasional", "selesai", "2026-10-16T10:20:00"), s("Budi Santoso", "Kepala Bagian Risiko")],
    ttd: [s("Candra Wijaya", "Kepala Divisi")],
    penerimaan: [
      r("Rina Marlina", "Sekretariat Operasional", "Lantai 2", "2026-10-15T08:45:00"),
      r("Sari Dewi", "Sekretaris Tim A", "Lantai 3", "2026-10-17T13:10:00"),
    ],
    aktivitas: [],
  },
  {
    id: "d2",
    nomor: "RPA-2026-002",
    judul: "Nota Dinas Implementasi Bot Rekonsiliasi",
    kategori: "Nota Dinas",
    pemilik: "Tim RPA",
    rute: ["Tim RPA", "Divisi Akuntansi"],
    tenggat: "2026-10-30",
    pin: "1934",
    dibuat: "2026-10-19T10:00:00",
    lifecycle: "aktif",
    paraf: [s("Dewi Lestari", "Kepala Bagian Akuntansi")],
    ttd: [s("Eko Saputra", "Kepala Divisi Akuntansi")],
    penerimaan: [],
    aktivitas: [],
  },
  {
    id: "d3",
    nomor: "RPA-2026-003",
    judul: "Berita Acara UAT Bot Pelaporan Harian",
    kategori: "Berita Acara",
    pemilik: "Tim RPA",
    rute: ["Tim RPA", "Divisi TI", "Kepala Divisi"],
    tenggat: "2026-10-25",
    pin: "7702",
    dibuat: "2026-10-12T14:00:00",
    lifecycle: "aktif",
    paraf: [s("Fajar Nugroho", "Kepala Bagian TI", "selesai", "2026-10-15T09:00:00"), s("Gita Permata", "QA Lead", "selesai", "2026-10-16T11:30:00")],
    ttd: [s("Hendra Kusuma", "Kepala Divisi TI"), s("Indah Sari", "Kepala Divisi Operasional")],
    penerimaan: [r("Joko Widodo", "Sekretariat TI", "Lantai 5", "2026-10-14T10:00:00"), r("Kartika Ayu", "Sekretaris Divisi", "Lantai 7", "2026-10-18T15:20:00")],
    aktivitas: [],
  },
  {
    id: "d4",
    nomor: "RPA-2026-004",
    judul: "Surat Persetujuan Lisensi Tools RPA",
    kategori: "Surat",
    pemilik: "Tim RPA",
    rute: ["Tim RPA", "Divisi Pengadaan"],
    tenggat: "2026-10-24",
    pin: "5510",
    dibuat: "2026-10-08T09:30:00",
    lifecycle: "aktif",
    paraf: [s("Lukman Hakim", "Kepala Bagian Pengadaan", "selesai", "2026-10-10T10:00:00")],
    ttd: [s("Maya Anggraini", "Kepala Divisi Pengadaan", "selesai", "2026-10-13T16:00:00")],
    penerimaan: [r("Nanda Putri", "Sekretariat Pengadaan", "Lantai 4", "2026-10-09T09:00:00")],
    aktivitas: [],
  },
  {
    id: "d5",
    nomor: "RPA-2026-005",
    judul: "Laporan Evaluasi Kinerja Bot Q3",
    kategori: "Laporan",
    pemilik: "Tim RPA",
    rute: ["Tim RPA", "Direksi"],
    tenggat: "2026-10-10",
    pin: "3088",
    dibuat: "2026-09-28T09:00:00",
    lifecycle: "selesai",
    paraf: [s("Oki Setiawan", "Kepala Bagian Perencanaan", "selesai", "2026-10-01T09:00:00")],
    ttd: [s("Putri Rahayu", "Direktur Operasional", "selesai", "2026-10-05T14:00:00")],
    penerimaan: [
      r("Qori Amalia", "Sekretariat Direksi", "Lantai 20", "2026-09-30T10:00:00"),
      r("Tim RPA", "Tim RPA", "Lantai 3", "2026-10-07T11:00:00", "dikembalikan"),
    ],
    aktivitas: [],
  },
  {
    id: "d6",
    nomor: "RPA-2026-006",
    judul: "Pengajuan Anggaran Infrastruktur Server Bot",
    kategori: "Pengajuan",
    pemilik: "Tim RPA",
    rute: ["Tim RPA", "Divisi Keuangan", "Kepala Divisi"],
    tenggat: "2026-10-15",
    pin: "6247",
    dibuat: "2026-10-01T08:00:00",
    lifecycle: "aktif",
    paraf: [s("Rudi Hartono", "Kepala Bagian Anggaran"), s("Siska Melati", "Kepala Bagian Keuangan")],
    ttd: [s("Taufik Hidayat", "Kepala Divisi Keuangan")],
    penerimaan: [
      r("Umar Faruq", "Sekretariat Keuangan", "Lantai 6", "2026-10-03T09:30:00"),
      r("Vina Oktaviani", "Staf Anggaran", "Lantai 6", "2026-10-06T10:15:00", "diterima", {
        void: { alasan: "Salah input nomor tracking oleh penerima", waktu: "2026-10-06T12:00:00" },
      }),
    ],
    aktivitas: [],
  },
  {
    id: "d7",
    nomor: "RPA-2026-007",
    judul: "SOP Penanganan Exception Bot",
    kategori: "SOP",
    pemilik: "Tim RPA",
    rute: ["Tim RPA", "Kepatuhan"],
    tenggat: "2026-11-05",
    pin: "9015",
    dibuat: "2026-10-20T09:00:00",
    lifecycle: "aktif",
    paraf: [s("Wulan Sari", "Kepala Bagian Kepatuhan", "selesai", "2026-10-21T09:00:00")],
    ttd: [],
    penerimaan: [r("Yoga Pratama", "Sekretariat Kepatuhan", "Lantai 8", "2026-10-20T14:00:00")],
    aktivitas: [],
  },
];

// Build initial activity logs from seed data
for (const d of SEED) {
  const a: Activity[] = [{ id: uid(), waktu: d.dibuat, teks: `Dokumen dibuat oleh Admin`, tipe: "buat" }];
  for (const rc of d.penerimaan) {
    a.push({ id: uid(), waktu: rc.waktu, teks: `${rc.jenis === "dikembalikan" ? "Dikembalikan ke Tim RPA" : "Diterima"} oleh ${rc.nama} — ${rc.unit}, ${rc.lokasi}`, tipe: "terima" });
    if (rc.void) a.push({ id: uid(), waktu: rc.void.waktu, teks: `Penerimaan oleh ${rc.nama} di-void: ${rc.void.alasan}`, tipe: "void" });
  }
  for (const p of d.paraf) if (p.waktu) a.push({ id: uid(), waktu: p.waktu, teks: `Paraf ${p.nama} ditandai selesai`, tipe: "paraf" });
  for (const p of d.ttd) if (p.waktu) a.push({ id: uid(), waktu: p.waktu, teks: `TTD ${p.nama} ditandai selesai`, tipe: "ttd" });
  if (d.lifecycle === "selesai") a.push({ id: uid(), waktu: "2026-10-08T09:00:00", teks: "Dokumen diselesaikan oleh Admin", tipe: "selesai" });
  d.aktivitas = a.sort((x, y) => y.waktu.localeCompare(x.waktu));
}
