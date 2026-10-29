import { StyleSheet, Text, View } from 'react-native';
import { Robot, type RobotMood } from '@/components/Robot';
import { colors } from '@/theme';
import { calm, makeStyles, useSkin } from '@/theme/skin';

/** Робот-помічник із репплікою: говорить те, що важливо для цієї людини зараз. */
export function MascotBubble({ text, happy, mood }: { text: string; happy?: boolean; mood?: RobotMood }) {
  // Спокійна шкіра: без великого робота — лише тихий рядок-підказка
  if (useSkin() === 'pro') {
    return (
      <View style={styles.note}>
        <Text style={styles.text}>{calm(text)}</Text>
      </View>
    );
  }
  return (
    <View style={styles.row}>
      <Robot size={64} mood={mood ?? (happy ? 'happy' : 'idle')} />
      <View style={styles.bubble}>
        <View style={styles.tail} />
        <Text style={styles.text}>{text}</Text>
      </View>
    </View>
  );
}

const styles = makeStyles((t) => {
  return StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    bubble: { flex: 1, backgroundColor: colors.card, ...t.glassBorder, borderRadius: t.radius.md, paddingVertical: 12, paddingHorizontal: 14 },
    tail: { position: 'absolute', left: -7, top: '50%', marginTop: -6, width: 12, height: 12, backgroundColor: colors.card, borderLeftWidth: 1, borderBottomWidth: 1, borderColor: colors.border, transform: [{ rotate: '45deg' }] },
    note: { borderLeftWidth: 2, borderLeftColor: colors.action, paddingLeft: 12, paddingVertical: 2 },
    text: { fontFamily: t.fonts.semibold, fontSize: 15, lineHeight: 20, color: colors.text },
  });
});
