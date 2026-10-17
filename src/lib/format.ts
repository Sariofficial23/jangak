// Название из таблицы с колонками name_ru / name_ky / name_uz
export function localName(
  row: { name_ru: string; name_ky: string; name_uz: string } | null | undefined,
  locale: string,
) {
  if (!row) return "";
  if (locale === "ky") return row.name_ky;
  if (locale === "uz") return row.name_uz;
  return row.name_ru;
}

export function formatPrice(price: number | null, currency: string) {
  if (price === null) return "";
  const n = new Intl.NumberFormat("ru-RU").format(price);
  return currency === "USD" ? `$${n}` : `${n} сом`;
}

export function formatDate(iso: string, locale: string) {
  return new Intl.DateTimeFormat(locale === "uz" ? "uz-Latn" : locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

// Короткая метка времени для чата: сегодня — часы:минуты, иначе — дата
export function formatChatTime(iso: string, locale: string) {
  const d = new Date(iso);
  const loc = locale === "uz" ? "uz-Latn" : locale;
  const today = new Date();
  const sameDay =
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate();
  if (sameDay) {
    return new Intl.DateTimeFormat(loc, { hour: "2-digit", minute: "2-digit" }).format(d);
  }
  return new Intl.DateTimeFormat(loc, { day: "numeric", month: "short" }).format(d);
}
