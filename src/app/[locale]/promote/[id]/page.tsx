import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link, redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { PAYMENT_PHONE, PAYMENT_WALLETS } from "@/lib/promote";
import PromoteForm from "@/components/PromoteForm";

type Pending = {
  id: number;
  service: "vip" | "bump";
  days: number | null;
  price: number;
};

export default async function PromotePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("promote");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return redirect({ href: "/login", locale });

  const notFound = !/^\d+$/.test(id);
  const { data: listing } = notFound
    ? { data: null }
    : await supabase.from("listings").select("id, title, user_id").eq("id", Number(id)).maybeSingle();

  if (!listing || listing.user_id !== user.id) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <p className="mb-6 text-lg">{t("notFound")}</p>
        <Link href="/my" className="font-bold text-brand hover:underline">
          ← {t("back")}
        </Link>
      </div>
    );
  }

  const { data: pendingData } = await supabase
    .from("service_orders")
    .select("id, service, days, price")
    .eq("listing_id", listing.id)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const pending = pendingData as Pending | null;

  const serviceLabel = (s: Pending) =>
    s.service === "bump" ? t("opt.bump.title") : t(s.days === 30 ? "opt.vip30.title" : "opt.vip7.title");

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <div className="mb-5 flex items-center gap-3">
        <Link href="/my" className="text-xl text-neutral-500 hover:text-brand" aria-label={t("back")}>
          ←
        </Link>
        <h1 className="text-2xl font-extrabold text-walnut">{t("title")}</h1>
      </div>
      <p className="mb-6 truncate text-sm text-neutral-500">{listing.title}</p>

      {pending ? (
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl bg-kernel/15 p-5">
            <div className="mb-1 font-extrabold text-walnut">{t("pendingTitle")}</div>
            <p className="text-sm text-neutral-700">
              {serviceLabel(pending)} — <b>{pending.price} {t("som")}</b>
            </p>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="mb-2 font-bold">{t("howToPay")}</div>
            <ol className="flex list-decimal flex-col gap-1 pl-5 text-sm text-neutral-700">
              <li>{t("payStep1", { amount: `${pending.price} ${t("som")}`, phone: PAYMENT_PHONE })}</li>
              <li>{t("payStep2")}</li>
              <li>{t("payStep3")}</li>
            </ol>
            <div className="mt-3 rounded-xl bg-neutral-50 p-3 text-center">
              <div className="text-lg font-extrabold text-walnut">{PAYMENT_PHONE}</div>
              <div className="text-xs text-neutral-500">{PAYMENT_WALLETS}</div>
            </div>
          </div>
          <p className="text-center text-xs text-neutral-400">{t("pendingNote")}</p>
        </div>
      ) : (
        <>
          <p className="mb-4 text-sm text-neutral-600">{t("intro")}</p>
          <PromoteForm listingId={listing.id} />
        </>
      )}
    </div>
  );
}
