import { useCallback, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/lib/useSession";
import { type ListingCardData } from "@/lib/listings";
import ListingCard from "@/components/ListingCard";
import { colors } from "@/lib/theme";

type MyListing = ListingCardData & { status: string };

const TABS = [
  { key: "active", label: "Активные" },
  { key: "pending", label: "На модерации" },
  { key: "rejected", label: "Отклонённые" },
  { key: "inactive", label: "Неактивные" },
] as const;

export default function Profile() {
  const { session } = useSession();
  const [all, setAll] = useState<MyListing[]>([]);
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("active");

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        if (!session) return;
        const { data } = await supabase
          .from("listings")
          .select(
            "id, title, price, currency, deal_type, negotiable, status, region:regions(name_ru, name_ky, name_uz), photos:listing_photos(path, sort)",
          )
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false });
        if (active) setAll((data ?? []) as unknown as MyListing[]);
      })();
      return () => {
        active = false;
      };
    }, [session]),
  );

  if (!session) {
    return (
      <View style={styles.center}>
        <Text style={styles.emoji}>👤</Text>
        <Text style={styles.title}>Вы не вошли</Text>
        <Text style={styles.text}>Войдите, чтобы подавать объявления и видеть свой профиль.</Text>
        <Pressable style={styles.btn} onPress={() => router.push("/login")}>
          <Text style={styles.btnText}>Войти</Text>
        </Pressable>
      </View>
    );
  }

  const items = all.filter((l) => l.status === tab);
  const count = (k: string) => all.filter((l) => l.status === k).length;

  return (
    <FlatList
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={styles.list}
      data={items}
      keyExtractor={(l) => String(l.id)}
      numColumns={2}
      columnWrapperStyle={styles.row}
      renderItem={({ item }) => <ListingCard item={item} />}
      ListHeaderComponent={
        <View>
          <View style={styles.hello}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(session.user.email ?? "?").slice(0, 1).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.name} numberOfLines={1}>
                Привет!
              </Text>
              <Text style={styles.email} numberOfLines={1}>
                {session.user.email}
              </Text>
            </View>
            <Pressable onPress={async () => { await supabase.auth.signOut(); }} hitSlop={8}>
              <Text style={styles.logout}>Выйти</Text>
            </Pressable>
          </View>

          <Pressable style={styles.createBtn} onPress={() => router.push("/create")}>
            <Text style={styles.createBtnText}>+ Подать объявление</Text>
          </Pressable>

          <Text style={styles.sectionTitle}>Ваши объявления</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={TABS}
            keyExtractor={(t) => t.key}
            contentContainerStyle={styles.tabs}
            renderItem={({ item: t }) => (
              <Pressable
                onPress={() => setTab(t.key)}
                style={[styles.tab, tab === t.key && styles.tabActive]}
              >
                <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>
                  {t.label} ({count(t.key)})
                </Text>
              </Pressable>
            )}
          />
        </View>
      }
      ListEmptyComponent={<Text style={styles.empty}>Здесь пока пусто</Text>}
    />
  );
}

const styles = StyleSheet.create({
  list: { paddingBottom: 16 },
  row: { gap: 10, paddingHorizontal: 10 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, backgroundColor: colors.bg },
  emoji: { fontSize: 44, marginBottom: 10 },
  title: { fontSize: 19, fontWeight: "800", color: colors.text, marginBottom: 6 },
  text: { fontSize: 15, color: colors.muted, textAlign: "center", lineHeight: 21, marginBottom: 16 },
  btn: { backgroundColor: colors.brand, paddingHorizontal: 32, height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  btnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  hello: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16, backgroundColor: colors.card },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.cream, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 20, fontWeight: "800", color: colors.walnut },
  name: { fontSize: 17, fontWeight: "800", color: colors.text },
  email: { fontSize: 13, color: colors.muted },
  logout: { color: colors.danger, fontWeight: "700" },
  createBtn: { margin: 12, height: 50, borderRadius: 12, backgroundColor: colors.kernel, alignItems: "center", justifyContent: "center" },
  createBtnText: { color: colors.walnut, fontWeight: "800", fontSize: 16 },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: colors.text, marginHorizontal: 12, marginBottom: 6 },
  tabs: { paddingHorizontal: 10, gap: 8, paddingBottom: 8 },
  tab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.card },
  tabActive: { backgroundColor: colors.brand },
  tabText: { fontSize: 13, fontWeight: "600", color: colors.text },
  tabTextActive: { color: "#fff" },
  empty: { textAlign: "center", color: colors.muted, marginTop: 20 },
});
