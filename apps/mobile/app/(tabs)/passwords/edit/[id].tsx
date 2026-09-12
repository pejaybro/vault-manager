import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Save, Sparkles, Plus, Check, X } from 'lucide-react-native';
import { useVault } from '../../../../context/VaultContext';
import { SecureInput } from '../../../../components/SecureInput';
import { PasswordGenerator } from '../../../../components/PasswordGenerator';
import { COLORS, RADII, SPACING } from '../../../../constants/theme';
import { Category, PasswordData } from '@vault/core';

const BASE_CATEGORIES: { label: string; value: string }[] = [
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

export default function EditPasswordScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { vault, updateEntry } = useVault();

  const entry = vault?.entries.find((e) => e.id === id);
  const data = entry?.data as PasswordData | undefined;

  const [name, setName] = useState(entry?.name || '');
  const [username, setUsername] = useState(data?.username || '');
  const [password, setPassword] = useState(data?.password || '');
  const [url, setUrl] = useState(data?.url || '');
  const [category, setCategory] = useState<Category>(data?.category || 'work');
  const [notes, setNotes] = useState(data?.notes || '');
  const [showGenerator, setShowGenerator] = useState(false);

  // Custom category modal state
  const [customModalVisible, setCustomModalVisible] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  // Collect all unique categories from existing vault entries + base categories
  const allCategories = useMemo(() => {
    const list = [...BASE_CATEGORIES];
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
    if (category && !list.some((c) => c.value.toLowerCase() === category.toLowerCase())) {
      list.push({ label: category.charAt(0).toUpperCase() + category.slice(1), value: category });
    }
    return list;
  }, [vault, category]);

  if (!entry || entry.type !== 'password') {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Password entry not found</Text>
      </View>
    );
  }

  const handleAddCustomCategory = () => {
    const trimmed = newCatName.trim();
    if (!trimmed) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }
    setCategory(trimmed);
    setNewCatName('');
    setCustomModalVisible(false);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }
    if (!password) {
      Alert.alert('Error', 'Please enter a password');
      return;
    }

    const updatedData: PasswordData = {
      username: username.trim(),
      password,
      url: url.trim() || undefined,
      category,
      notes: notes.trim() || undefined,
    };

    await updateEntry(id as string, {
      name: name.trim(),
      data: updatedData,
    });

    router.back();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={20} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Edit Password</Text>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Save size={18} color="#FFF" />
          <Text style={styles.saveBtnText}>Save</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Service / App Name *</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="e.g. GitHub, Google, Netflix"
          placeholderTextColor={COLORS.textMuted}
          style={styles.input}
        />

        <Text style={styles.label}>Username or Email</Text>
        <TextInput
          value={username}
          onChangeText={setUsername}
          placeholder="e.g. user@gmail.com"
          placeholderTextColor={COLORS.textMuted}
          style={styles.input}
          autoCapitalize="none"
        />

        <SecureInput
          label="Password *"
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
        />

        <TouchableOpacity
          style={styles.genToggleBtn}
          onPress={() => setShowGenerator(!showGenerator)}
        >
          <Sparkles size={16} color={COLORS.primary} />
          <Text style={styles.genToggleText}>
            {showGenerator ? 'Hide Generator' : 'Generate Strong Password'}
          </Text>
        </TouchableOpacity>

        {showGenerator && (
          <PasswordGenerator
            onSelectPassword={(gen) => {
              setPassword(gen);
              setShowGenerator(false);
            }}
          />
        )}

        <View style={styles.categoryHeader}>
          <Text style={styles.label}>Category</Text>
          <TouchableOpacity
            style={styles.addCatLink}
            onPress={() => setCustomModalVisible(true)}
          >
            <Plus size={14} color={COLORS.primary} />
            <Text style={styles.addCatLinkText}>New Category</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catRow}>
          {allCategories.map((cat) => (
            <TouchableOpacity
              key={cat.value}
              style={[styles.catChip, category.toLowerCase() === cat.value.toLowerCase() && styles.catChipActive]}
              onPress={() => setCategory(cat.value)}
            >
              <Text
                style={[
                  styles.catChipText,
                  category.toLowerCase() === cat.value.toLowerCase() && styles.catChipTextActive,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={styles.catChipAdd}
            onPress={() => setCustomModalVisible(true)}
          >
            <Plus size={14} color={COLORS.textMuted} />
            <Text style={styles.catChipAddText}>Custom...</Text>
          </TouchableOpacity>
        </ScrollView>

        <Text style={styles.label}>Website URL (optional)</Text>
        <TextInput
          value={url}
          onChangeText={setUrl}
          placeholder="https://github.com/login"
          placeholderTextColor={COLORS.textMuted}
          style={styles.input}
          autoCapitalize="none"
          keyboardType="url"
        />

        <Text style={styles.label}>Notes (optional)</Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Additional notes..."
          placeholderTextColor={COLORS.textMuted}
          style={[styles.input, styles.textArea]}
          multiline
          numberOfLines={4}
        />
      </View>

      {/* New Custom Category Modal */}
      <Modal
        visible={customModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCustomModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Category</Text>
              <TouchableOpacity onPress={() => setCustomModalVisible(false)}>
                <X size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <TextInput
              value={newCatName}
              onChangeText={setNewCatName}
              placeholder="e.g. Gaming, Cloud, Streaming, Finances"
              placeholderTextColor={COLORS.textMuted}
              style={styles.modalInput}
              autoFocus
              onSubmitEditing={handleAddCustomCategory}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setCustomModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalAddBtn}
                onPress={handleAddCustomCategory}
              >
                <Check size={16} color="#FFF" />
                <Text style={styles.modalAddText}>Add & Select</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.md,
    paddingTop: 50,
    paddingBottom: 60,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  backBtn: {
    padding: SPACING.xs,
  },
  screenTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '700',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADII.md,
    gap: 6,
  },
  saveBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
  form: {
    width: '100%',
  },
  label: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: '500',
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  addCatLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  addCatLinkText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.md,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    color: COLORS.text,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: 15,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  genToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginVertical: SPACING.xs,
    gap: 6,
  },
  genToggleText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  catRow: {
    flexDirection: 'row',
    marginVertical: SPACING.xs,
  },
  catChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADII.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    marginRight: SPACING.xs,
  },
  catChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  catChipText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  catChipTextActive: {
    color: '#FFF',
  },
  catChipAdd: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADII.full,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    borderStyle: 'dashed',
    marginRight: SPACING.xs,
  },
  catChipAddText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '500',
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 100,
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
  modalAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    borderRadius: RADII.md,
  },
  modalAddText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
