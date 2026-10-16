// Цена в сомах/долларах и дата — как на сайте (пока только ru)
export function formatPrice(price: number | null, currency: string) {
  if (price == null) return "Договорная";
  const n = new Intl.NumberFormat("ru-RU").format(price);
  return currency === "USD" ? `$${n}` : `${n} сом`;
}

export function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
  } catch {
    return "";
  }
}
