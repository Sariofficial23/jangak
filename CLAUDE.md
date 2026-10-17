# Jangak.kg

Маркетплейс объявлений для Кыргызстана (аналог OLX): новые и б/у вещи, недвижимость, транспорт, работа, услуги. Продают частные лица и бизнес.

## Стек
- Next.js 15 (App Router, TypeScript, `src/`), Tailwind CSS v4
- next-intl v4 — языки `ru` (по умолчанию), `ky` (кыргызский, в UI «KG»), `uz` (узбекский, латиница)
- Планируется: Supabase (Postgres, Auth, Storage, Realtime-чат), хостинг Vercel, позже приложения на Expo (React Native) с тем же бэкендом

## Структура
- `src/app/[locale]/` — страницы; каждый URL начинается с языка (`/ru`, `/ky`, `/uz`)
- `src/messages/{ru,ky,uz}.json` — все тексты интерфейса. Любой новый текст добавлять во ВСЕ три файла с одинаковыми ключами
- `src/i18n/` — настройка языков; для ссылок использовать `Link` из `@/i18n/navigation`, а не из `next/link`
- `src/lib/categories.ts` — разделы главной страницы
- `src/components/` — шапка, подвал, поиск, переключатель языков
- `public/brand/` — логотипы и иконки (SVG + PNG)

## База данных (Supabase)
- Проект: https://ycamgqlhpvrqgtpgfcdv.supabase.co (регион Frankfurt)
- Переменные: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (публичные, в `.env.example`; локально — `.env.local`). Ключ `service_role` никогда не класть в код
- Из облачной сессии Claude доступа к supabase.co нет — работу с базой проверять на Vercel
- Схема — `supabase/migrations/*.sql`, применяется вручную через Supabase → SQL Editor, по порядку номеров
- Таблицы: `regions`, `categories`, `profiles`, `listings`, `listing_photos`, `favorites`; фото — bucket `listing-photos` (папка = id пользователя)
- Клиенты: `@/lib/supabase/server` (серверные компоненты) и `@/lib/supabase/client` (браузер)
- VIP, просмотры и «поднять» пользователь менять не может (права на колонки) — только сервер

## Приложение для Android (APK)
- Пока это оболочка Capacitor вокруг сайта: приложение открывает `https://jangak.vercel.app`, поэтому обновления сайта видны в приложении сразу, пересобирать APK ради них не нужно. Адрес задаётся в `capacitor.config.ts` (или `CAP_SERVER_URL`)
- `android/` — проект Android (коммитим), `mobile/www/` — страница «нет соединения» (`offline.html`), `appId` — `kg.jangak.app`
- Из облачной сессии APK собрать нельзя (нет Android SDK, `dl.google.com` закрыт). Собирает GitHub Actions: `.github/workflows/android-apk.yml` → Actions → запуск → Artifacts → `jangak-apk` (debug-подпись, ставится на телефон вручную)
- Иконки и заставка сгенерированы из `public/brand/jangak-app-icon-square-1024.png`
- Главная в стиле «витрина с фото»: плитки категорий с фото из `public/categories/<key>.jpg` (`src/lib/categories.ts`); для разделов без фото (hobby, free, exchange) пока иконка
- Позже: подпись release-ключом и Google Play; нативное приложение на Expo (этап 5)

## Бренд
- Логотип: надпись «jangak.kg», точка над «j» — грецкий орех (Арсланбоб). Шрифт Inter ExtraBold
- Цвета (Tailwind): `brand` #1E7A4C (зелёный), `walnut` #4A2E1B, `kernel` #F2A33A (золотой), `cream` #FBF6EE
- Слоган: «Сат · Ал · Тап» (ky) / «Sot · Ol · Top» (uz) / «продай, купи, найди» (ru)

## Рынок
- Валюта — сом (KGS), телефоны +996, все области и районы КР
- Главный конкурент — lalafo.kg. Наши отличия: узбекский язык, вход по SMS/Telegram, оплата через MBank / Элсом / O!Деньги, строгая модерация

## Команды
- `npm run dev` — разработка (http://localhost:3000)
- `npm run lint` и `npm run build` — проверять перед каждым коммитом

## План (этапы)
0. Каркас, языки, бренд — ✅
1. MVP: вход, подача объявления с фото, поиск и фильтры, страница объявления, избранное, «Мои объявления», админка модерации
2. Чат, уведомления, сохранённые поиски, жалобы, страница продавца
3. Платные услуги (VIP/ТОП/поднять), кошелёк, бизнес-аккаунты
4. Запуск сайта (SEO, скорость)
5. Мобильные приложения (Expo)
