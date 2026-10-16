# Jangak.kg — мобильное приложение (Android, Expo)

React Native на Expo. Бэкенд общий с сайтом — тот же проект Supabase.
Первая версия: лента объявлений, поиск, страница объявления, вход.

## Запуск (разработка)

Нужен Node 18+ и телефон с приложением **Expo Go** (из Google Play).

```bash
cd mobile
npm install
npx expo install --fix   # выровнять версии нативных пакетов под SDK Expo
cp .env.example .env      # публичные ключи Supabase (как у сайта)
npx expo start
```

Откроется QR-код. Отсканируй его в приложении **Expo Go** на Android — приложение
запустится на телефоне вживую. Телефон и компьютер должны быть в одной сети Wi-Fi
(либо запускай `npx expo start --tunnel`).

## Переменные окружения

`.env` (копия `.env.example`), значения публичные — те же, что у сайта:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Секретный ключ `service_role` сюда класть нельзя.

## Структура

- `app/` — экраны (file-based routing, Expo Router)
  - `(tabs)/index.tsx` — лента
  - `(tabs)/search.tsx` — поиск
  - `item/[id].tsx` — объявление
  - `login.tsx` — вход / регистрация
- `components/` — переиспользуемые компоненты (карточка объявления)
- `lib/` — клиент Supabase, тема, форматирование, типы и запросы

## Сборка установочного APK (позже)

Готовый APK / публикация в Google Play делается через **EAS Build** (нужен
бесплатный аккаунт Expo):

```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview   # APK для установки на телефон
```

Из облачной сессии Claude это не запускается (нет Android SDK) — делается
на твоей машине или в облаке Expo.

## Дальше по плану

- Языки ky/uz (сейчас только ru)
- Подача объявления с фото и «Избранное»
- Вход по SMS/Telegram (как задумано для рынка КР)
- Чат
