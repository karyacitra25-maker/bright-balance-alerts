import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/components/pages/HomePage";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: "MailMX - Platform Stor Gmail Enterprise" },
      { name: "description", content: "MailMX - Platform setor Gmail terpercaya dengan notifikasi saldo real-time dan program referral." },
      { property: "og:title", content: "MailMX - Platform Stor Gmail Enterprise" },
      { property: "og:description", content: "MailMX - Platform setor Gmail terpercaya dengan notifikasi saldo real-time dan program referral." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});
