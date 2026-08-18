import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/harga")({
  head: () => ({
    meta: [
      { title: "Harga & Tier Rate — MailMX" },
      {
        name: "description",
        content:
          "Daftar tier harga stor gmail MailMX: Rp 4.500 sampai Rp 6.000 per akun sesuai jumlah setoran.",
      },
      { property: "og:title", content: "Harga & Tier Rate — MailMX" },
      {
        property: "og:description",
        content: "Rate stor gmail MailMX naik sesuai jumlah akun yang kamu setor.",
      },
    ],
  }),
  component: HargaPage,
});

const TIERS = [
  {
    badge: "Regular Tier",
    title: "1+ Gmail",
    price: "Rp 4.500",
    tone: "from-info/20 to-transparent border-info/30 text-info",
    btn: "from-info to-brand",
  },
  {
    badge: "Medium Tier",
    title: "10+ Gmail",
    price: "Rp 5.000",
    tone: "from-brand/20 to-transparent border-brand/30 text-brand",
    btn: "from-brand to-violet",
  },
  {
    badge: "Pro Tier",
    title: "20+ Gmail",
    price: "Rp 5.500",
    tone: "from-violet/20 to-transparent border-violet/30 text-violet",
    btn: "from-violet to-pink",
  },
  {
    badge: "Sultan Tier",
    title: "30+ Gmail",
    price: "Rp 6.000",
    tone: "from-warning/25 to-transparent border-warning/40 text-warning",
    btn: "from-warning to-pink",
  },
];

function HargaPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-black tracking-tight text-gradient-brand">
          Tiering & Rate Transaksi
        </h1>
        <p className="text-xs text-muted-foreground">
          Semakin banyak gmail yang disetor, semakin tinggi rate per akun.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {TIERS.map((t) => (
          <div
            key={t.title}
            className={`panel-card panel-hover rounded-3xl p-6 flex flex-col justify-between gap-4 bg-gradient-to-br ${t.tone}`}
          >
            <div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border">
                {t.badge}
              </span>
              <h2 className="text-lg font-bold mt-3 text-foreground">{t.title}</h2>
              <p className="text-2xl font-black my-1 text-foreground">
                {t.price}{" "}
                <span className="text-xs font-normal text-muted-foreground">/akun</span>
              </p>
            </div>
            <Link
              to="/stor"
              className={`w-full py-2.5 rounded-xl text-xs font-extrabold text-center bg-gradient-to-r ${t.btn} text-primary-foreground active:scale-95 transition`}
            >
              Stor Sekarang
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
