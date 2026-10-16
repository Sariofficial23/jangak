import { Tabs } from "expo-router";
import { Text } from "react-native";
import { colors } from "@/lib/theme";

function tabIcon(symbol: string) {
  return ({ color }: { color: string }) => <Text style={{ fontSize: 22, color }}>{symbol}</Text>;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        headerStyle: { backgroundColor: colors.brand },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "800" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Jangak.kg", tabBarLabel: "Главная", tabBarIcon: tabIcon("🏠") }}
      />
      <Tabs.Screen
        name="favorites"
        options={{ title: "Избранное", tabBarLabel: "Избранное", tabBarIcon: tabIcon("♡") }}
      />
      <Tabs.Screen
        name="create"
        options={{ title: "Новое объявление", tabBarLabel: "Создать", tabBarIcon: tabIcon("➕") }}
      />
      <Tabs.Screen
        name="chat"
        options={{ title: "Чат", tabBarLabel: "Чат", tabBarIcon: tabIcon("💬") }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: "Профиль", tabBarLabel: "Профиль", tabBarIcon: tabIcon("👤") }}
      />
    </Tabs>
  );
}
