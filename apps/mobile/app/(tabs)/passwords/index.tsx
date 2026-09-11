import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '../../../constants/theme';
import { EmptyState } from '../../../components/EmptyState';

export default function PasswordsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Passwords</Text>
      <EmptyState
        title="No Passwords Saved"
        description="Tap the + button to store your passwords securely."
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
