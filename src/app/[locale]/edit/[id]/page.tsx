import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link, redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { localName } from "@/lib/format";
import PostForm, { type InitialListing } from "@/components/PostForm";

export default async function EditPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("post");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return redirect({ href: "/login", locale });

  const { data: listing } = /^\d+$/.test(id)
    ? await supabase
        .from("listings")
        .select(
          "id, user_id, status, title, description, deal_type, price, currency, negotiable, condition, seller_type, contact_name, contact_phone, category_id, region_id, photos:listing_photos(path, sort)",
        )
        .eq("id", Number(id))
        .maybeSingle()
    : { data: null };

  // Редактировать может только владелец и не отклонённое объявление (ограничение RLS)
  if (!listing || listing.user_id !== user.id || listing.status === "rejected") {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <p className="mb-6 text-lg">{t("editNotAllowed")}</p>
        <Link href="/my" className="font-bold text-brand hover:underline">
          ← {t("backToMy")}
        </Link>
      </div>
    );
  }

  const [{ data: categories, error: catError }, { data: regions, error: regError }] = await Promise.all([
    supabase.from("categories").select("id, name_ru, name_ky, name_uz").is("parent_id", null).order("sort"),
    supabase.from("regions").select("id, name_ru, name_ky, name_uz").order("sort"),
  ]);

  const initial = listing as unknown as InitialListing & { status: string; user_id: string };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-extrabold text-walnut sm:text-3xl">{t("editTitle")}</h1>
      {(catError || regError) && (
        <p className="mb-5 rounded-xl bg-red-50 p-4 font-mono text-sm text-red-700">
          {(catError ?? regError)?.message}
        </p>
      )}
      <PostForm
        userId={user.id}
        categories={(categories ?? []).map((c) => ({ id: c.id, name: localName(c, locale) }))}
        regions={(regions ?? []).map((r) => ({ id: r.id, name: localName(r, locale) }))}
        defaultName=""
        defaultPhone=""
        initial={initial}
      />
    </div>
  );
}
