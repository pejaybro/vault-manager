import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { RefreshCw, Copy, Check } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { COLORS, RADII, SPACING } from '../constants/theme';

interface PasswordGeneratorProps {
  onSelectPassword?: (password: string) => void;
}

export function generateRandomPassword(
  length = 16,
  useUpper = true,
  useLower = true,
  useNumbers = true,
  useSymbols = true
): string {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  let charset = '';
  if (useUpper) charset += upper;
  if (useLower) charset += lower;
  if (useNumbers) charset += numbers;
  if (useSymbols) charset += symbols;

  if (!charset) charset = lower + numbers;

  let password = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
}

export function calculatePasswordStrength(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: 'Empty', color: COLORS.textMuted };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { score, label: 'Weak', color: COLORS.danger };
  if (score <= 4) return { score, label: 'Medium', color: COLORS.warning };
  return { score, label: 'Strong', color: COLORS.success };
}

export const PasswordGenerator: React.FC<PasswordGeneratorProps> = ({ onSelectPassword }) => {
  const [length, setLength] = useState(16);
  const [useUpper, setUseUpper] = useState(true);
  const [useLower, setUseLower] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [copied, setCopied] = useState(false);

  const [generated, setGenerated] = useState(() =>
    generateRandomPassword(length, useUpper, useLower, useNumbers, useSymbols)
  );

  const handleGenerate = () => {
    const newPass = generateRandomPassword(length, useUpper, useLower, useNumbers, useSymbols);
    setGenerated(newPass);
    setCopied(false);
  };

  const handleCopy = async () => {
    await Clipboard.setStringAsync(generated);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const strength = calculatePasswordStrength(generated);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Password Generator</Text>

      <View style={styles.resultBox}>
        <Text style={styles.generatedText}>{generated}</Text>
        <TouchableOpacity style={styles.iconBtn} onPress={handleGenerate}>
          <RefreshCw size={20} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn} onPress={handleCopy}>
          {copied ? <Check size={20} color={COLORS.success} /> : <Copy size={20} color={COLORS.textMuted} />}
        </TouchableOpacity>
      </View>

      <View style={styles.strengthRow}>
        <Text style={styles.strengthLabel}>Strength: </Text>
        <Text style={[styles.strengthValue, { color: strength.color }]}>{strength.label}</Text>
      </View>

      <View style={styles.options}>
        <View style={styles.optionRow}>
          <Text style={styles.optionText}>Length: {length}</Text>
          <View style={styles.lengthButtons}>
            {[12, 16, 20, 24].map((l) => (
              <TouchableOpacity
                key={l}
                style={[styles.lenBtn, length === l && styles.lenBtnActive]}
                onPress={() => {
                  setLength(l);
                  setGenerated(generateRandomPassword(l, useUpper, useLower, useNumbers, useSymbols));
                }}
              >
                <Text style={[styles.lenBtnText, length === l && styles.lenBtnTextActive]}>{l}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.toggleRow}>
          <Text style={styles.optionText}>Uppercase (A-Z)</Text>
          <Switch value={useUpper} onValueChange={setUseUpper} trackColor={{ true: COLORS.primary }} />
        </View>

        <View style={styles.toggleRow}>
          <Text style={styles.optionText}>Lowercase (a-z)</Text>
          <Switch value={useLower} onValueChange={setUseLower} trackColor={{ true: COLORS.primary }} />
        </View>

        <View style={styles.toggleRow}>
          <Text style={styles.optionText}>Numbers (0-9)</Text>
          <Switch value={useNumbers} onValueChange={setUseNumbers} trackColor={{ true: COLORS.primary }} />
        </View>

        <View style={styles.toggleRow}>
          <Text style={styles.optionText}>Symbols (!@#$)</Text>
          <Switch value={useSymbols} onValueChange={setUseSymbols} trackColor={{ true: COLORS.primary }} />
        </View>
      </View>

      {onSelectPassword && (
        <TouchableOpacity
          style={styles.useBtn}
          onPress={() => onSelectPassword(generated)}
        >
          <Text style={styles.useBtnText}>Use This Password</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.lg,
    padding: SPACING.md,
    marginVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  title: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: SPACING.sm,
  },
  resultBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADII.md,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  generatedText: {
    flex: 1,
    color: COLORS.accent,
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  iconBtn: {
    padding: SPACING.xs,
    marginLeft: SPACING.xs,
  },
  strengthRow: {
    flexDirection: 'row',
    marginTop: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  strengthLabel: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
  strengthValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  options: {
    gap: SPACING.xs,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  optionText: {
    color: COLORS.text,
    fontSize: 14,
  },
  lengthButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  lenBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADII.sm,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  lenBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  lenBtnText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  lenBtnTextActive: {
    color: '#FFF',
  },
  useBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    borderRadius: RADII.md,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  useBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
