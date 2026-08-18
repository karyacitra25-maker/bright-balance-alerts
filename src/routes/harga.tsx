import { createFileRoute } from "@tanstack/react-router";
import { HargaPage } from "@/components/pages/HargaPage";

export const Route = createFileRoute("/harga")({
  component: HargaPage,
  head: () => ({
    meta: [
      { title: "Harga - MailMX" },
      { name: "description", content: "Tiering harga setoran Gmail MailMX." },
      { property: "og:title", content: "Harga - MailMX" },
      { property: "og:description", content: "Tiering harga setoran Gmail MailMX." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});
