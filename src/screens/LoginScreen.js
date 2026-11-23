import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../auth/AuthContext';
import { ALLOWED_DOMAIN } from '../utils/domain';
import { isFirebaseConfigured } from '../firebase';
import { colors } from '../theme';

export default function LoginScreen() {
  const { signInWithGoogle, busy, error, ready } = useAuth();
  const disabled = busy || !ready || !isFirebaseConfigured;

  return (
    <View style={styles.page}>
      <View style={styles.card}>
        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.subtitle}>Sign in with your @{ALLOWED_DOMAIN} Google account to continue.</Text>

        {!isFirebaseConfigured && (
          <View style={styles.error} accessibilityRole="alert">
            <Text style={styles.errorText}>Firebase is not configured. Copy .env.example to .env and fill it in.</Text>
          </View>
        )}
        {!!error && (
          <View style={styles.error} accessibilityRole="alert">
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <Pressable
          onPress={signInWithGoogle}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel="Login with Google"
          style={({ pressed }) => [styles.button, disabled && styles.buttonDisabled, pressed && styles.pressed]}
        >
          {busy ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Login with Google</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', padding: 16 },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 28,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: { fontSize: 26, fontWeight: '700', color: colors.text, marginBottom: 6 },
  subtitle: { fontSize: 15, color: colors.muted, marginBottom: 20, lineHeight: 22 },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  buttonDisabled: { opacity: 0.6 },
  pressed: { opacity: 0.85 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  error: {
    backgroundColor: colors.errorBg,
    borderColor: colors.errorBorder,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { color: colors.errorText, fontSize: 14, lineHeight: 20 },
});
