import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Save, Sparkles } from 'lucide-react-native';
import { useVault } from '../../../../context/VaultContext';
import { SecureInput } from '../../../../components/SecureInput';
import { PasswordGenerator } from '../../../../components/PasswordGenerator';
import { COLORS, RADII, SPACING } from '../../../../constants/theme';
import { Category, PasswordData } from '@vault/core';

const CATEGORIES: { label: string; value: Category }[] = [
  { label: 'Work', value: 'work' },
  { label: 'Social', value: 'social' },
  { label: 'Banking', value: 'banking' },
  { label: 'Shopping', value: 'shopping' },
  { label: 'Email', value: 'email' },
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

  if (!entry || entry.type !== 'password') {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Password entry not found</Text>
      </View>
    );
  }

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

    await updateEntry(entry.id, {
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
          placeholder="Service Name"
          placeholderTextColor={COLORS.textMuted}
          style={styles.input}
        />

        <Text style={styles.label}>Username or Email</Text>
        <TextInput
          value={username}
          onChangeText={setUsername}
          placeholder="Username / Email"
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

        <Text style={styles.label}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catRow}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.value}
              style={[styles.catChip, category === cat.value && styles.catChipActive]}
              onPress={() => setCategory(cat.value)}
            >
              <Text style={[styles.catChipText, category === cat.value && styles.catChipTextActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.label}>Website URL</Text>
        <TextInput
          value={url}
          onChangeText={setUrl}
          placeholder="https://..."
          placeholderTextColor={COLORS.textMuted}
          style={styles.input}
          autoCapitalize="none"
          keyboardType="url"
        />

        <Text style={styles.label}>Notes</Text>
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
});
