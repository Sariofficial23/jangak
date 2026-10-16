import { createBrowserClient } from "@supabase/ssr";
import { supabaseKey, supabaseUrl } from "./config";

// Клиент Supabase для браузерных (client) компонентов
export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseKey);
}
