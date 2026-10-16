import { createClient } from "@/lib/supabase/server";

// Текущий пользователь и является ли он модератором
export async function getModerator() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, isAdmin: false };

  const { data } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  return { supabase, user, isAdmin: data?.is_admin === true };
}
