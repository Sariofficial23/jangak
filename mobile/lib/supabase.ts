import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

// Клиент Supabase для React Native: сессия хранится в AsyncStorage,
// detectSessionInUrl выключен (это не браузер).
export const supabase = createClient(url, key, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export const PHOTO_BUCKET = "listing-photos";

// Публичная ссылка на фото из хранилища
export function photoUrl(path: string) {
  return `${url}/storage/v1/object/public/${PHOTO_BUCKET}/${path}`;
}
