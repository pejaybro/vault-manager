import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { COLORS, RADII, SPACING } from '../constants/theme';

interface SearchBarProps {
  query: string;
  onChangeQuery: (query: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  query,
  onChangeQuery,
  placeholder = 'Search vault...',
}) => {
  return (
    <View style={styles.container}>
      <Search size={18} color={COLORS.textMuted} style={styles.icon} />
      <TextInput
        value={query}
        onChangeText={onChangeQuery}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textMuted}
        style={styles.input}
        autoCorrect={false}
      />
      {query.length > 0 && (
        <TouchableOpacity onPress={() => onChangeQuery('')} style={styles.clearBtn}>
          <X size={16} color={COLORS.textMuted} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADII.md,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    marginVertical: SPACING.sm,
  },
  icon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: 15,
    paddingVertical: SPACING.sm + 2,
  },
  clearBtn: {
    padding: SPACING.xs,
  },
});
