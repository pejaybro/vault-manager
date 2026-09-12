import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Plus, Trash2, Tag, Check, X, AlertTriangle, Lock } from 'lucide-react-native';
import { useVault } from '../../../context/VaultContext';
import { COLORS, RADII, SPACING } from '../../../constants/theme';
import { PasswordData } from '@vault/core';

const BASE_PRESETS = [
  'Work',
  'Social',
  'Banking',
  'Shopping',
  'Email',
  'Personal',
  'Gaming',
  'Crypto',
  'Other',
];

export default function ManageCategoriesScreen() {
  const router = useRouter();
  const { vault, addCustomCategory, deleteCustomCategory, getCategoryUsageCount } = useVault();

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [warningModalVisible, setWarningModalVisible] = useState(false);
  const [warningData, setWarningData] = useState<{ name: string; count: number } | null>(null);

  // Compute all categories (Presets + Custom in vault.meta.customCategories + Custom from existing entries)
  const categoryList = useMemo(() => {
    const list: { name: string; isPreset: boolean; count: number }[] = [];
    const seen = new Set<string>();

    // 1. Presets
    BASE_PRESETS.forEach((preset) => {
      const count = getCategoryUsageCount(preset);
      list.push({ name: preset, isPreset: true, count });
      seen.add(preset.toLowerCase());
    });

    // 2. Custom categories explicitly saved in vault.meta
    const customInMeta = vault?.meta.customCategories || [];
    customInMeta.forEach((custom) => {
      if (!seen.has(custom.toLowerCase())) {
        const count = getCategoryUsageCount(custom);
        list.push({ name: custom, isPreset: false, count });
        seen.add(custom.toLowerCase());
      }
    });

    // 3. Any category present on existing passwords
    if (vault) {
      vault.entries.forEach((entry) => {
        if (entry.type === 'password') {
          const cat = (entry.data as PasswordData).category;
          if (cat && !seen.has(cat.toLowerCase())) {
            const formatted = cat.charAt(0).toUpperCase() + cat.slice(1);
            const count = getCategoryUsageCount(cat);
            list.push({ name: formatted, isPreset: false, count });
            seen.add(cat.toLowerCase());
          }
        }
      });
    }

    return list;
  }, [vault, getCategoryUsageCount]);

  const handleCreateCategory = async () => {
    const trimmed = newCatName.trim();
    if (!trimmed) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }

    if (categoryList.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
      Alert.alert('Duplicate', `'${trimmed}' category already exists.`);
      return;
    }

    await addCustomCategory(trimmed);
    setNewCatName('');
    setAddModalVisible(false);
  };

  const handleDeletePress = (cat: { name: string; isPreset: boolean; count: number }) => {
    if (cat.count > 0) {
      // Category contains data -> show warning and instruction
      setWarningData({ name: cat.name, count: cat.count });
      setWarningModalVisible(true);
      return;
    }

    Alert.alert(
      'Delete Category',
      `Are you sure you want to remove the '${cat.name}' category?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const res = await deleteCustomCategory(cat.name);
            if (!res.success && res.message) {
              Alert.alert('Notice', res.message);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft size={22} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.screenTitle}>Manage Categories</Text>
        </View>

        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setAddModalVisible(true)}
        >
          <Plus size={18} color="#FFF" />
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.headerSubtitle}>
        Manage and organize your password categories. Categories with active saved passwords cannot be deleted.
      </Text>

      {/* Categories List */}
      <FlatList
        data={categoryList}
        keyExtractor={(item) => item.name}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const hasData = item.count > 0;
          return (
            <View style={styles.categoryCard}>
              <View style={styles.cardLeft}>
                <View
                  style={[
                    styles.iconBox,
                    item.isPreset ? styles.iconBoxPreset : styles.iconBoxCustom,
                  ]}
                >
                  <Tag size={18} color={item.isPreset ? COLORS.primary : COLORS.accent} />
                </View>

                <View>
                  <Text style={styles.catName}>{item.name}</Text>
                  <Text style={styles.catType}>
                    {item.isPreset ? 'Default Preset' : 'Custom Category'}
                  </Text>
                </View>
              </View>

              <View style={styles.cardRight}>
                <View
                  style={[
                    styles.badge,
                    hasData ? styles.badgeActive : styles.badgeEmpty,
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      hasData && styles.badgeTextActive,
                    ]}
                  >
                    {item.count} {item.count === 1 ? 'item' : 'items'}
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.deleteBtn, hasData && styles.deleteBtnDisabled]}
                  onPress={() => handleDeletePress(item)}
                  activeOpacity={0.7}
                >
                  <Trash2
                    size={18}
                    color={hasData ? COLORS.textMuted : COLORS.danger}
                  />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />

      {/* Add Category Modal */}
      <Modal
        visible={addModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Category</Text>
              <TouchableOpacity onPress={() => setAddModalVisible(false)}>
                <X size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <TextInput
              value={newCatName}
              onChangeText={setNewCatName}
              placeholder="e.g. Gaming, Subscriptions, Servers, Crypto"
              placeholderTextColor={COLORS.textMuted}
              style={styles.modalInput}
              autoFocus
              onSubmitEditing={handleCreateCategory}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setAddModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={handleCreateCategory}
              >
                <Check size={16} color="#FFF" />
                <Text style={styles.modalConfirmText}>Save Category</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Cannot Delete Warning Modal */}
      <Modal
        visible={warningModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setWarningModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, styles.warningCard]}>
            <View style={styles.warningIconBadge}>
              <AlertTriangle size={32} color={COLORS.warning} />
            </View>

            <Text style={styles.warningTitle}>Cannot Delete Category</Text>

            <Text style={styles.warningBody}>
              The category <Text style={styles.boldText}>'{warningData?.name}'</Text> currently has{' '}
              <Text style={styles.boldText}>
                {warningData?.count} {warningData?.count === 1 ? 'saved password' : 'saved passwords'}
              </Text>{' '}
              assigned to it.
            </Text>

            <View style={styles.actionStepsBox}>
              <Text style={styles.actionStepsTitle}>In order to delete this category:</Text>
              <Text style={styles.actionStepItem}>
                1. Go to your Passwords list and filter by '{warningData?.name}'.
              </Text>
              <Text style={styles.actionStepItem}>
                2. Edit those password entries to assign them to another category (e.g. 'Personal' or 'Work'), or delete the entries if no longer needed.
              </Text>
              <Text style={styles.actionStepItem}>
                3. Once the item count reaches 0, you can safely delete this category.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.gotItBtn}
              onPress={() => setWarningModalVisible(false)}
            >
              <Text style={styles.gotItBtnText}>Understood</Text>
            </TouchableOpacity>
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingTop: 54,
    paddingBottom: SPACING.xs,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: RADII.sm,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderRadius: RADII.md,
  },
  addBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: COLORS.textMuted,
    fontSize: 13,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    marginTop: 4,
    lineHeight: 18,
  },
  listContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: 60,
    gap: 8,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: RADII.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: RADII.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBoxPreset: {
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
  },
  iconBoxCustom: {
    backgroundColor: 'rgba(129, 140, 248, 0.12)',
  },
  catName: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
  },
  catType: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  cardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADII.full,
    borderWidth: 1,
  },
  badgeActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  badgeEmpty: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.surfaceBorder,
  },
  badgeText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  badgeTextActive: {
    color: COLORS.primary,
  },
  deleteBtn: {
    padding: 8,
    borderRadius: RADII.sm,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  deleteBtnDisabled: {
    backgroundColor: COLORS.card,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalCard: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: RADII.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  modalTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
  },
  modalInput: {
    backgroundColor: COLORS.card,
    borderRadius: RADII.md,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    color: COLORS.text,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: SPACING.md,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalCancelBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    borderRadius: RADII.md,
  },
  modalCancelText: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  modalConfirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    borderRadius: RADII.md,
  },
  modalConfirmText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  warningCard: {
    alignItems: 'center',
    paddingTop: SPACING.xl,
  },
  warningIconBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  warningTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: SPACING.xs,
  },
  warningBody: {
    color: COLORS.textMuted,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  boldText: {
    color: COLORS.text,
    fontWeight: '700',
  },
  actionStepsBox: {
    backgroundColor: COLORS.card,
    borderRadius: RADII.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    width: '100%',
    marginBottom: SPACING.lg,
    gap: 6,
  },
  actionStepsTitle: {
    color: COLORS.warning,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  actionStepItem: {
    color: COLORS.textMuted,
    fontSize: 12,
    lineHeight: 17,
  },
  gotItBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADII.md,
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
  },
  gotItBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
