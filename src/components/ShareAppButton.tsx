"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";

export default function ShareAppButton() {
  const t = useTranslations("appDownload");
  const locale = useLocale();
  const [status, setStatus] = useState("");

  async function share() {
    const url = `${window.location.origin}/${locale}/download`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Jangak", text: t("shareText"), url });
      } else {
        await navigator.clipboard.writeText(url);
        setStatus(t("copied"));
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      setStatus(t("copyFallback"));
    }
  }

  return (
    <div>
      <button type="button" onClick={share} className="w-full rounded-2xl border border-brand/25 px-6 py-3 font-bold text-brand transition hover:bg-brand/5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand">
        {t("share")}
      </button>
      <p role="status" className="mt-2 text-sm text-neutral-600">{status}</p>
    </div>
  );
}
