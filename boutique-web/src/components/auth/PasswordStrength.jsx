import { useTranslation } from 'react-i18next';
import { getPasswordStrength } from '../../utils/validation';

const STRENGTH_COLOR = { weak: '#ef4444', medium: '#f97316', strong: '#22c55e' };
const STRENGTH_LEVEL = { weak: 1, medium: 2, strong: 3 };
const LABELS = {
  weak: { ar: 'ضعيف', en: 'Weak' },
  medium: { ar: 'متوسط', en: 'Medium' },
  strong: { ar: 'قوي', en: 'Strong' },
};

export default function PasswordStrength({ password }) {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  if (!password) return null;

  const strength = getPasswordStrength(password);
  const level = STRENGTH_LEVEL[strength];
  const color = STRENGTH_COLOR[strength];

  return (
    <div style={{ marginTop: '6px' }}>
      <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: '3px',
              borderRadius: '2px',
              background: i <= level ? color : 'var(--theme-border)',
              transition: 'background 0.3s ease',
            }}
          />
        ))}
      </div>
      <p style={{ fontSize: '0.75rem', color, margin: 0, transition: 'color 0.3s' }}>
        {isArabic ? LABELS[strength].ar : LABELS[strength].en}
      </p>
    </div>
  );
}
