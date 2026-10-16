// Типы и запросы объявлений (переносим логику с сайта)

export type NamedRow = { name_ru: string; name_ky: string; name_uz: string };

export type ListingCardData = {
  id: number;
  title: string;
  price: number | null;
  currency: string;
  deal_type: "sell" | "exchange" | "free";
  negotiable: boolean;
  region: NamedRow | null;
  photos: { path: string; sort: number }[];
};

export type ListingFull = ListingCardData & {
  description: string;
  condition: "new" | "used" | null;
  seller_type: "private" | "business";
  contact_name: string | null;
  contact_phone: string | null;
  created_at: string;
  category: NamedRow | null;
};

export const LISTING_CARD_SELECT =
  "id, title, price, currency, deal_type, negotiable, region:regions(name_ru, name_ky, name_uz), photos:listing_photos(path, sort)";

export const LISTING_FULL_SELECT =
  "id, title, description, price, currency, deal_type, negotiable, condition, seller_type, contact_name, contact_phone, created_at, category:categories(name_ru, name_ky, name_uz), region:regions(name_ru, name_ky, name_uz), photos:listing_photos(path, sort)";

export function firstPhoto(photos: { path: string; sort: number }[]) {
  return [...photos].sort((a, b) => a.sort - b.sort)[0]?.path ?? null;
}

export function priceLabel(item: Pick<ListingCardData, "deal_type" | "price" | "currency">) {
  if (item.deal_type === "free") return "Даром";
  if (item.deal_type === "exchange") return "Обмен";
  return null; // null → форматировать через formatPrice
}
