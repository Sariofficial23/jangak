import { useCallback, useEffect, useState } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from "react-native";
import { supabase } from "@/lib/supabase";
import { LISTING_CARD_SELECT, type ListingCardData } from "@/lib/listings";
import { fetchCategories, type Ref } from "@/lib/refs";
import ListingCard from "@/components/ListingCard";
import { colors } from "@/lib/theme";

export default function Home() {
  const [categories, setCategories] = useState<Ref[]>([]);
  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [items, setItems] = useState<ListingCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories().then(setCategories);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    let q = supabase
      .from("listings")
      .select(LISTING_CARD_SELECT)
      .eq("status", "active")
      .order("bumped_at", { ascending: false })
      .limit(60);
    if (categoryId) q = q.eq("category_id", categoryId);
    if (activeQuery) q = q.ilike("title", `%${activeQuery}%`);
    const { data } = await q;
    setItems((data ?? []) as unknown as ListingCardData[]);
    setLoading(false);
  }, [categoryId, activeQuery]);

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
      ListHeaderComponent={
        <View style={styles.header}>
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Что ищете?"
              placeholderTextColor={colors.muted}
              style={styles.input}
              returnKeyType="search"
              onSubmitEditing={() => setActiveQuery(query.trim())}
            />
            {activeQuery ? (
              <Pressable
                onPress={() => {
                  setQuery("");
                  setActiveQuery("");
                }}
                hitSlop={8}
              >
                <Text style={styles.clear}>✕</Text>
              </Pressable>
            ) : null}
          </View>

          <Text style={styles.sectionTitle}>Категории</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={[{ id: 0, name_ru: "Все", name_ky: "", name_uz: "", icon: "🗂️" } as Ref, ...categories]}
            keyExtractor={(c) => String(c.id)}
            contentContainerStyle={styles.cats}
            renderItem={({ item }) => {
              const active = item.id === 0 ? categoryId === null : categoryId === item.id;
              return (
                <Pressable
                  onPress={() => setCategoryId(item.id === 0 ? null : item.id)}
                  style={[styles.cat, active && styles.catActive]}
                >
                  <Text style={styles.catIcon}>{item.icon ?? "📦"}</Text>
                  <Text style={[styles.catLabel, active && styles.catLabelActive]} numberOfLines={2}>
                    {item.name_ru}
                  </Text>
                </Pressable>
              );
            }}
          />

          <Text style={styles.sectionTitle}>Объявления</Text>
        </View>
      }
      ListEmptyComponent={
        !loading ? <Text style={styles.empty}>Ничего не найдено</Text> : null
      }
    />
  );
}

const styles = StyleSheet.create({
  list: { paddingBottom: 16 },
  row: { gap: 10, paddingHorizontal: 10 },
  header: { paddingBottom: 6 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    margin: 10,
    paddingHorizontal: 12,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: { fontSize: 16 },
  input: { flex: 1, fontSize: 15, color: colors.text },
  clear: { fontSize: 16, color: colors.muted, paddingHorizontal: 4 },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: colors.text, marginHorizontal: 12, marginTop: 8, marginBottom: 6 },
  cats: { paddingHorizontal: 10, gap: 8 },
  cat: {
    width: 84,
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 14,
    backgroundColor: colors.card,
  },
  catActive: { backgroundColor: colors.brand },
  catIcon: { fontSize: 24 },
  catLabel: { fontSize: 11, textAlign: "center", color: colors.text },
  catLabelActive: { color: "#fff", fontWeight: "700" },
  empty: { textAlign: "center", color: colors.muted, marginTop: 30 },
});
