// Общие типы и запросы объявлений

export type NamedRow = { name_ru: string; name_ky: string; name_uz: string };

export type ListingCardData = {
  id: number;
  title: string;
  price: number | null;
  currency: string;
  deal_type: "sell" | "exchange" | "free";
  negotiable: boolean;
  condition: "new" | "used" | null;
  is_vip: boolean;
  bumped_at: string;
  region: NamedRow | null;
  photos: { path: string; sort: number }[];
};

export const LISTING_CARD_SELECT =
  "id, title, price, currency, deal_type, negotiable, condition, is_vip, bumped_at, region:regions(name_ru, name_ky, name_uz), photos:listing_photos(path, sort)";

export function firstPhoto(photos: { path: string; sort: number }[]) {
  return [...photos].sort((a, b) => a.sort - b.sort)[0]?.path ?? null;
}
