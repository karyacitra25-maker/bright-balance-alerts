import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Send, Tag, Users, LogOut, MailOpen, Shield } from "lucide-react";
import type { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { NotificationBell } from "@/components/NotificationBell";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/stor", label: "Stor Gmail", icon: Send },
  { to: "/harga", label: "Harga", icon: Tag },
  { to: "/referral", label: "Referral", icon: Users },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { user, logout, isAdmin } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="sticky top-0 z-50 border-b border-border bg-background/70 backdrop-blur-2xl px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 shrink-0 group">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand via-violet to-pink flex items-center justify-center text-primary-foreground glow-brand group-hover:scale-105 transition">
              <MailOpen className="w-5 h-5" />
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-lg font-extrabold tracking-tight text-gradient-brand">
                MailMX
              </span>
              <span className="text-[10px] font-bold tracking-widest uppercase text-brand">
                Platform stor gmail
              </span>
            </span>
          </Link>

          {user && (
            <div className="hidden md:flex items-center gap-1 p-1.5 rounded-2xl panel-card">
              {NAV.map(({ to, label, icon: Icon }) => {
                const active = pathname === to;
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                      active
                        ? "bg-gradient-to-r from-brand to-violet text-primary-foreground glow-brand"
                        : "text-muted-foreground hover:text-foreground hover:bg-surface-2/70"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </Link>
                );
              })}
            </div>
          )}

          <div className="flex items-center gap-2 shrink-0">
            {user ? (
              <>
                <NotificationBell />
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-pink bg-pink-soft border border-pink/30 hover:bg-pink/20 transition"
                  >
                    <Shield className="w-3.5 h-3.5" /> Admin
                  </Link>
                )}
                <img
                  src={user.photoURL || "https://api.dicebear.com/9.x/initials/svg?seed=MX"}
                  alt="Foto profil"
                  className="w-9 h-9 rounded-xl object-cover ring-2 ring-brand/40"
                />
                <button
                  onClick={() => void logout()}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground panel-card flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" /> Keluar
                </button>
              </>
            ) : null}
          </div>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 mb-24 md:mb-8 space-y-6">
        {children}
      </main>

      {user && (
        <div className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-background/85 backdrop-blur-2xl border-t border-border px-3 py-2 flex justify-around items-center">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex flex-col items-center gap-1 text-[10px] font-bold py-1.5 px-3 rounded-xl transition ${
                  active
                    ? "text-brand bg-brand-soft border border-brand/30"
                    : "text-muted-foreground"
                }`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
