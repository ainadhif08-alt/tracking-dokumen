import { createFileRoute } from "@tanstack/react-router";
import { TaskPage } from "@/components/dts/tasks";

export const Route = createFileRoute("/admin/ttd")({
  head: () => ({
    meta: [
      { title: "Tugas TTD — Document Tracking System" },
      { name: "description", content: "Daftar tanda tangan yang belum dan sudah selesai di semua dokumen." },
      { property: "og:title", content: "Tugas TTD — Document Tracking System" },
      { property: "og:description", content: "Daftar tanda tangan yang belum dan sudah selesai di semua dokumen." },
    ],
  }),
  component: () => <TaskPage kind="ttd" />,
});
