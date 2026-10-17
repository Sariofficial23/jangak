import type { CapacitorConfig } from "@capacitor/cli";

// Приложение — оболочка вокруг сайта на Vercel: каждое обновление сайта
// сразу видно в приложении, пересобирать APK ради этого не нужно.
// Адрес можно переопределить при сборке: CAP_SERVER_URL=https://... npx cap sync
const serverUrl = process.env.CAP_SERVER_URL ?? "https://jangak.vercel.app";

const config: CapacitorConfig = {
  appId: "kg.jangak.app",
  appName: "Jangak",
  // Локальная папка нужна Capacitor всегда; в ней лежит только страница
  // «нет соединения», которую приложение показывает, если сайт не открылся.
  webDir: "mobile/www",
  backgroundColor: "#1e7a4c",
  server: {
    url: serverUrl,
    errorPath: "offline.html",
  },
  plugins: {
    // Верх экрана зелёный (шапка сайта) — значки статус-бара делаем светлыми.
    SystemBars: { style: "DARK" },
  },
};

export default config;
