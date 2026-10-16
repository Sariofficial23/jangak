import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { colors } from "@/lib/theme";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.brand },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "800" },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="item/[id]" options={{ title: "Объявление" }} />
        <Stack.Screen name="login" options={{ title: "Вход", presentation: "modal" }} />
      </Stack>
    </>
  );
}
