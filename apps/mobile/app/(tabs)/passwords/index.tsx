import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ScrollView, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, ShieldCheck, Check, X, KeyRound, User } from 'lucide-react-native';
import { useVault } from '../../../context/VaultContext';
import { getEntriesByType, PasswordData } from '@vault/core';
import { VaultCard } from '../../../components/VaultCard';
import { SearchBar } from '../../../components/SearchBar';
import { EmptyState } from '../../../components/EmptyState';
import { AppHeader } from '../../../components/AppHeader';
import { COLORS, RADII, SPACING } from '../../../constants/theme';

const BASE_CATEGORY_FILTERS: { label: string; value: string }[] = [
  { label: 'All', value: 'all' },
  { label: 'Work', value: 'work' },
  { label: 'Social', value: 'social' },
  { label: 'Banking', value: 'banking' },
  { label: 'Shopping', value: 'shopping' },
  { label: 'Email', value: 'email' },
  { label: 'Personal', value: 'personal' },
  { label: 'Gaming', value: 'gaming' },
  { label: 'Crypto', value: 'crypto' },
  { label: 'Other', value: 'other' },
];

export default function PasswordsScreen() {
  const router = useRouter();
  const { vault, toggleFav, pendingSave, clearPendingSave, savePendingCredential } = useVault();

  const [query, setQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [isSavingPending, setIsSavingPending] = useState(false);

  const passwordEntries = useMemo(() => {
    if (!vault) return [];
    return getEntriesByType(vault, 'password');
  }, [vault]);

  const categoryFilters = useMemo(() => {
    const list = [...BASE_CATEGORY_FILTERS];
    if (vault) {
      vault.entries.forEach((entry) => {
        if (entry.type === 'password') {
          const cat = (entry.data as PasswordData).category;
          if (cat && !list.some((c) => c.value.toLowerCase() === cat.toLowerCase())) {
            list.push({ label: cat.charAt(0).toUpperCase() + cat.slice(1), value: cat });
          }
        }
      });
    }
    return list;
  }, [vault]);

  const filteredEntries = useMemo(() => {
    return passwordEntries.filter((e) => {
      const q = query.toLowerCase().trim();
      const matchesSearch =
        !q ||
        e.name.toLowerCase().includes(q) ||
        (e.data as any).username?.toLowerCase().includes(q) ||
        (e.data as any).url?.toLowerCase().includes(q);

      const matchesCat =
        selectedCat === 'all' ||
        (e.data as any).category?.toLowerCase() === selectedCat.toLowerCase();

      return matchesSearch && matchesCat;
    });
  }, [passwordEntries, query, selectedCat]);

  const handleSavePending = async () => {
    setIsSavingPending(true);
    try {
      await savePendingCredential();
    } finally {
      setIsSavingPending(false);
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Passwords" countBadge={passwordEntries.length} />

      <View style={styles.body}>
        <SearchBar query={query} onChangeQuery={setQuery} placeholder="Search passwords..." />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
          {categoryFilters.map((cat) => (
            <TouchableOpacity
              key={cat.value}
              style={[
                styles.chip,
                selectedCat.toLowerCase() === cat.value.toLowerCase() && styles.chipActive,
              ]}
              onPress={() => setSelectedCat(cat.value)}
            >
              <Text
                style={[
                  styles.chipText,
                  selectedCat.toLowerCase() === cat.value.toLowerCase() && styles.chipTextActive,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {filteredEntries.length === 0 ? (
          <EmptyState
            title={query ? 'No matching passwords' : 'No Passwords Saved'}
            description={
              query
                ? 'Try a different search or filter.'
                : 'Tap the + button below to add your first password.'
            }
          />
        ) : (
          <FlatList
            data={filteredEntries}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <VaultCard
                entry={item}
                onPress={() => router.push(`/(tabs)/passwords/${item.id}` as any)}
                onToggleFav={() => toggleFav(item.id)}
              />
            )}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/(tabs)/passwords/add')}
      >
        <Plus size={24} color="#FFF" />
      </TouchableOpacity>

      {/* Samsung Pass style Save Credentials Bottom Sheet Popup */}
      <Modal
        visible={Boolean(pendingSave)}
        transparent
        animationType="slide"
        onRequestClose={clearPendingSave}
      >
        <View style={styles.saveSheetOverlay}>
          <View style={styles.saveSheetCard}>
            <View style={styles.sheetHeader}>
              <View style={styles.badgeIcon}>
                <ShieldCheck size={22} color={COLORS.primary} />
              </View>
              <View style={styles.sheetHeaderTexts}>
                <Text style={styles.sheetTitle}>Save to Vault Manager?</Text>
                <Text style={styles.sheetSub}>
                  Save credentials for {pendingSave?.name || 'this app'} to autofill next time.
                </Text>
              </View>
              <TouchableOpacity onPress={clearPendingSave} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <X size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.credPreviewBox}>
              <View style={styles.previewRow}>
                <User size={16} color={COLORS.primary} />
                <Text style={styles.previewLabel}>Account:</Text>
                <Text style={styles.previewValue} numberOfLines={1}>
                  {pendingSave?.username || 'No username'}
                </Text>
              </View>
              <View style={styles.previewRow}>
                <KeyRound size={16} color={COLORS.warning} />
                <Text style={styles.previewLabel}>Password:</Text>
                <Text style={styles.previewValue}>••••••••••••</Text>
              </View>
            </View>

            <View style={styles.sheetActions}>
              <TouchableOpacity
                style={styles.sheetCancelBtn}
                onPress={clearPendingSave}
                disabled={isSavingPending}
              >
                <Text style={styles.sheetCancelText}>Not Now</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sheetSaveBtn}
                onPress={handleSavePending}
                disabled={isSavingPending}
              >
                <Check size={16} color="#FFF" />
                <Text style={styles.sheetSaveText}>
                  {isSavingPending ? 'Saving...' : 'Save Credential'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  body: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  catScroll: {
    flexGrow: 0,
    marginVertical: SPACING.xs,
  },
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADII.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    marginRight: SPACING.xs,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#FFF',
  },
  listContent: {
    paddingBottom: 100,
    paddingTop: SPACING.xs,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },

  // Save Credentials Sheet (Samsung Pass style)
  saveSheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
    padding: SPACING.md,
    paddingBottom: 24,
  },
  saveSheetCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: SPACING.md,
  },
  badgeIcon: {
    width: 40,
    height: 40,
    borderRadius: RADII.md,
    backgroundColor: 'rgba(99,102,241,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheetHeaderTexts: { flex: 1 },
  sheetTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '700',
  },
  sheetSub: {
    color: COLORS.textMuted,
    fontSize: 13,
    marginTop: 2,
    lineHeight: 18,
  },
  credPreviewBox: {
    backgroundColor: COLORS.card,
    borderRadius: RADII.md,
    padding: SPACING.md,
    gap: 8,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  previewLabel: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '500',
  },
  previewValue: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  sheetActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  sheetCancelBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 11,
    borderRadius: RADII.md,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  sheetCancelText: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  sheetSaveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 11,
    borderRadius: RADII.md,
  },
  sheetSaveText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
