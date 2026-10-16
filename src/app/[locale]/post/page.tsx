import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { localName } from "@/lib/format";
import PostForm from "@/components/PostForm";

export default async function PostPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("post");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return redirect({ href: "/login", locale });

  const [{ data: categories }, { data: regions }, { data: profile }] = await Promise.all([
    supabase.from("categories").select("id, name_ru, name_ky, name_uz").is("parent_id", null).order("sort"),
    supabase.from("regions").select("id, name_ru, name_ky, name_uz").order("sort"),
    supabase.from("profiles").select("name, phone").eq("id", user.id).single(),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-extrabold text-walnut sm:text-3xl">{t("title")}</h1>
      <PostForm
        userId={user.id}
        categories={(categories ?? []).map((c) => ({ id: c.id, name: localName(c, locale) }))}
        regions={(regions ?? []).map((r) => ({ id: r.id, name: localName(r, locale) }))}
        defaultName={profile?.name ?? ""}
        defaultPhone={profile?.phone ?? ""}
      />
    </div>
  );
}
