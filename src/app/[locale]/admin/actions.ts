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

// Закрыть жалобу без действий над объявлением. Права — RLS: reports_admin_update.
export async function resolveReport(id: number, status: "reviewed" | "dismissed") {
  const supabase = await createClient();
  const { error } = await supabase.from("reports").update({ status }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/[locale]/admin/reports", "page");
  return { error: null };
}

// Жалоба обоснована: снимаем объявление и помечаем жалобу рассмотренной.
export async function hideListingFromReport(reportId: number, listingId: number) {
  const supabase = await createClient();
  const { error } = await supabase.from("listings").update({ status: "rejected" }).eq("id", listingId);
  if (error) return { error: error.message };
  await supabase.from("reports").update({ status: "reviewed" }).eq("id", reportId);
  revalidatePath("/[locale]/admin/reports", "page");
  return { error: null };
}
