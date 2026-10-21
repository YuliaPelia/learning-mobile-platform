import { StyleSheet, Text, View } from 'react-native';
import { GradientCard } from '@/components/GradientCard';
import { Screen } from '@/components/Screen';
import { colors, radius, shadow } from '@/theme';

// Вхід і прогрес з'являться після появи мобільного API (див. README).
export default function Profile() {
  return (
    <Screen title="Профіль">
      <GradientCard name="violet" style={styles.card}>
        <Text style={styles.h}>Привіт!</Text>
        <Text style={styles.p}>Тут буде твій прогрес, рівні та бейджі.</Text>
      </GradientCard>
      <View style={styles.note}>
        <Text style={styles.noteT}>Керування підпискою та оплатою доступне лише на сайті itcodecraft.tech.</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { gap: 6, borderRadius: radius.lg },
  h: { color: '#fff', fontSize: 22, fontWeight: '800' },
  p: { color: 'rgba(255,255,255,0.9)' },
  note: { backgroundColor: '#fff', borderRadius: radius.md, padding: 16, ...shadow },
  noteT: { color: colors.muted, lineHeight: 20 },
});
