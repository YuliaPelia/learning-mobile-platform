import { StyleSheet, View } from 'react-native';
import { CourseCard } from '@/components/CourseCard';
import { Screen } from '@/components/Screen';
import { useAsync } from '@/components/useAsync';
import { getCourses } from '@/lib/api';
import { mockCourses } from '@/data/mock';

export default function Courses() {
  const courses = useAsync(getCourses, mockCourses);
  return (
    <Screen title="Курси">
      <View style={styles.list}>
        {courses.map((c) => <CourseCard key={c.id} course={c} />)}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({ list: { gap: 14 } });
