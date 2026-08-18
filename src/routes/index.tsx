import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Wallet,
  ShieldCheck,
  Gift,
  Send,
  Clock,
  MessageCircle,
  History,
  ArrowRight,
  BadgeCheck,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { LoginCard } from "@/components/LoginCard";
import { WithdrawModal } from "@/components/WithdrawModal";
import { rupiah, formatDate } from "@/lib/format";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard Saldo — MailMX" },
      {
        name: "description",
        content:
          "Pantau saldo, riwayat setoran gmail, penarikan, dan bonus referral MailMX secara realtime.",
      },
      { property: "og:title", content: "Dashboard Saldo — MailMX" },
      {
        property: "og:description",
        content: "Pantau saldo, setoran, penarikan, dan bonus referral MailMX secara realtime.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { user, loading, balance, userDoc, submissions, withdrawals } = useAuth();
  const [wdOpen, setWdOpen] = useState(false);

  if (loading) {
    return <p className="text-center text-xs text-muted-foreground py-20">Memuat sesi...</p>;
  }
  if (!user) return <LoginCard />;

  const referrals = userDoc?.referrals || [];
  const bonusTotal = referrals.reduce((s, r) => s + (r.bonusEarned || 0), 0);
  const bonusGivenCount = referrals.filter((r) => r.bonusGiven).length;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Banner
          tone="warning"
          icon={<Clock className="w-5 h-5" />}
          title="Jam Kerja Penarikan"
          desc="Proses penarikan saldo 10-20 menit."
        />
        <button
          onClick={() =>
            window.open("https://whatsapp.com/channel/0029VbBfreU3QxS0kwO6jl36", "_blank")
          }
          className="text-left"
        >
          <Banner
            tone="success"
            icon={<MessageCircle className="w-5 h-5" />}
            title="Komunitas Resmi WhatsApp"
            desc="Info harga, bonus, dan bantuan admin tercepat."
          />
        </button>
      </div>

      <div className="panel-card rounded-3xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={user.photoURL || "https://api.dicebear.com/9.x/initials/svg?seed=MX"}
              alt="Foto profil"
              className="w-12 h-12 rounded-2xl object-cover ring-2 ring-brand/40"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-success border-2 border-background" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-violet">
              Pengguna Aktif
            </p>
            <h1 className="text-lg font-extrabold tracking-tight">
              {user.displayName || user.email}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-brand-soft border border-brand/30 text-xs">
          Rate : <strong className="text-gradient-brand font-black">Rp 4.500 - Rp 6.000</strong> /
          Akun
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          tone="success"
          label="Total Saldo Saya"
          icon={<Wallet className="w-4 h-4" />}
          value={rupiah(balance)}
          action={
            <button
              onClick={() => setWdOpen(true)}
              className="mt-4 w-full py-2.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-success to-info text-background glow-success active:scale-95 transition flex items-center justify-center gap-2"
            >
              Tarik Saldo <ArrowRight className="w-3.5 h-3.5" />
            </button>
          }
        />
        <StatCard
          tone="info"
          label="Akun Terverifikasi"
          icon={<ShieldCheck className="w-4 h-4" />}
          value={<span className="text-xs font-mono break-all">{user.email}</span>}
          action={
            <span className="mt-4 flex items-center gap-2 text-[11px] font-bold text-success bg-success-soft border border-success/30 py-1.5 px-3 rounded-xl w-fit">
              <BadgeCheck className="w-3.5 h-3.5" /> Terverifikasi
            </span>
          }
        />
        <StatCard
          tone="violet"
          label="Bonus Referral"
          icon={<Gift className="w-4 h-4" />}
          value={rupiah(bonusTotal)}
          sub={`${bonusGivenCount} dari ${referrals.length} teman sudah bonus`}
          action={
            <Link
              to="/referral"
              className="mt-4 w-full py-2.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-violet to-pink text-primary-foreground glow-violet active:scale-95 transition flex items-center justify-center"
            >
              Lihat Referral
            </Link>
          }
        />
        <StatCard
          tone="brand"
          label="Aksi Cepat"
          icon={<Send className="w-4 h-4" />}
          value={<span className="text-base font-bold">Stor Gmail Sekarang</span>}
          sub="Pembayaran 1x24 jam setelah close."
          action={
            <Link
              to="/stor"
              className="mt-4 w-full py-2.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-brand to-violet text-primary-foreground glow-brand active:scale-95 transition flex items-center justify-center"
            >
              Buka Form
            </Link>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="panel-card rounded-3xl p-6">
          <h2 className="font-bold text-sm flex items-center gap-2 mb-4">
            <History className="w-4 h-4 text-brand" /> Riwayat Setoran Gmail
          </h2>
          <div className="space-y-3">
            {submissions.length === 0 && (
              <p className="p-6 text-center text-xs text-muted-foreground italic">
                Belum ada riwayat setoran.
              </p>
            )}
            {submissions.map((s) => {
              const good = s.stats?.good || 0;
              const rejected =
                (s.stats?.disabled || 0) + (s.stats?.verif || 0) + (s.stats?.notExist || 0);
              const proses = !s.status || s.status === "Proses";
              return (
                <div
                  key={s.id}
                  className="p-4 rounded-2xl bg-surface/60 border border-border flex items-center justify-between gap-3"
                >
                  <div>
                    <p className="text-xs font-bold">{s.count} Total Disetor</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {formatDate(s.createdAt)} ·{" "}
                      {proses ? (
                        <span className="text-warning">Menunggu pengecekan...</span>
                      ) : (
                        <>
                          <span className="text-success font-bold">{good} Good</span> |{" "}
                          <span className="text-destructive font-bold">{rejected} Ditolak</span>
                        </>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    {proses ? (
                      <span className="text-[11px] italic text-muted-foreground">
                        Est. {rupiah(s.totalRp)}
                      </span>
                    ) : (
                      <span className="text-sm font-black text-success">
                        + {rupiah(s.creditedRp)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="panel-card rounded-3xl p-6">
          <h2 className="font-bold text-sm flex items-center gap-2 mb-4">
            <Wallet className="w-4 h-4 text-success" /> Riwayat Penarikan Saldo
          </h2>
          <div className="space-y-3">
            {withdrawals.length === 0 && (
              <p className="p-6 text-center text-xs text-muted-foreground italic">
                Belum ada riwayat penarikan.
              </p>
            )}
            {withdrawals.map((w) => (
              <div
                key={w.id}
                className="p-4 rounded-2xl bg-surface/60 border border-border flex items-center justify-between gap-3"
              >
                <div>
                  <p className="text-xs font-bold">{w.walletType}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {formatDate(w.createdAt)} · {w.walletNumber}
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <span className="block text-sm font-black text-info">{rupiah(w.amount)}</span>
                  <StatusBadge status={w.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <WithdrawModal open={wdOpen} onClose={() => setWdOpen(false)} />
    </>
  );
}

function StatusBadge({ status }: { status?: string }) {
  const tone =
    status === "Sukses"
      ? "text-success bg-success-soft border-success/30"
      : status === "Ditolak"
        ? "text-destructive bg-destructive/10 border-destructive/30"
        : "text-warning bg-warning-soft border-warning/30";
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${tone}`}>
      {status || "Proses"}
    </span>
  );
}

const toneMap = {
  success: "from-success/20 via-transparent to-info/10 border-success/30 text-success",
  info: "from-info/20 via-transparent to-brand/10 border-info/30 text-info",
  violet: "from-violet/20 via-transparent to-pink/15 border-violet/30 text-violet",
  brand: "from-brand/20 via-transparent to-violet/15 border-brand/30 text-brand",
  warning: "from-warning/20 via-transparent to-pink/10 border-warning/30 text-warning",
} as const;

function StatCard({
  tone,
  label,
  icon,
  value,
  sub,
  action,
}: {
  tone: keyof typeof toneMap;
  label: string;
  icon: React.ReactNode;
  value: React.ReactNode;
  sub?: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      className={`panel-card panel-hover rounded-3xl p-6 flex flex-col justify-between bg-gradient-to-br ${toneMap[tone]}`}
    >
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider">{label}</span>
          <span className="w-9 h-9 rounded-xl border flex items-center justify-center">{icon}</span>
        </div>
        <div className="text-2xl font-black tracking-tight text-foreground">{value}</div>
        {sub && <p className="text-[11px] text-muted-foreground mt-1">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

function Banner({
  tone,
  icon,
  title,
  desc,
}: {
  tone: keyof typeof toneMap;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div
      className={`panel-card rounded-2xl p-4 flex items-center gap-4 bg-gradient-to-r ${toneMap[tone]} h-full`}
    >
      <span className="p-3 rounded-xl border shrink-0">{icon}</span>
      <div>
        <h3 className="font-bold text-xs uppercase tracking-wider text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
      </div>
    </div>
  );
}
