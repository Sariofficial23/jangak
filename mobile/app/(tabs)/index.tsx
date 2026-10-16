import { useCallback, useEffect, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { supabase } from "@/lib/supabase";
import { LISTING_CARD_SELECT, type ListingCardData } from "@/lib/listings";
import ListingCard from "@/components/ListingCard";
import { colors } from "@/lib/theme";

export default function Feed() {
  const [items, setItems] = useState<ListingCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const { data, error } = await supabase
      .from("listings")
      .select(LISTING_CARD_SELECT)
      .eq("status", "active")
      .order("bumped_at", { ascending: false })
      .limit(50);
    if (error) setError(error.message);
    setItems((data ?? []) as unknown as ListingCardData[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <FlatList
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={styles.list}
      data={items}
      keyExtractor={(l) => String(l.id)}
      numColumns={2}
      columnWrapperStyle={styles.row}
      renderItem={({ item }) => <ListingCard item={item} />}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.brand} />}
      ListEmptyComponent={
        !loading ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>{error || "Пока нет объявлений"}</Text>
          </View>
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 10, gap: 10 },
  row: { gap: 10 },
  empty: { paddingVertical: 60, alignItems: "center" },
  emptyText: { color: colors.muted, fontSize: 15, textAlign: "center", paddingHorizontal: 24 },
});
