import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Все пути, кроме API, служебных файлов Next.js и файлов с расширением
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
