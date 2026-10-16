import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import AuthForm from "@/components/AuthForm";

export default function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <AuthForm />
    </div>
  );
}
