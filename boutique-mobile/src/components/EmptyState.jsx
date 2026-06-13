import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { themes } from '../theme/colors';

const theme = themes.default;

export default function EmptyState({ icon = '📦', title, description, actionLabel, onAction }) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {actionLabel && onAction ? (
        <TouchableOpacity style={styles.actionBtn} onPress={onAction}>
          <Text style={styles.actionText}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  icon: { fontSize: 56, marginBottom: 16 },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  actionBtn: {
    backgroundColor: theme.accent,
    borderRadius: 50,
    paddingHorizontal: 28,
    paddingVertical: 12,
  },
  actionText: { color: theme.surface, fontSize: 14, fontWeight: '600' },
});
