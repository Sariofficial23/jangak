import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Link } from "expo-router";
import { photoUrl } from "@/lib/supabase";
import { firstPhoto, priceLabel, type ListingCardData } from "@/lib/listings";
import { formatPrice } from "@/lib/format";
import { colors } from "@/lib/theme";

export default function ListingCard({ item }: { item: ListingCardData }) {
  const cover = firstPhoto(item.photos);
  const price = priceLabel(item) ?? formatPrice(item.price, item.currency);

  return (
    <Link href={`/item/${item.id}`} asChild>
      <Pressable style={styles.card}>
        <View style={styles.imgBox}>
          {cover ? (
            <Image source={{ uri: photoUrl(cover) }} style={styles.img} resizeMode="cover" />
          ) : (
            <Text style={styles.noimg}>Нет фото</Text>
          )}
        </View>
        <View style={styles.body}>
          <Text style={styles.price}>{price}</Text>
          <Text numberOfLines={2} style={styles.title}>
            {item.title}
          </Text>
          {item.region && <Text style={styles.region}>📍 {item.region.name_ru}</Text>}
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: "hidden",
  },
  imgBox: {
    aspectRatio: 1,
    backgroundColor: "#ECECEC",
    alignItems: "center",
    justifyContent: "center",
  },
  img: { width: "100%", height: "100%" },
  noimg: { color: colors.muted, fontSize: 13 },
  body: { padding: 10, gap: 3 },
  price: { fontSize: 15, fontWeight: "800", color: colors.text },
  title: { fontSize: 13, color: colors.text, lineHeight: 17 },
  region: { fontSize: 12, color: colors.muted, marginTop: 2 },
});
