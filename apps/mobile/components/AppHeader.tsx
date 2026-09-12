import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Menu } from 'lucide-react-native';
import { useDrawer } from '../context/DrawerContext';
import { COLORS, RADII, SPACING } from '../constants/theme';

interface AppHeaderProps {
  title: string;
  countBadge?: number;
  rightElement?: React.ReactNode;
}

export function AppHeader({ title, countBadge, rightElement }: AppHeaderProps) {
  const { openDrawer } = useDrawer();

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <TouchableOpacity
          style={styles.menuBtn}
          onPress={openDrawer}
          accessibilityLabel="Open Navigation Menu"
        >
          <Menu size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>{title}</Text>
      </View>

      <View style={styles.rightSection}>
        {countBadge !== undefined && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{countBadge} items</Text>
          </View>
        )}
        {rightElement}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingTop: 54,
    paddingBottom: SPACING.sm,
    backgroundColor: COLORS.background,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuBtn: {
    width: 40,
    height: 40,
    borderRadius: RADII.sm,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countBadge: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADII.full,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  countText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
});
