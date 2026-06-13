import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { themes } from '../theme/colors';

const theme = themes.default;

export default function LoadingScreen({ message }) {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={theme.accent} />
      <Text style={styles.text}>{message || t('common.loading')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.bg,
  },
  text: { marginTop: 12, fontSize: 14, color: theme.textSecondary },
});
