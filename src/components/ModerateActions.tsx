"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { moderateListing } from "@/app/[locale]/admin/actions";

export default function ModerateActions({ id, status }: { id: number; status: string }) {
  const t = useTranslations("admin");
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  const btn = "rounded-lg px-4 py-2 text-sm font-bold transition disabled:opacity-50";

  function run(next: "active" | "rejected") {
    setError("");
    start(async () => {
      const res = await moderateListing(id, next);
      if (res?.error) setError(res.error);
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {status !== "active" && (
          <button
            disabled={pending}
            onClick={() => run("active")}
            className={`${btn} bg-brand text-white hover:bg-brand-dark`}
          >
            ✓ {t("approve")}
          </button>
        )}
        {status !== "rejected" && (
          <button
            disabled={pending}
            onClick={() => run("rejected")}
            className={`${btn} text-red-600 hover:bg-red-50`}
          >
            ✕ {t("reject")}
          </button>
        )}
      </div>
      {error && <p className="font-mono text-xs text-red-700">{error}</p>}
    </div>
  );
}
