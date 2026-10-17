"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { hideListingFromReport, resolveReport } from "@/app/[locale]/admin/actions";

// Действия модератора над жалобой
export default function ReportActions({
  reportId,
  listingId,
}: {
  reportId: number;
  listingId: number;
}) {
  const t = useTranslations("report");
  const [pending, start] = useTransition();
  const [err, setErr] = useState("");

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const r = await hideListingFromReport(reportId, listingId);
            if (r.error) setErr(r.error);
          })
        }
        className="h-9 rounded-lg bg-red-600 px-3 text-sm font-bold text-white disabled:opacity-50"
      >
        {t("hideListing")}
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const r = await resolveReport(reportId, "dismissed");
            if (r.error) setErr(r.error);
          })
        }
        className="h-9 rounded-lg bg-neutral-100 px-3 text-sm font-bold disabled:opacity-50"
      >
        {t("dismiss")}
      </button>
      {err && <span className="text-xs text-red-600">{err}</span>}
    </div>
  );
}
