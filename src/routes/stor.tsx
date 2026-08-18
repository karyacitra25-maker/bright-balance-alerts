import { createFileRoute } from "@tanstack/react-router";
import { StorPage } from "@/components/pages/StorPage";

export const Route = createFileRoute("/stor")({
  component: StorPage,
  head: () => ({
    meta: [
      { title: "Stor Gmail - MailMX" },
      { name: "description", content: "Kirim setoran Gmail ke MailMX dan dapatkan saldo." },
      { property: "og:title", content: "Stor Gmail - MailMX" },
      { property: "og:description", content: "Kirim setoran Gmail ke MailMX dan dapatkan saldo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});
