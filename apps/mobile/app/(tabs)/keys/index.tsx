import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { useVault } from '../../../context/VaultContext';
import { getEntriesByType, KeyType, KeyData } from '@vault/core';
import { VaultCard } from '../../../components/VaultCard';
import { SearchBar } from '../../../components/SearchBar';
import { EmptyState } from '../../../components/EmptyState';
import { AppHeader } from '../../../components/AppHeader';
import { COLORS, RADII, SPACING } from '../../../constants/theme';

const TYPE_FILTERS: { label: string; value: KeyType | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'API Keys', value: 'api_key' },
  { label: 'SSH Keys', value: 'ssh_key' },
  { label: 'Certificates', value: 'certificate' },
  { label: 'Tokens', value: 'token' },
  { label: 'Secure Notes', value: 'note' },
];

export default function KeysScreen() {
  const router = useRouter();
  const { vault, toggleFav } = useVault();

  const [query, setQuery] = useState('');
  const [selectedType, setSelectedType] = useState<KeyType | 'all'>('all');

  const keyEntries = useMemo(() => {
    if (!vault) return [];
    return getEntriesByType(vault, 'key');
  }, [vault]);

  const filteredEntries = useMemo(() => {
    return keyEntries.filter((e) => {
      const q = query.toLowerCase().trim();
      const data = e.data as KeyData;
      const matchesSearch =
        !q ||
        e.name.toLowerCase().includes(q) ||
        data.description?.toLowerCase().includes(q) ||
        data.tags?.some((t) => t.toLowerCase().includes(q));

      const matchesType =
        selectedType === 'all' || data.keyType === selectedType;

      return matchesSearch && matchesType;
    });
  }, [keyEntries, query, selectedType]);

  return (
    <View style={styles.container}>
      <AppHeader title="Keys & Notes" countBadge={keyEntries.length} />

      <View style={styles.body}>
        <SearchBar query={query} onChangeQuery={setQuery} placeholder="Search keys, tokens, notes..." />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
          {TYPE_FILTERS.map((t) => (
            <TouchableOpacity
              key={t.value}
              style={[styles.chip, selectedType === t.value && styles.chipActive]}
              onPress={() => setSelectedType(t.value)}
            >
              <Text style={[styles.chipText, selectedType === t.value && styles.chipTextActive]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {filteredEntries.length === 0 ? (
          <EmptyState
            title={query ? 'No matching keys' : 'No Keys or Notes Saved'}
            description={
              query
                ? 'Try a different search or filter.'
                : 'Tap the + button below to securely store API keys, SSH keys, or notes.'
            }
          />
        ) : (
          <FlatList
            data={filteredEntries}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <VaultCard
                entry={item}
                onPress={() => router.push(`/(tabs)/keys/${item.id}` as any)}
                onToggleFav={() => toggleFav(item.id)}
              />
            )}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/(tabs)/keys/add')}
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
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
});
