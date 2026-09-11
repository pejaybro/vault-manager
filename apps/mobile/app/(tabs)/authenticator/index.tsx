import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '../../../constants/theme';
import { EmptyState } from '../../../components/EmptyState';

export default function AuthenticatorScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Authenticator (TOTP)</Text>
      <EmptyState
        title="No 2FA Accounts"
        description="Add 6-digit TOTP authenticators for GitHub, Google, Microsoft, etc."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
    paddingTop: 50,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: SPACING.md,
  },
});
