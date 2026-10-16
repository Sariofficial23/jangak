"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// Модерация объявления. Права проверяет база (RLS: listings_admin_update) —
// обычный пользователь сменить статус чужого объявления не сможет.
export async function moderateListing(id: number, status: "active" | "rejected") {
  const supabase = await createClient();
  const { error } = await supabase.from("listings").update({ status }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/[locale]/admin", "page");
  return { error: null };
}
