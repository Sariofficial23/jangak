import { useCallback, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/lib/useSession";
import { LISTING_CARD_SELECT, type ListingCardData } from "@/lib/listings";
import ListingCard from "@/components/ListingCard";
import { colors } from "@/lib/theme";

export default function Favorites() {
  const { session } = useSession();
  const [items, setItems] = useState<ListingCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        if (!session) {
          setLoading(false);
          return;
        }
        setLoading(true);
        const { data } = await supabase
          .from("favorites")
          .select(`listing:listings(${LISTING_CARD_SELECT})`)
          .order("created_at", { ascending: false });
        const rows = ((data ?? []) as unknown as { listing: ListingCardData | null }[])
          .map((r) => r.listing)
          .filter((l): l is ListingCardData => !!l);
        if (active) {
          setItems(rows);
          setLoading(false);
        }
      })();
      return () => {
        active = false;
      };
    }, [session]),
  );

  if (!session) {
    return (
      <View style={styles.center}>
        <Text style={styles.emoji}>♡</Text>
        <Text style={styles.title}>Войдите, чтобы сохранять</Text>
        <Text style={styles.text}>Нажмите на сердечко в объявлении — оно появится здесь.</Text>
        <Pressable style={styles.btn} onPress={() => router.push("/login")}>
          <Text style={styles.btnText}>Войти</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <FlatList
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={styles.list}
      data={items}
      keyExtractor={(l) => String(l.id)}
      numColumns={2}
      columnWrapperStyle={styles.row}
      renderItem={({ item }) => <ListingCard item={item} />}
      ListEmptyComponent={!loading ? <Text style={styles.empty}>В избранном пока пусто</Text> : null}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 10, gap: 10 },
  row: { gap: 10 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, backgroundColor: colors.bg },
  emoji: { fontSize: 44, marginBottom: 10, color: colors.brand },
  title: { fontSize: 19, fontWeight: "800", color: colors.text, marginBottom: 6 },
  text: { fontSize: 15, color: colors.muted, textAlign: "center", lineHeight: 21, marginBottom: 16 },
  btn: { backgroundColor: colors.brand, paddingHorizontal: 32, height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  btnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  empty: { textAlign: "center", color: colors.muted, marginTop: 40 },
});
