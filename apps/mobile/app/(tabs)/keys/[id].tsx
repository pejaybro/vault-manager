import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Trash2, Key, Eye, EyeOff, Star, Tag } from 'lucide-react-native';
import { useVault } from '../../../context/VaultContext';
import { KeyData } from '@vault/core';
import { CopyButton } from '../../../components/CopyButton';
import { ConfirmModal } from '../../../components/ConfirmModal';
import { COLORS, RADII, SPACING } from '../../../constants/theme';

export default function KeyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { vault, deleteEntry, toggleFav } = useVault();

  const [showValue, setShowValue] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const entry = vault?.entries.find((e) => e.id === id);
  if (!entry || entry.type !== 'key') {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Key entry not found</Text>
      </View>
    );
  }

  const data = entry.data as KeyData;

  const handleDelete = async () => {
    await deleteEntry(entry.id);
    router.back();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ConfirmModal
        visible={showDeleteModal}
        title="Delete Key / Note"
        message={`Are you sure you want to delete "${entry.name}"?`}
        confirmText="Delete"
        isDanger
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />

      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={20} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.screenTitle} numberOfLines={1}>{entry.name}</Text>
        <View style={styles.topActions}>
          <TouchableOpacity onPress={() => toggleFav(entry.id)}>
            <Star
              size={20}
              color={entry.favourite ? COLORS.warning : COLORS.textMuted}
              fill={entry.favourite ? COLORS.warning : 'transparent'}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowDeleteModal(true)}>
            <Trash2 size={20} color={COLORS.danger} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.typeHeader}>
          <Key size={20} color={COLORS.warning} />
          <Text style={styles.typeBadge}>{data.keyType.toUpperCase().replace('_', ' ')}</Text>
        </View>

        <View style={styles.valueBox}>
          <View style={styles.valueHeader}>
            <Text style={styles.label}>
              {data.keyType === 'note' ? 'Content' : 'Secret Key Value'}
            </Text>
            <TouchableOpacity onPress={() => setShowValue(!showValue)}>
              {showValue ? <EyeOff size={18} color={COLORS.textMuted} /> : <Eye size={18} color={COLORS.textMuted} />}
            </TouchableOpacity>
          </View>

          <Text style={[styles.keyValueText, !showValue && styles.blurredText]}>
            {showValue
              ? data.keyValue
              : '•'.repeat(Math.min(data.keyValue.length, 32))}
          </Text>

          <View style={styles.copyRow}>
            <CopyButton value={data.keyValue} label="Copy Full Value" />
          </View>
        </View>

        {data.description && (
          <View style={styles.section}>
            <Text style={styles.label}>Description</Text>
            <Text style={styles.descText}>{data.description}</Text>
          </View>
        )}

        {data.tags && data.tags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.label}>Tags</Text>
            <View style={styles.tagRow}>
              {data.tags.map((tag) => (
                <View key={tag} style={styles.tagChip}>
                  <Tag size={12} color={COLORS.textMuted} />
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      <Text style={styles.metaText}>
        Created: {new Date(entry.createdAt).toLocaleDateString()}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.lg,
    paddingTop: 50,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 100,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  backBtn: {
    padding: SPACING.xs,
  },
  screenTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
    marginLeft: SPACING.sm,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  typeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  typeBadge: {
    color: COLORS.warning,
    fontSize: 14,
    fontWeight: '700',
  },
  valueBox: {
    backgroundColor: COLORS.background,
    borderRadius: RADII.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    marginBottom: SPACING.md,
  },
  valueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  label: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  keyValueText: {
    color: COLORS.text,
    fontSize: 14,
    fontFamily: 'monospace',
    lineHeight: 20,
    marginVertical: SPACING.xs,
  },
  blurredText: {
    color: COLORS.textMuted,
  },
  copyRow: {
    marginTop: SPACING.sm,
    alignItems: 'flex-start',
  },
  section: {
    marginTop: SPACING.md,
  },
  descText: {
    color: COLORS.text,
    fontSize: 14,
    marginTop: 4,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADII.sm,
    gap: 4,
  },
  tagText: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  metaText: {
    color: COLORS.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: SPACING.lg,
  },
});
