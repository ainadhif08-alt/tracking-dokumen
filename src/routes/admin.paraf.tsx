import { createFileRoute } from "@tanstack/react-router";
import { TaskPage } from "@/components/dts/tasks";

export const Route = createFileRoute("/admin/paraf")({
  head: () => ({
    meta: [
      { title: "Tugas Paraf — Document Tracking System" },
      { name: "description", content: "Daftar paraf yang belum dan sudah selesai di semua dokumen." },
      { property: "og:title", content: "Tugas Paraf — Document Tracking System" },
      { property: "og:description", content: "Daftar paraf yang belum dan sudah selesai di semua dokumen." },
    ],
  }),
  component: () => <TaskPage kind="paraf" />,
});
