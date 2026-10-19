import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { formatPrice, localName } from "@/lib/format";
import type { DemoListing } from "@/lib/demo-listings";

export default async function DemoListingDetail({ item, locale }: { item: DemoListing; locale: string }) {
  const t = await getTranslations();
  const price = item.deal_type === "free" ? t("listing.free") : item.deal_type === "exchange" ? t("listing.exchange") : formatPrice(item.price, item.currency);
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link href={{ pathname: "/search", query: { cat: item.category_key } }} className="font-semibold text-brand hover:underline">← {t(`categories.${item.category_key}`)}</Link>
      <h1 className="mt-4 text-2xl font-extrabold text-walnut sm:text-3xl">{item.title}</h1>
      <p className="my-5 rounded-2xl border border-kernel/30 bg-kernel/10 p-4 text-sm leading-relaxed text-walnut">{t("listing.demoNotice")}</p>
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-white">
            <Image src={item.photos[0].path} alt={item.title} fill sizes="(min-width: 1024px) 720px, 100vw" priority className="object-contain" />
          </div>
          <section className="mt-5 rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-lg font-bold">{t("listing.description")}</h2>
            <p className="leading-relaxed text-neutral-700">{item.description}</p>
          </section>
        </div>
        <aside className="h-fit rounded-2xl bg-white p-6 shadow-sm">
          <span className="rounded-lg bg-brand/10 px-3 py-1 text-xs font-bold text-brand">{t("listing.demoBadge")}</span>
          <p className="mt-4 text-3xl font-extrabold">{price}</p>
          {item.category_key === "jobs" && <p className="text-sm text-neutral-500">{t("listing.perMonth")}</p>}
          <p className="mt-3 text-sm text-neutral-500">{localName(item.region, locale)}</p>
          <div className="mt-6 rounded-xl bg-cream p-4 text-sm leading-relaxed text-walnut">{t("listing.demoContacts")}</div>
          <Link href="/post" className="mt-5 block rounded-xl bg-brand px-4 py-3 text-center font-bold text-white hover:bg-brand/90">{t("header.post")}</Link>
          <Link href="/download" className="mt-3 block rounded-xl border border-brand/20 px-4 py-3 text-center font-bold text-brand hover:bg-brand/5">{t("appDownload.cta")}</Link>
        </aside>
      </div>
    </div>
  );
}
