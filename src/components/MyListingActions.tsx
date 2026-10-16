"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { deleteListing, setListingStatus } from "@/app/[locale]/my/actions";

export default function MyListingActions({ id, status }: { id: number; status: string }) {
  const t = useTranslations("my");
  const [pending, start] = useTransition();
  const btn = "rounded-lg px-3 py-1.5 text-xs font-bold transition disabled:opacity-50";

  return (
    <div className="flex flex-wrap gap-2">
      {status === "active" && (
        <button disabled={pending} onClick={() => start(() => setListingStatus(id, "inactive"))} className={`${btn} bg-neutral-100 hover:bg-neutral-200`}>
          {t("deactivate")}
        </button>
      )}
      {status === "inactive" && (
        <button disabled={pending} onClick={() => start(() => setListingStatus(id, "active"))} className={`${btn} bg-brand text-white hover:bg-brand-dark`}>
          {t("activate")}
        </button>
      )}
      <button
        disabled={pending}
        onClick={() => confirm(t("confirmDelete")) && start(() => deleteListing(id))}
        className={`${btn} text-red-600 hover:bg-red-50`}
      >
        {t("delete")}
      </button>
    </div>
  );
}
