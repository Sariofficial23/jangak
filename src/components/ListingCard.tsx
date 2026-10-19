import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { formatDate, formatPrice, localName } from "@/lib/format";
import { firstPhoto, type ListingCardData } from "@/lib/listings";
import { photoUrl } from "@/lib/supabase/config";

export default async function ListingCard({ item }: { item: ListingCardData }) {
  const t = await getTranslations("listing");
  const locale = await getLocale();
  const cover = firstPhoto(item.photos);

  const price =
    item.deal_type === "free"
      ? t("free")
      : item.deal_type === "exchange"
        ? t("exchange")
        : formatPrice(item.price, item.currency);

  return (
    <Link
      href={`/item/${item.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="relative aspect-[4/3] bg-neutral-100">
        {cover ? (
          <Image
            src={item.demo ? cover : photoUrl(cover)}
            alt={item.title}
            fill
            unoptimized
            sizes="(max-width: 640px) 50vw, 25vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-neutral-400">
            {t("noPhoto")}
          </div>
        )}
        {item.demo && (
          <span className="absolute left-2 top-2 rounded-md bg-white/95 px-2 py-1 text-xs font-bold text-brand">{t("demoBadge")}</span>
        )}
        {item.is_vip && (
          <span className="absolute left-2 top-2 rounded-md bg-kernel px-2 py-0.5 text-xs font-extrabold text-walnut">
            VIP
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="line-clamp-2 text-sm font-semibold group-hover:text-brand">{item.title}</h3>
        {item.condition && (
          <span className="w-fit rounded bg-neutral-100 px-1.5 text-xs text-neutral-600">
            {t(item.condition)}
          </span>
        )}
        <div className="mt-auto pt-2">
          <div className="font-extrabold">{price}</div>
          {item.negotiable && <div className="text-xs text-neutral-500">{t("negotiable")}</div>}
          <div className="mt-1 text-xs text-neutral-500">
            {localName(item.region, locale)} · {formatDate(item.bumped_at, locale)}
          </div>
        </div>
      </div>
    </Link>
  );
}
