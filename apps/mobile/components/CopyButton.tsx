import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { Copy, Check } from 'lucide-react-native';
import { COLORS, RADII, SPACING } from '../constants/theme';

interface CopyButtonProps {
  value: string;
  label?: string;
}

export const CopyButton: React.FC<CopyButtonProps> = ({ value, label }) => {
  const [copied, setCopied] = useState(false);
  const [timer, setTimer] = useState<number | null>(null);

  useEffect(() => {
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [timer]);

  const handleCopy = async () => {
    if (!value) return;
    await Clipboard.setStringAsync(value);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCopied(true);

    // Auto-clear clipboard after 30 seconds
    const interval = setTimeout(async () => {
      await Clipboard.setStringAsync('');
      setCopied(false);
    }, 30000);

    setTimer(interval as any);
  };

  return (
    <TouchableOpacity
      style={[styles.button, copied && styles.copiedButton]}
      onPress={handleCopy}
    >
      {copied ? (
        <>
          <Check size={16} color={COLORS.success} />
          <Text style={[styles.text, { color: COLORS.success }]}>
            {label ? 'Copied' : ''}
          </Text>
        </>
      ) : (
        <>
          <Copy size={16} color={COLORS.textMuted} />
          {label && <Text style={styles.text}>{label}</Text>}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADII.sm,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    gap: 6,
  },
  copiedButton: {
    borderColor: COLORS.success,
  },
  text: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '500',
  },
});
