"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";

// Кнопка «Написать» на странице объявления: открывает (или создаёт) переписку с продавцом.
export default function MessageSellerButton({
  listingId,
  loggedIn,
  label,
}: {
  listingId: number;
  loggedIn: boolean;
  label: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onClick() {
    if (!loggedIn) {
      router.push("/login");
      return;
    }
    setBusy(true);
    const supabase = createClient();
    const { data, error } = await supabase.rpc("start_conversation", { p_listing_id: listingId });
    if (error || !data) {
      setBusy(false);
      return;
    }
    router.push(`/chat/${data}`);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className="h-12 rounded-xl bg-brand font-extrabold text-white transition hover:bg-brand-dark disabled:opacity-60"
    >
      💬 {label}
    </button>
  );
}
