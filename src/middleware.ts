import createMiddleware from "next-intl/middleware";
import { createServerClient } from "@supabase/ssr";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { supabaseKey, supabaseUrl } from "./lib/supabase/config";

const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  const response = intlMiddleware(request);

  // Обновляем сессию Supabase, чтобы пользователь не «вылетал» из аккаунта
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });
  await supabase.auth.getUser();

  return response;
}

export const config = {
  // Все пути, кроме API, служебных файлов Next.js и файлов с расширением
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
