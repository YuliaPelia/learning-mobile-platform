import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { colors } from '@/theme';
import { makeStyles } from '@/theme/skin';

type Props = TextInputProps & { label: string };

export function Field({ label, style, ...input }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.muted}
        autoCapitalize="none"
        autoCorrect={false}
        style={[styles.input, style]}
        {...input}
      />
    </View>
  );
}

const styles = makeStyles((t) => {
  return StyleSheet.create({
    wrap: { gap: 6 },
    label: { fontSize: 13, fontFamily: t.fonts.semibold, color: colors.muted },
    input: {
      height: 50,
      borderRadius: t.radius.md,
      ...t.glassBorder,
      backgroundColor: colors.card,
      paddingHorizontal: 14,
      fontFamily: t.fonts.regular, fontSize: 16,
      color: colors.text,
    },
  });
});
