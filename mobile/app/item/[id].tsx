import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { photoUrl, supabase } from "@/lib/supabase";
import { LISTING_FULL_SELECT, priceLabel, type ListingFull } from "@/lib/listings";
import { formatDate, formatPrice } from "@/lib/format";
import { useSession } from "@/lib/useSession";
import { colors } from "@/lib/theme";

const W = Dimensions.get("window").width;

export default function ItemScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useSession();
  const [item, setItem] = useState<ListingFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPhone, setShowPhone] = useState(false);
  const [fav, setFav] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("listings")
        .select(LISTING_FULL_SELECT)
        .eq("id", Number(id))
        .maybeSingle();
      setItem((data as unknown as ListingFull) ?? null);
      setLoading(false);
    })();
  }, [id]);

  useEffect(() => {
    if (!session) {
      setFav(false);
      return;
    }
    supabase
      .from("favorites")
      .select("listing_id")
      .eq("user_id", session.user.id)
      .eq("listing_id", Number(id))
      .maybeSingle()
      .then(({ data }) => setFav(!!data));
  }, [id, session]);

  async function toggleFav() {
    if (!session) {
      router.push("/login");
      return;
    }
    const next = !fav;
    setFav(next);
    if (next) {
      await supabase
        .from("favorites")
        .upsert({ user_id: session.user.id, listing_id: Number(id) }, { ignoreDuplicates: true });
    } else {
      await supabase.from("favorites").delete().eq("user_id", session.user.id).eq("listing_id", Number(id));
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.brand} />
      </View>
    );
  }

  if (!item) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Объявление не найдено</Text>
      </View>
    );
  }

  const photos = [...item.photos].sort((a, b) => a.sort - b.sort);
  const price = priceLabel(item) ?? formatPrice(item.price, item.currency);

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ paddingBottom: 32 }}>
      <View style={styles.gallery}>
        {photos.length ? (
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
            {photos.map((p) => (
              <Image key={p.path} source={{ uri: photoUrl(p.path) }} style={styles.photo} resizeMode="cover" />
            ))}
          </ScrollView>
        ) : (
          <View style={[styles.photo, styles.noPhoto]}>
            <Text style={styles.muted}>Нет фото</Text>
          </View>
        )}
      </View>

      <View style={styles.block}>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{price}</Text>
          <Pressable onPress={toggleFav} hitSlop={10} style={styles.heart}>
            <Text style={{ fontSize: 24, color: fav ? colors.danger : colors.muted }}>
              {fav ? "♥" : "♡"}
            </Text>
          </Pressable>
        </View>
        <Text style={styles.title}>{item.title}</Text>
        {item.negotiable && <Text style={styles.muted}>Торг уместен</Text>}
        <Text style={styles.date}>
          {formatDate(item.created_at)} · {item.region?.name_ru ?? ""}
        </Text>
      </View>

      <View style={styles.tags}>
        <Text style={styles.tag}>{item.seller_type === "business" ? "Бизнес" : "Частное лицо"}</Text>
        {item.condition && <Text style={styles.tag}>{item.condition === "new" ? "Новое" : "Б/у"}</Text>}
        {item.category && <Text style={styles.tag}>{item.category.name_ru}</Text>}
      </View>

      <View style={styles.block}>
        <Text style={styles.h2}>Описание</Text>
        <Text style={styles.body}>{item.description}</Text>
      </View>

      {item.contact_phone ? (
        <View style={styles.block}>
          <Pressable
            style={styles.phoneBtn}
            onPress={() => {
              if (showPhone) Linking.openURL(`tel:${item.contact_phone}`);
              else setShowPhone(true);
            }}
          >
            <Text style={styles.phoneBtnText}>
              {showPhone ? `📞 ${item.contact_phone}` : "Показать телефон"}
            </Text>
          </Pressable>
          {item.contact_name ? <Text style={styles.seller}>Продавец: {item.contact_name}</Text> : null}
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg },
  muted: { color: colors.muted },
  gallery: { backgroundColor: "#111" },
  photo: { width: W, height: W * 0.8 },
  noPhoto: { alignItems: "center", justifyContent: "center", backgroundColor: "#222" },
  block: {
    backgroundColor: colors.card,
    marginTop: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 6,
  },
  priceRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  heart: { padding: 4 },
  price: { fontSize: 24, fontWeight: "800", color: colors.text },
  title: { fontSize: 18, fontWeight: "700", color: colors.text },
  date: { fontSize: 13, color: colors.muted, marginTop: 2 },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingHorizontal: 16, paddingVertical: 12 },
  tag: {
    backgroundColor: colors.card,
    color: colors.text,
    fontSize: 13,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    overflow: "hidden",
  },
  h2: { fontSize: 16, fontWeight: "800", color: colors.text, marginBottom: 2 },
  body: { fontSize: 15, lineHeight: 22, color: colors.text },
  phoneBtn: {
    backgroundColor: colors.brand,
    height: 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  phoneBtnText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  seller: { color: colors.muted, marginTop: 8 },
});
