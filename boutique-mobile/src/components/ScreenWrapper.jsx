import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { themes } from '../theme/colors';

const theme = themes.default;

export default function ScreenWrapper({ children, style }) {
  return (
    <SafeAreaView style={[styles.safe, style]}>
      {/* Subtle warm decorative accent — top right */}
      <View style={styles.decorBlob} pointerEvents="none" />
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bg },
  decorBlob: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(139, 105, 20, 0.04)',
  },
});
