import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { KeyRound, ShieldCheck, Key, FileText, Star } from 'lucide-react-native';
import { VaultEntry, PasswordData, KeyData } from '@vault/core';
import { COLORS, RADII, SPACING } from '../constants/theme';
import { CopyButton } from './CopyButton';

interface VaultCardProps {
  entry: VaultEntry;
  onPress: () => void;
  onToggleFav?: () => void;
}

export const VaultCard: React.FC<VaultCardProps> = ({ entry, onPress, onToggleFav }) => {
  const getIcon = () => {
    switch (entry.type) {
      case 'password':
        return <KeyRound size={20} color={COLORS.primary} />;
      case 'totp':
        return <ShieldCheck size={20} color={COLORS.success} />;
      case 'key':
        return <Key size={20} color={COLORS.warning} />;
      case 'note':
        return <FileText size={20} color={COLORS.accent} />;
    }
  };

  const getSubtitle = () => {
    if (entry.type === 'password') {
      const data = entry.data as PasswordData;
      return data.username || 'No username';
    }
    if (entry.type === 'key') {
      const data = entry.data as KeyData;
      return data.keyType.toUpperCase().replace('_', ' ');
    }
    return '';
  };

  const copyValue = () => {
    if (entry.type === 'password') return (entry.data as PasswordData).password;
    if (entry.type === 'key') return (entry.data as KeyData).keyValue;
    return '';
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.iconContainer}>{getIcon()}</View>
      
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {entry.name}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {getSubtitle()}
        </Text>
      </View>

      <View style={styles.actions}>
        {copyValue() ? <CopyButton value={copyValue()} /> : null}
        {onToggleFav && (
          <TouchableOpacity onPress={onToggleFav} style={styles.favBtn}>
            <Star
              size={18}
              color={entry.favourite ? COLORS.warning : COLORS.textMuted}
              fill={entry.favourite ? COLORS.warning : 'transparent'}
            />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RADII.md,
    padding: SPACING.md,
    marginVertical: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: RADII.sm,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  content: {
    flex: 1,
  },
  name: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  favBtn: {
    padding: SPACING.xs,
  },
});
