import { Tabs, router } from "expo-router";
import { Pressable, Text } from "react-native";
import { colors } from "@/lib/theme";

function tabIcon(symbol: string) {
  return ({ color }: { color: string }) => <Text style={{ fontSize: 20, color }}>{symbol}</Text>;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.muted,
        headerStyle: { backgroundColor: colors.brand },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "800" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Jangak.kg",
          tabBarLabel: "Лента",
          tabBarIcon: tabIcon("🏠"),
          headerRight: () => (
            <Pressable onPress={() => router.push("/login")} hitSlop={10} style={{ paddingHorizontal: 16 }}>
              <Text style={{ color: "#fff", fontSize: 20 }}>👤</Text>
            </Pressable>
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Поиск",
          tabBarLabel: "Поиск",
          tabBarIcon: tabIcon("🔍"),
        }}
      />
    </Tabs>
  );
}
