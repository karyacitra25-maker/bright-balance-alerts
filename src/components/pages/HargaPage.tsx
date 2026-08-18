import { Tag } from "lucide-react";
import { Link } from "@tanstack/react-router";

const TIERS = [
  { name: "Regular Tier", min: "1+ Gmail", price: 4500, badge: "bg-surface-2 text-foreground border-border", button: "bg-surface-2 hover:bg-surface text-foreground" },
  { name: "Medium Tier", min: "10+ Gmail", price: 5000, badge: "text-brand bg-brand-soft border-brand/30", button: "bg-brand hover:bg-brand/90 text-primary-foreground glow-brand" },
  { name: "Pro Tier", min: "20+ Gmail", price: 5500, badge: "text-info bg-info-soft border-info/30", button: "bg-info hover:bg-info/90 text-background" },
  { name: "Sultan Tier", min: "30+ Gmail", price: 6000, badge: "bg-gradient-to-r from-warning to-orange-400 text-background", button: "bg-gradient-to-r from-warning to-orange-400 text-background glow-violet" },
];

export function HargaPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-1 mb-6">
        <h1 className="text-2xl font-black text-gradient-brand tracking-tight">Tiering & Rate Transaksi</h1>
        <p className="text-xs text-muted-foreground">Semakin banyak Gmail yang disetor, semakin tinggi nilai per akun.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {TIERS.map((t) => (
          <div key={t.name} className="panel-card panel-hover p-6 rounded-3xl space-y-4">
            <div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${t.badge}`}>
                {t.name}
              </span>
              <h3 className="text-lg font-bold text-foreground mt-3">{t.min}</h3>
              <div className="text-2xl font-black text-success my-1">
                Rp {t.price.toLocaleString("id-ID")} <span className="text-xs text-muted-foreground font-normal">/akun</span>
              </div>
            </div>
            <Link
              to="/stor"
              className={`w-full block text-center py-2.5 text-xs font-bold rounded-xl transition ${t.button}`}
            >
              Stor Sekarang
            </Link>
          </div>
        ))}
      </div>

      <div className="panel-card rounded-3xl p-6 flex items-center gap-4 border-l-4 border-l-warning/80">
        <div className="p-3 bg-warning/10 border border-warning/20 rounded-xl text-warning shrink-0">
          <Tag className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-xs text-foreground uppercase tracking-wider">Perhitungan Otomatis</h4>
          <p className="text-xs text-muted-foreground mt-0.5">Total estimasi dihitung otomatis saat mengetik daftar Gmail.</p>
        </div>
      </div>
    </div>
  );
}
