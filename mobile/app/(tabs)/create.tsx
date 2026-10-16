import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { router, useFocusEffect } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/lib/useSession";
import { uploadPhoto } from "@/lib/upload";
import { fetchCategories, fetchRegions, type Ref } from "@/lib/refs";
import { colors } from "@/lib/theme";

type Deal = "sell" | "exchange" | "free";
const MAX_PHOTOS = 8;

export default function Create() {
  const { session } = useSession();
  const [categories, setCategories] = useState<Ref[]>([]);
  const [regions, setRegions] = useState<Ref[]>([]);

  const [photos, setPhotos] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [deal, setDeal] = useState<Deal>("sell");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState<"KGS" | "USD">("KGS");
  const [condition, setCondition] = useState<"new" | "used" | null>(null);
  const [regionId, setRegionId] = useState<number | null>(null);
  const [description, setDescription] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCategories().then(setCategories);
    fetchRegions().then(setRegions);
  }, []);

  // Подставить имя/телефон из профиля при входе на экран
  useFocusEffect(
    useCallback(() => {
      if (!session) return;
      supabase
        .from("profiles")
        .select("name, phone")
        .eq("id", session.user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data?.name && !contactName) setContactName(data.name);
          if (data?.phone && !phone) setPhone(data.phone);
        });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session]),
  );

  async function pickPhotos() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Нет доступа", "Разрешите доступ к фото в настройках телефона.");
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: MAX_PHOTOS - photos.length,
      quality: 0.6,
    });
    if (!res.canceled) {
      setPhotos((p) => [...p, ...res.assets.map((a) => a.uri)].slice(0, MAX_PHOTOS));
    }
  }

  async function submit() {
    setError("");
    const t = title.trim();
    if (t.length < 16 || t.length > 70) return setError("Заголовок: от 16 до 70 символов");
    if (!categoryId) return setError("Выберите категорию");
    if (description.trim().length < 40) return setError("Описание: не менее 40 символов");
    const priceNum = Number(price.replace(/\s/g, ""));
    if (deal === "sell" && (!price || Number.isNaN(priceNum))) return setError("Укажите цену");
    if (!regionId) return setError("Выберите область");
    if (!phone.trim()) return setError("Укажите телефон");

    setBusy(true);
    try {
      const { data: listing, error: insErr } = await supabase
        .from("listings")
        .insert({
          user_id: session!.user.id,
          category_id: categoryId,
          region_id: regionId,
          title: t,
          description: description.trim(),
          deal_type: deal,
          price: deal === "sell" ? priceNum : null,
          currency,
          negotiable: false,
          condition,
          seller_type: "private",
          contact_name: contactName.trim(),
          contact_phone: phone.trim(),
        })
        .select("id")
        .single();
      if (insErr) throw insErr;

      for (let i = 0; i < photos.length; i++) {
        const path = await uploadPhoto(photos[i], session!.user.id, listing.id, i);
        const { error: pErr } = await supabase
          .from("listing_photos")
          .insert({ listing_id: listing.id, path, sort: i });
        if (pErr) throw pErr;
      }

      // сброс формы
      setPhotos([]);
      setTitle("");
      setCategoryId(null);
      setPrice("");
      setCondition(null);
      setRegionId(null);
      setDescription("");
      Alert.alert(
        "Отправлено на модерацию",
        "Объявление появится в поиске после проверки модератором.",
        [{ text: "Ок", onPress: () => router.push(`/item/${listing.id}`) }],
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  if (!session) {
    return (
      <View style={styles.center}>
        <Text style={styles.emoji}>➕</Text>
        <Text style={styles.gTitle}>Войдите, чтобы подать объявление</Text>
        <Pressable style={styles.loginBtn} onPress={() => router.push("/login")}>
          <Text style={styles.loginBtnText}>Войти</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={styles.form}>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Text style={styles.label}>Фото (до {MAX_PHOTOS})</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photos}>
        {photos.map((uri, i) => (
          <View key={uri} style={styles.photoBox}>
            <Image source={{ uri }} style={styles.photo} />
            <Pressable style={styles.remove} onPress={() => setPhotos(photos.filter((_, j) => j !== i))}>
              <Text style={styles.removeText}>✕</Text>
            </Pressable>
          </View>
        ))}
        {photos.length < MAX_PHOTOS && (
          <Pressable style={styles.addPhoto} onPress={pickPhotos}>
            <Text style={styles.addPhotoText}>＋</Text>
            <Text style={styles.addPhotoLabel}>Добавить</Text>
          </Pressable>
        )}
      </ScrollView>

      <Text style={styles.label}>Заголовок *</Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Например, iPhone 11 с гарантией"
        placeholderTextColor={colors.muted}
        style={styles.input}
        maxLength={70}
      />

      <Text style={styles.label}>Категория *</Text>
      <View style={styles.chips}>
        {categories.map((c) => (
          <Pressable
            key={c.id}
            onPress={() => setCategoryId(c.id)}
            style={[styles.chip, categoryId === c.id && styles.chipActive]}
          >
            <Text style={[styles.chipText, categoryId === c.id && styles.chipTextActive]}>
              {c.icon ?? ""} {c.name_ru}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Тип сделки</Text>
      <View style={styles.chips}>
        {([["sell", "Продажа"], ["exchange", "Обмен"], ["free", "Даром"]] as const).map(([v, l]) => (
          <Pressable key={v} onPress={() => setDeal(v)} style={[styles.chip, deal === v && styles.chipActive]}>
            <Text style={[styles.chipText, deal === v && styles.chipTextActive]}>{l}</Text>
          </Pressable>
        ))}
      </View>

      {deal === "sell" && (
        <>
          <Text style={styles.label}>Цена *</Text>
          <View style={styles.priceRow}>
            <TextInput
              value={price}
              onChangeText={setPrice}
              placeholder="0"
              placeholderTextColor={colors.muted}
              keyboardType="numeric"
              style={[styles.input, { flex: 1 }]}
            />
            {(["KGS", "USD"] as const).map((c) => (
              <Pressable key={c} onPress={() => setCurrency(c)} style={[styles.cur, currency === c && styles.chipActive]}>
                <Text style={[styles.chipText, currency === c && styles.chipTextActive]}>
                  {c === "KGS" ? "сом" : "$"}
                </Text>
              </Pressable>
            ))}
          </View>
        </>
      )}

      <Text style={styles.label}>Состояние</Text>
      <View style={styles.chips}>
        {([["new", "Новое"], ["used", "Б/у"]] as const).map(([v, l]) => (
          <Pressable
            key={v}
            onPress={() => setCondition(condition === v ? null : v)}
            style={[styles.chip, condition === v && styles.chipActive]}
          >
            <Text style={[styles.chipText, condition === v && styles.chipTextActive]}>{l}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Область *</Text>
      <View style={styles.chips}>
        {regions.map((r) => (
          <Pressable
            key={r.id}
            onPress={() => setRegionId(r.id)}
            style={[styles.chip, regionId === r.id && styles.chipActive]}
          >
            <Text style={[styles.chipText, regionId === r.id && styles.chipTextActive]}>{r.name_ru}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Описание *</Text>
      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder="Подробности: состояние, комплектация, причина продажи…"
        placeholderTextColor={colors.muted}
        style={[styles.input, styles.textarea]}
        multiline
      />

      <Text style={styles.label}>Контактное лицо</Text>
      <TextInput value={contactName} onChangeText={setContactName} style={styles.input} placeholderTextColor={colors.muted} />

      <Text style={styles.label}>Телефон *</Text>
      <TextInput
        value={phone}
        onChangeText={setPhone}
        placeholder="+996 700 123 456"
        placeholderTextColor={colors.muted}
        keyboardType="phone-pad"
        style={styles.input}
      />

      <Pressable style={[styles.submit, busy && { opacity: 0.6 }]} onPress={submit} disabled={busy}>
        {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Опубликовать</Text>}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  form: { padding: 14, paddingBottom: 40, gap: 6 },
  error: { color: colors.danger, fontSize: 14, marginBottom: 4 },
  label: { fontSize: 14, fontWeight: "700", color: colors.text, marginTop: 12, marginBottom: 6 },
  input: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.text,
  },
  textarea: { minHeight: 110, textAlignVertical: "top" },
  photos: { gap: 10, paddingVertical: 2 },
  photoBox: { width: 92, height: 92, borderRadius: 12, overflow: "hidden" },
  photo: { width: "100%", height: "100%" },
  remove: { position: "absolute", top: 4, right: 4, backgroundColor: "rgba(0,0,0,0.6)", width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  removeText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  addPhoto: { width: 92, height: 92, borderRadius: 12, borderWidth: 2, borderColor: colors.border, borderStyle: "dashed", alignItems: "center", justifyContent: "center", backgroundColor: colors.card },
  addPhotoText: { fontSize: 26, color: colors.brand },
  addPhotoLabel: { fontSize: 11, color: colors.muted },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.brand, borderColor: colors.brand },
  chipText: { fontSize: 13, fontWeight: "600", color: colors.text },
  chipTextActive: { color: "#fff" },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  cur: { paddingHorizontal: 16, height: 48, borderRadius: 12, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  submit: { marginTop: 22, height: 54, borderRadius: 14, backgroundColor: colors.brand, alignItems: "center", justifyContent: "center" },
  submitText: { color: "#fff", fontSize: 17, fontWeight: "800" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, backgroundColor: colors.bg },
  emoji: { fontSize: 44, marginBottom: 10 },
  gTitle: { fontSize: 18, fontWeight: "800", color: colors.text, textAlign: "center", marginBottom: 16 },
  loginBtn: { backgroundColor: colors.brand, paddingHorizontal: 32, height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  loginBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
});
