"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { SERVICE_OPTIONS, type ServiceOption } from "@/lib/promote";

// Выбор услуги продвижения и создание заказа
export default function PromoteForm({ listingId }: { listingId: number }) {
  const t = useTranslations("promote");
  const router = useRouter();
  const [busy, setBusy] = useState<string>("");
  const [error, setError] = useState("");

  async function choose(opt: ServiceOption) {
    if (busy) return;
    setBusy(opt.key);
    setError("");
    const supabase = createClient();
    const { error: err } = await supabase.rpc("create_service_order", {
      p_listing_id: listingId,
      p_service: opt.service,
      p_days: opt.days,
    });
    if (err) {
      setError(err.message);
      setBusy("");
    } else {
      router.refresh();
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {SERVICE_OPTIONS.map((opt) => (
        <button
          key={opt.key}
          type="button"
          onClick={() => choose(opt)}
          disabled={!!busy}
          className="flex items-center justify-between gap-3 rounded-2xl bg-white p-4 text-left shadow-sm transition hover:shadow-md disabled:opacity-60"
        >
          <div>
            <div className="font-bold">{t(`opt.${opt.key}.title`)}</div>
            <div className="text-sm text-neutral-500">{t(`opt.${opt.key}.desc`)}</div>
          </div>
          <div className="shrink-0 rounded-xl bg-brand px-4 py-2 font-extrabold text-white">
            {opt.price} {t("som")}
          </div>
        </button>
      ))}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
