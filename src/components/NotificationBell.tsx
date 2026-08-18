import { Bell, Gift, Wallet, Info, ArrowDownToLine } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { markAllNotificationsRead, markNotificationRead } from "@/lib/notifications";
import { formatDateTime } from "@/lib/format";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const iconFor = {
  balance: Wallet,
  referral: Gift,
  withdraw: ArrowDownToLine,
  info: Info,
} as const;

const toneFor = {
  balance: "text-success bg-success-soft border-success/30",
  referral: "text-violet bg-violet-soft border-violet/30",
  withdraw: "text-info bg-info-soft border-info/30",
  info: "text-brand bg-brand-soft border-brand/30",
} as const;

export function NotificationBell() {
  const { user, notifications, unreadCount } = useAuth();
  if (!user) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          aria-label="Notifikasi"
          className="relative w-10 h-10 rounded-xl panel-card flex items-center justify-center text-foreground/80 hover:text-foreground transition"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-pink text-[10px] font-black text-background flex items-center justify-center glow-violet">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[320px] p-0 panel-card border-0 rounded-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="text-xs font-extrabold uppercase tracking-wider text-gradient-brand">
            Notifikasi
          </span>
          {unreadCount > 0 && (
            <button
              onClick={() => void markAllNotificationsRead(user.uid)}
              className="text-[11px] font-bold text-brand hover:underline"
            >
              Tandai dibaca
            </button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto custom-scrollbar divide-y divide-border">
          {notifications.length === 0 && (
            <p className="p-6 text-center text-xs text-muted-foreground italic">
              Belum ada notifikasi.
            </p>
          )}
          {notifications.map((n) => {
            const Icon = iconFor[n.type] ?? Info;
            return (
              <button
                key={n.id}
                onClick={() => void markNotificationRead(user.uid, n.id)}
                className={`w-full text-left p-3.5 flex gap-3 transition hover:bg-surface-2/60 ${
                  n.read ? "opacity-70" : ""
                }`}
              >
                <span
                  className={`w-9 h-9 shrink-0 rounded-xl border flex items-center justify-center ${toneFor[n.type] ?? toneFor.info}`}
                >
                  <Icon className="w-4 h-4" />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-xs font-bold text-foreground">{n.title}</span>
                  <span className="block text-[11px] text-muted-foreground leading-relaxed">
                    {n.message}
                  </span>
                  <span className="block text-[10px] text-muted-foreground/70 mt-1">
                    {formatDateTime(n.createdAt)}
                  </span>
                </span>
                {!n.read && <span className="w-2 h-2 rounded-full bg-pink mt-1.5 shrink-0" />}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
