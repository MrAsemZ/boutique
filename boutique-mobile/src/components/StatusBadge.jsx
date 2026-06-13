import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

const STATUS_COLORS = {
  pending: { bg: '#FFF3CD', text: '#856404' },
  processing: { bg: '#CCE5FF', text: '#004085' },
  shipped: { bg: '#D1ECF1', text: '#0C5460' },
  delivered: { bg: '#D4EDDA', text: '#155724' },
  cancelled: { bg: '#F8D7DA', text: '#721C24' },
};

export default function StatusBadge({ status }) {
  const { t } = useTranslation();
  const colors = STATUS_COLORS[status] || STATUS_COLORS.pending;
  const label = t(`order.status_${status}`, { defaultValue: status });

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <Text style={[styles.text, { color: colors.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 50,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  text: { fontSize: 11, fontWeight: '600' },
});
