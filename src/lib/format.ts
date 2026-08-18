export function rupiah(value: number | undefined | null): string {
  return `Rp ${(value || 0).toLocaleString("id-ID")}`;
}

export function calculateRates(count: number): { price: number; total: number } {
  let price = 0;
  if (count >= 30) price = 6000;
  else if (count >= 20) price = 5500;
  else if (count >= 10) price = 5000;
  else if (count >= 1) price = 4500;
  return { price, total: count * price };
}

export function formatDate(ts?: number): string {
  if (!ts) return "-";
  return new Date(ts).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(ts?: number): string {
  if (!ts) return "-";
  return new Date(ts).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
