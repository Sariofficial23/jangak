export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

export const PHOTO_BUCKET = "listing-photos";
export const CHAT_BUCKET = "chat-photos";

// Публичная ссылка на фото из хранилища
export function photoUrl(path: string) {
  return `${supabaseUrl}/storage/v1/object/public/${PHOTO_BUCKET}/${path}`;
}

// Публичная ссылка на фото из чата
export function chatPhotoUrl(path: string) {
  return `${supabaseUrl}/storage/v1/object/public/${CHAT_BUCKET}/${path}`;
}
