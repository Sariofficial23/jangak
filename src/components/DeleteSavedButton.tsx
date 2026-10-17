"use client";

import { useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";

// Удалить сохранённый поиск
export default function DeleteSavedButton({ id, label }: { id: number; label: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      aria-label={label}
      title={label}
      onClick={() =>
        start(async () => {
          const supabase = createClient();
          await supabase.from("saved_searches").delete().eq("id", id);
          router.refresh();
        })
      }
      className="shrink-0 rounded-lg px-2 py-1 text-neutral-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
    >
      🗑
    </button>
  );
}
