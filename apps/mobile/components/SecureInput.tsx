import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { COLORS, RADII, SPACING } from '../constants/theme';

interface SecureInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  style?: ViewStyle;
  error?: string;
}

export const SecureInput: React.FC<SecureInputProps> = ({
  value,
  onChangeText,
  placeholder = 'Password',
  label,
  style,
  error,
}) => {
  const [show, setShow] = useState(false);

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputWrapper, error ? styles.inputError : null]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!show}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textMuted}
          style={styles.input}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity style={styles.eyeBtn} onPress={() => setShow(!show)}>
          {show ? (
            <EyeOff size={20} color={COLORS.textMuted} />
          ) : (
            <Eye size={20} color={COLORS.textMuted} />
          )}
        </TouchableOpacity>
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.xs,
  },
  label: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginBottom: SPACING.xs,
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADII.md,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    paddingHorizontal: SPACING.md,
  },
  inputError: {
    borderColor: COLORS.danger,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: 16,
    paddingVertical: SPACING.md,
  },
  eyeBtn: {
    padding: SPACING.xs,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 12,
    marginTop: 4,
  },
});
