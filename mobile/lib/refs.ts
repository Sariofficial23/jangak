import { supabase } from "./supabase";

export type Ref = {
  id: number;
  name_ru: string;
  name_ky: string;
  name_uz: string;
  icon?: string | null;
};

// Разделы главной (верхний уровень дерева категорий)
export async function fetchCategories(): Promise<Ref[]> {
  const { data } = await supabase
    .from("categories")
    .select("id, name_ru, name_ky, name_uz, icon")
    .is("parent_id", null)
    .order("sort");
  return (data ?? []) as Ref[];
}

export async function fetchRegions(): Promise<Ref[]> {
  const { data } = await supabase
    .from("regions")
    .select("id, name_ru, name_ky, name_uz")
    .order("sort");
  return (data ?? []) as Ref[];
}
