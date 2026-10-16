import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/lib/useSession";
import { colors } from "@/lib/theme";

type Mode = "login" | "register";

export default function Login() {
  const { session } = useSession();
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  // Уже вошли — показываем профиль и кнопку выхода
  if (session) {
    return (
      <View style={styles.screen}>
        <View style={styles.card}>
          <Text style={styles.h1}>Вы вошли</Text>
          <Text style={styles.muted}>{session.user.email}</Text>
          <Pressable
            style={[styles.btn, styles.btnOutline]}
            onPress={async () => {
              await supabase.auth.signOut();
              router.back();
            }}
          >
            <Text style={styles.btnOutlineText}>Выйти</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  async function submit() {
    setError("");
    const mail = email.trim();
    if (!mail || !password) {
      setError("Введите почту и пароль");
      return;
    }
    setBusy(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email: mail, password });
        if (error) {
          setError(error.message === "Invalid login credentials" ? "Неверная почта или пароль" : error.message);
          return;
        }
        router.back();
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: mail,
          password,
          options: { data: { name: name.trim() } },
        });
        if (error) {
          setError(error.message);
          return;
        }
        if (!data.session) {
          setSent(true);
          return;
        }
        router.back();
      }
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <View style={styles.screen}>
        <View style={styles.card}>
          <Text style={styles.h1}>Проверьте почту</Text>
          <Text style={styles.muted}>
            Мы отправили ссылку для подтверждения на {email.trim()}. Перейдите по ней и войдите снова.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.h1}>{mode === "login" ? "Вход" : "Регистрация"}</Text>

        {mode === "register" && (
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Имя"
            placeholderTextColor={colors.muted}
            style={styles.input}
          />
        )}
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Почта"
          placeholderTextColor={colors.muted}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Пароль"
          placeholderTextColor={colors.muted}
          secureTextEntry
          style={styles.input}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable style={styles.btn} onPress={submit} disabled={busy}>
          {busy ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>{mode === "login" ? "Войти" : "Зарегистрироваться"}</Text>
          )}
        </Pressable>

        <Pressable onPress={() => setMode(mode === "login" ? "register" : "login")}>
          <Text style={styles.switch}>
            {mode === "login" ? "Нет аккаунта? Зарегистрироваться" : "Уже есть аккаунт? Войти"}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, justifyContent: "center", padding: 16 },
  card: { backgroundColor: colors.card, borderRadius: 20, padding: 20, gap: 12 },
  h1: { fontSize: 22, fontWeight: "800", color: colors.text },
  muted: { color: colors.muted, lineHeight: 20 },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    paddingHorizontal: 14,
    fontSize: 15,
    color: colors.text,
  },
  btn: {
    backgroundColor: colors.brand,
    height: 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  btnOutline: { backgroundColor: "transparent", borderWidth: 2, borderColor: colors.border },
  btnOutlineText: { color: colors.text, fontSize: 16, fontWeight: "800" },
  switch: { color: colors.brand, textAlign: "center", fontWeight: "600", marginTop: 4 },
  error: { color: colors.danger, fontSize: 14 },
});
