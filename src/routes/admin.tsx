import { createFileRoute } from "@tanstack/react-router";
import { AdminPage } from "@/components/pages/AdminPage";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({
    meta: [
      { title: "Admin Panel - MailMX" },
      { name: "description", content: "Panel admin MailMX untuk kelola setoran dan withdrawal." },
      { property: "og:title", content: "Admin Panel - MailMX" },
      { property: "og:description", content: "Panel admin MailMX untuk kelola setoran dan withdrawal." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});
