import { createFileRoute } from "@tanstack/react-router";
import { ReferralPage } from "@/components/pages/ReferralPage";

export const Route = createFileRoute("/referral")({
  component: ReferralPage,
  head: () => ({
    meta: [
      { title: "Referral - MailMX" },
      { name: "description", content: "Program referral MailMX. Ajak teman dan dapatkan bonus." },
      { property: "og:title", content: "Referral - MailMX" },
      { property: "og:description", content: "Program referral MailMX. Ajak teman dan dapatkan bonus." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});
