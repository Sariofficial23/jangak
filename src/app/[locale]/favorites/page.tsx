import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { LISTING_CARD_SELECT, type ListingCardData } from "@/lib/listings";
import ListingCard from "@/components/ListingCard";

export default async function FavoritesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("fav");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return redirect({ href: "/login", locale });

  const { data } = await supabase
    .from("favorites")
    .select(`listing:listings(${LISTING_CARD_SELECT})`)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  // Снятые с публикации объявления скрыты политикой RLS и приходят как null
  const listings = (data ?? [])
    .map((f) => f.listing as unknown as ListingCardData | null)
    .filter((l): l is ListingCardData => l !== null);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-extrabold text-walnut sm:text-3xl">♡ {t("title")}</h1>
      {listings.length ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {listings.map((item) => (
            <ListingCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl bg-white p-10 text-center text-neutral-500">{t("empty")}</div>
      )}
    </div>
  );
}
