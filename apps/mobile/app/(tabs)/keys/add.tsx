import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Save } from 'lucide-react-native';
import { useVault } from '../../../context/VaultContext';
import { KeyData, KeyType } from '@vault/core';
import { COLORS, RADII, SPACING } from '../../../constants/theme';

const KEY_TYPES: { label: string; value: KeyType }[] = [
  { label: 'API Key', value: 'api_key' },
  { label: 'SSH Key', value: 'ssh_key' },
  { label: 'Certificate', value: 'certificate' },
  { label: 'Token (JWT/OAuth)', value: 'token' },
  { label: 'Secure Note', value: 'note' },
  { label: 'Other', value: 'other' },
];

export default function AddKeyScreen() {
  const router = useRouter();
  const { addEntry } = useVault();

  const [name, setName] = useState('');
  const [keyType, setKeyType] = useState<KeyType>('api_key');
  const [keyValue, setKeyValue] = useState('');
  const [description, setDescription] = useState('');
  const [tagsStr, setTagsStr] = useState('');

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a key name');
      return;
    }
    if (!keyValue.trim()) {
      Alert.alert('Error', 'Please enter the key value or content');
      return;
    }

    const tags = tagsStr
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const data: KeyData = {
      keyType,
      keyValue: keyValue.trim(),
      description: description.trim() || undefined,
      tags: tags.length > 0 ? tags : undefined,
    };

    await addEntry({
      type: 'key',
      name: name.trim(),
      favourite: false,
      data,
    });

    router.back();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={20} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>New Key / Note</Text>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Save size={18} color="#FFF" />
          <Text style={styles.saveBtnText}>Save</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Key Name *</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="e.g. AWS Production API Key, GitHub SSH Key"
          placeholderTextColor={COLORS.textMuted}
          style={styles.input}
        />

        <Text style={styles.label}>Type</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeRow}>
          {KEY_TYPES.map((t) => (
            <TouchableOpacity
              key={t.value}
              style={[styles.typeChip, keyType === t.value && styles.typeChipActive]}
              onPress={() => setKeyType(t.value)}
            >
              <Text style={[styles.typeChipText, keyType === t.value && styles.typeChipTextActive]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.label}>
          {keyType === 'note' ? 'Secure Note Content *' : 'Key / Token Value *'}
        </Text>
        <TextInput
          value={keyValue}
          onChangeText={setKeyValue}
          placeholder={
            keyType === 'ssh_key'
              ? 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQ...'
              : keyType === 'note'
              ? 'Type sensitive note content here...'
              : 'AKIAIOSFODNN7EXAMPLE'
          }
          placeholderTextColor={COLORS.textMuted}
          style={[styles.input, styles.textArea, styles.monospace]}
          multiline
          numberOfLines={6}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text style={styles.label}>Description (optional)</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="What is this key used for?"
          placeholderTextColor={COLORS.textMuted}
          style={styles.input}
        />

        <Text style={styles.label}>Tags (comma-separated)</Text>
        <TextInput
          value={tagsStr}
          onChangeText={setTagsStr}
          placeholder="production, aws, server-1"
          placeholderTextColor={COLORS.textMuted}
          style={styles.input}
          autoCapitalize="none"
        />
      </View>
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
    height: 120,
    textAlignVertical: 'top',
  },
  monospace: {
    fontFamily: 'monospace',
    fontSize: 13,
  },
  typeRow: {
    flexDirection: 'row',
    marginVertical: SPACING.xs,
  },
  typeChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADII.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    marginRight: SPACING.xs,
  },
  typeChipActive: {
    backgroundColor: COLORS.warning,
    borderColor: COLORS.warning,
  },
  typeChipText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  typeChipTextActive: {
    color: '#1A1A1A',
  },
});
