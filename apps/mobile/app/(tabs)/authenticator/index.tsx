import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, ShieldCheck, Copy, Check } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useVault } from '../../../context/VaultContext';
import { getEntriesByType, TOTPData, VaultEntry } from '@vault/core';
import { useTOTP } from '../../../hooks/useTOTP';
import { SearchBar } from '../../../components/SearchBar';
import { EmptyState } from '../../../components/EmptyState';
import { COLORS, RADII, SPACING } from '../../../constants/theme';

const TOTPCard: React.FC<{ entry: VaultEntry; onPress: () => void }> = ({ entry, onPress }) => {
  const data = entry.data as TOTPData;
  const { formattedCode, code, remaining, progress } = useTOTP(data.secret, data.period, data.digits);
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: any) => {
    e.stopPropagation();
    await Clipboard.setStringAsync(code);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <ShieldCheck size={20} color={COLORS.success} />
        </View>
        <View style={styles.cardTitleBox}>
          <Text style={styles.issuerName} numberOfLines={1}>{data.issuer}</Text>
          <Text style={styles.accountText} numberOfLines={1}>{data.account || 'Account'}</Text>
        </View>
        <TouchableOpacity style={styles.copyBtn} onPress={handleCopy}>
          {copied ? <Check size={18} color={COLORS.success} /> : <Copy size={18} color={COLORS.textMuted} />}
        </TouchableOpacity>
      </View>

      <Text style={styles.codeText}>{formattedCode}</Text>

      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressBar,
            {
              width: `${progress * 100}%`,
              backgroundColor: remaining < 5 ? COLORS.danger : COLORS.primary,
            },
          ]}
        />
      </View>
    </TouchableOpacity>
  );
};

export default function AuthenticatorScreen() {
  const router = useRouter();
  const { vault } = useVault();
  const [query, setQuery] = useState('');

  const totpEntries = useMemo(() => {
    if (!vault) return [];
    return getEntriesByType(vault, 'totp');
  }, [vault]);

  const filteredEntries = useMemo(() => {
    return totpEntries.filter((e) => {
      const q = query.toLowerCase().trim();
      const data = e.data as TOTPData;
      return !q || data.issuer.toLowerCase().includes(q) || data.account.toLowerCase().includes(q);
    });
  }, [totpEntries, query]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Authenticator (TOTP)</Text>
        <Text style={styles.countBadge}>{totpEntries.length} accounts</Text>
      </View>

      <SearchBar query={query} onChangeQuery={setQuery} placeholder="Search authenticator accounts..." />

      {filteredEntries.length === 0 ? (
        <EmptyState
          title={query ? 'No matching accounts' : 'No 2FA Accounts'}
          description={
            query
              ? 'Try a different search term.'
              : 'Tap the + button below to scan a QR code or add a secret key.'
          }
        />
      ) : (
        <FlatList
          data={filteredEntries}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TOTPCard
              entry={item}
              onPress={() => router.push(`/(tabs)/authenticator/${item.id}` as any)}
            />
          )}
          contentContainerStyle={styles.listContent}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/(tabs)/authenticator/add')}
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
    fontSize: 26,
    fontWeight: '800',
  },
  countBadge: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 100,
    paddingTop: SPACING.xs,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADII.md,
    padding: SPACING.md,
    marginVertical: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: RADII.sm,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  cardTitleBox: {
    flex: 1,
  },
  issuerName: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
  },
  accountText: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  copyBtn: {
    padding: SPACING.xs,
  },
  codeText: {
    color: COLORS.primary,
    fontSize: 28,
    fontWeight: '800',
    fontFamily: 'monospace',
    letterSpacing: 3,
    marginBottom: SPACING.sm,
  },
  progressTrack: {
    width: '100%',
    height: 4,
    backgroundColor: COLORS.surface,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
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
