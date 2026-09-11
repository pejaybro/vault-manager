import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FolderLock } from 'lucide-react-native';
import { COLORS, SPACING } from '../constants/theme';

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No items found',
  description = 'Tap the + button below to add your first item.',
}) => {
  return (
    <View style={styles.container}>
      <FolderLock size={48} color={COLORS.textMuted} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    marginTop: 40,
  },
  title: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '600',
    marginTop: SPACING.md,
  },
  description: {
    color: COLORS.textMuted,
    fontSize: 14,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
});
