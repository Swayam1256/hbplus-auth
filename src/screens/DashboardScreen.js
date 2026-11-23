import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../auth/AuthContext';
import { colors } from '../theme';

export default function DashboardScreen() {
  const { user, role, logout, error } = useAuth();
  return (
    <View style={styles.page}>
      <View style={styles.card}>
        {user.photo ? <Image source={{ uri: user.photo }} style={styles.avatar} /> : null}
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.name}>{user.name || 'Signed in'}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <View style={[styles.badge, role === 'admin' && styles.badgeAdmin]}>
          <Text style={[styles.badgeText, role === 'admin' && styles.badgeAdminText]}>{role.toUpperCase()}</Text>
        </View>

        {role === 'admin' && (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Admin panel</Text>
            <Text style={styles.panelText}>Only admins can see this section.</Text>
          </View>
        )}

        {!!error && <Text style={styles.errorText}>{error}</Text>}

        <Pressable
          onPress={logout}
          accessibilityRole="button"
          accessibilityLabel="Logout"
          style={({ pressed }) => [styles.logout, pressed && { opacity: 0.85 }]}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', padding: 16 },
  card: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 28,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  avatar: { width: 72, height: 72, borderRadius: 36, marginBottom: 12 },
  title: { fontSize: 24, fontWeight: '700', color: colors.text },
  name: { fontSize: 18, color: colors.text, marginTop: 10, fontWeight: '600' },
  email: { fontSize: 14, color: colors.muted, marginTop: 2 },
  badge: { marginTop: 12, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999, backgroundColor: '#EEF2FF' },
  badgeAdmin: { backgroundColor: '#FEF3C7' },
  badgeText: { fontSize: 12, fontWeight: '700', color: colors.primary },
  badgeAdminText: { color: '#92400E' },
  panel: { marginTop: 20, alignSelf: 'stretch', padding: 14, borderRadius: 10, borderWidth: 1, borderColor: colors.border },
  panelTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  panelText: { fontSize: 14, color: colors.muted, marginTop: 4 },
  errorText: { color: colors.errorText, marginTop: 12 },
  logout: { marginTop: 24, alignSelf: 'stretch', borderRadius: 10, minHeight: 46, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  logoutText: { fontSize: 15, fontWeight: '600', color: colors.text },
});
