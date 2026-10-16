"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// Права проверяет база (RLS): чужое объявление изменить или удалить нельзя

export async function setListingStatus(id: number, status: "active" | "inactive") {
  const supabase = await createClient();
  await supabase.from("listings").update({ status }).eq("id", id);
  revalidatePath("/[locale]/my", "page");
}

export async function deleteListing(id: number) {
  const supabase = await createClient();
  const { data: photos } = await supabase.from("listing_photos").select("path").eq("listing_id", id);
  const { error } = await supabase.from("listings").delete().eq("id", id);
  if (!error && photos?.length) {
    await supabase.storage.from("listing-photos").remove(photos.map((p) => p.path));
  }
  revalidatePath("/[locale]/my", "page");
}

export async function toggleFavorite(listingId: number, on: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  if (on) {
    await supabase
      .from("favorites")
      .upsert({ user_id: user.id, listing_id: listingId }, { ignoreDuplicates: true });
  } else {
    await supabase.from("favorites").delete().eq("user_id", user.id).eq("listing_id", listingId);
  }
  revalidatePath("/[locale]/favorites", "page");
}
