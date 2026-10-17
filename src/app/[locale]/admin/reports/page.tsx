import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link, redirect } from "@/i18n/navigation";
import { getModerator } from "@/lib/admin";
import { formatDate } from "@/lib/format";
import ReportActions from "@/components/ReportActions";

type Report = {
  id: number;
  reason: string;
  comment: string | null;
  created_at: string;
  listing: { id: number; title: string; status: string } | null;
  reporter: { name: string | null } | null;
};

export default async function AdminReportsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const { supabase, user, isAdmin } = await getModerator();
  if (!user) return redirect({ href: "/login", locale });
  if (!isAdmin) return redirect({ href: "/", locale });

  const { data } = await supabase
    .from("reports")
    .select(
      "id, reason, comment, created_at, listing:listings(id, title, status), reporter:profiles!reports_reporter_id_fkey(name)",
    )
    .eq("status", "open")
    .order("created_at", { ascending: true });
  const items = (data ?? []) as unknown as Report[];

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:py-8">
      <div className="mb-5 flex items-center gap-3">
        <Link href="/admin" className="text-xl text-neutral-500 hover:text-brand" aria-label="←">
          ←
        </Link>
        <h1 className="text-2xl font-extrabold text-walnut sm:text-3xl">{t("report.adminTitle")}</h1>
      </div>

      {items.length ? (
        <ul className="flex flex-col gap-4">
          {items.map((r) => (
            <li key={r.id} className="rounded-2xl bg-white p-4 shadow-sm sm:p-5">
              <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                <span>#{r.id}</span>
                <span>·</span>
                <span>{formatDate(r.created_at, locale)}</span>
                <span className="rounded-md bg-red-50 px-2 py-0.5 font-semibold text-red-700">
                  {t(`report.reasons.${r.reason}`)}
                </span>
              </div>
              {r.listing ? (
                <Link href={`/item/${r.listing.id}`} className="font-bold hover:text-brand">
                  {r.listing.title}
                </Link>
              ) : (
                <span className="text-neutral-400">{t("report.listingGone")}</span>
              )}
              {r.comment && (
                <p className="mt-1 whitespace-pre-line break-words text-sm text-neutral-600">{r.comment}</p>
              )}
              <div className="mt-1 text-xs text-neutral-500">
                {t("report.from")}: {r.reporter?.name || "—"}
              </div>
              {r.listing && (
                <div className="mt-3">
                  <ReportActions reportId={r.id} listingId={r.listing.id} />
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-2xl bg-white p-10 text-center text-neutral-500">{t("report.empty")}</div>
      )}
    </div>
  );
}
