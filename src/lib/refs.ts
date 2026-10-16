import { createClient } from "@/lib/supabase/server";
import { localName } from "@/lib/format";

export type RefOption = { id: number; slug: string; name: string };

// Регионы и разделы для фильтров и форм — названия сразу на нужном языке
export async function getRefs(locale: string) {
  const supabase = await createClient();
  const [{ data: regions }, { data: categories }] = await Promise.all([
    supabase.from("regions").select("id, slug, name_ru, name_ky, name_uz").order("sort"),
    supabase
      .from("categories")
      .select("id, slug, name_ru, name_ky, name_uz")
      .is("parent_id", null)
      .order("sort"),
  ]);
  const map = (rows: typeof regions) =>
    (rows ?? []).map((r) => ({ id: r.id, slug: r.slug, name: localName(r, locale) }));
  return { regions: map(regions) as RefOption[], categories: map(categories) as RefOption[] };
}
