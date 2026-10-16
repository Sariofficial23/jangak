import * as FileSystem from "expo-file-system/legacy";
import { decode } from "base64-arraybuffer";
import { PHOTO_BUCKET, supabase } from "./supabase";

// Загружает локальное фото в хранилище Supabase.
// Путь: <id пользователя>/<id объявления>/<номер>.jpg — так требует политика доступа.
export async function uploadPhoto(uri: string, userId: string, listingId: number, index: number) {
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const path = `${userId}/${listingId}/${index}-${Date.now()}.jpg`;
  const { error } = await supabase.storage
    .from(PHOTO_BUCKET)
    .upload(path, decode(base64), { contentType: "image/jpeg" });
  if (error) throw error;
  return path;
}
