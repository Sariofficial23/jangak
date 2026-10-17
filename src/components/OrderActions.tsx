"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";

// Подтверждение/отклонение заказа услуги модератором
export default function OrderActions({ orderId }: { orderId: number }) {
  const t = useTranslations("promote");
  const router = useRouter();
  const [pending, start] = useTransition();
  const [err, setErr] = useState("");

  function run(fn: "apply_service_order" | "reject_service_order") {
    start(async () => {
      const supabase = createClient();
      const { error } = await supabase.rpc(fn, { p_order_id: orderId });
      if (error) setErr(error.message);
      else router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => run("apply_service_order")}
        className="h-9 rounded-lg bg-brand px-3 text-sm font-bold text-white disabled:opacity-50"
      >
        {t("confirm")}
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => run("reject_service_order")}
        className="h-9 rounded-lg bg-neutral-100 px-3 text-sm font-bold disabled:opacity-50"
      >
        {t("reject")}
      </button>
      {err && <span className="text-xs text-red-600">{err}</span>}
    </div>
  );
}
