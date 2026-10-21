import { describe, expect, it } from "vitest";
import { SEED, lastPosition, completionGaps, stageOf, type Doc } from "@/lib/dts-data";

const clone = (id: string): Doc => structuredClone(SEED.find((d) => d.id === id)!);

describe("DTS rules", () => {
  it("posisi terakhir mengabaikan penerimaan void", () => {
    const d = clone("d6");
    expect(lastPosition(d)?.nama).toBe("Umar Faruq");
  });

  it("void penerimaan terakhir mengembalikan posisi ke sebelumnya", () => {
    const d = clone("d1");
    d.penerimaan[1].void = { alasan: "salah", waktu: "2026-10-18T00:00:00" };
    expect(lastPosition(d)?.nama).toBe("Rina Marlina");
  });

  it("tidak bisa diselesaikan tanpa penerimaan pengembalian", () => {
    const d = clone("d4"); // paraf & TTD lengkap
    expect(completionGaps(d)).toEqual(["Belum ada penerimaan pengembalian ke Tim RPA"]);
    expect(stageOf(d)).toBe("Menunggu Pengembalian");
  });

  it("tidak bisa diselesaikan bila paraf belum lengkap", () => {
    expect(completionGaps(clone("d1")).some((g) => g.includes("Budi Santoso"))).toBe(true);
  });
});
