import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, KeyRound } from 'lucide-react-native';
import { useVault } from '../../../context/VaultContext';
import { getEntriesByType, Category } from '@vault/core';
import { VaultCard } from '../../../components/VaultCard';
import { SearchBar } from '../../../components/SearchBar';
import { EmptyState } from '../../../components/EmptyState';
import { COLORS, RADII, SPACING } from '../../../constants/theme';

const CATEGORY_FILTERS: { label: string; value: Category | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Work', value: 'work' },
  { label: 'Social', value: 'social' },
  { label: 'Banking', value: 'banking' },
  { label: 'Shopping', value: 'shopping' },
  { label: 'Email', value: 'email' },
  { label: 'Other', value: 'other' },
];

export default function PasswordsScreen() {
  const router = useRouter();
  const { vault, toggleFav } = useVault();

  const [query, setQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState<Category | 'all'>('all');

  const passwordEntries = useMemo(() => {
    if (!vault) return [];
    return getEntriesByType(vault, 'password');
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
        selectedCat === 'all' || (e.data as any).category === selectedCat;

      return matchesSearch && matchesCat;
    });
  }, [passwordEntries, query, selectedCat]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Passwords</Text>
        <Text style={styles.countBadge}>{passwordEntries.length} items</Text>
      </View>

      <SearchBar query={query} onChangeQuery={setQuery} placeholder="Search passwords..." />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
        {CATEGORY_FILTERS.map((cat) => (
          <TouchableOpacity
            key={cat.value}
            style={[styles.chip, selectedCat === cat.value && styles.chipActive]}
            onPress={() => setSelectedCat(cat.value)}
          >
            <Text style={[styles.chipText, selectedCat === cat.value && styles.chipTextActive]}>
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

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/(tabs)/passwords/add')}
      >
        <Plus size={24} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.lg,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '800',
  },
  countBadge: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '600',
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
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
});
