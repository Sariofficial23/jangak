import { useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, View } from "react-native";
import { supabase } from "@/lib/supabase";
import { LISTING_CARD_SELECT, type ListingCardData } from "@/lib/listings";
import ListingCard from "@/components/ListingCard";
import { colors } from "@/lib/theme";

export default function Search() {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<ListingCardData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function run() {
    const term = q.trim();
    if (!term) return;
    setLoading(true);
    setSearched(true);
    let query = supabase
      .from("listings")
      .select(LISTING_CARD_SELECT)
      .eq("status", "active")
      .order("bumped_at", { ascending: false })
      .limit(50);
    query = query.ilike("title", `%${term}%`);
    const { data } = await query;
    setItems((data ?? []) as unknown as ListingCardData[]);
    setLoading(false);
  }

  return (
    <View style={styles.screen}>
      <View style={styles.searchBar}>
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Что ищете?"
          placeholderTextColor={colors.muted}
          style={styles.input}
          returnKeyType="search"
          onSubmitEditing={run}
        />
      </View>
      <FlatList
        contentContainerStyle={styles.list}
        data={items}
        keyExtractor={(l) => String(l.id)}
        numColumns={2}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => <ListingCard item={item} />}
        ListEmptyComponent={
          !loading && searched ? (
            <Text style={styles.empty}>Ничего не найдено</Text>
          ) : !searched ? (
            <Text style={styles.empty}>Введите запрос и нажмите «Поиск»</Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  searchBar: { padding: 10, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border },
  input: {
    height: 44,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    paddingHorizontal: 14,
    fontSize: 15,
    color: colors.text,
  },
  list: { padding: 10, gap: 10 },
  row: { gap: 10 },
  empty: { color: colors.muted, textAlign: "center", marginTop: 40, paddingHorizontal: 24 },
});
