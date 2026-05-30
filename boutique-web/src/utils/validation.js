import i18n from '../i18n/index.js';

function ar() { return i18n.language === 'ar'; }

export function validateEmail(email) {
  if (!email || !email.trim()) {
    return ar() ? 'البريد الإلكتروني مطلوب' : 'Email is required';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return ar() ? 'بريد إلكتروني غير صحيح' : 'Invalid email address';
  }
  return null;
}

export function validatePassword(password, minLen = 6) {
  if (!password) {
    return ar() ? 'كلمة المرور مطلوبة' : 'Password is required';
  }
  if (password.length < minLen) {
    return ar()
      ? `يجب أن تكون كلمة المرور ${minLen} أحرف على الأقل`
      : `Password must be at least ${minLen} characters`;
  }
  return null;
}

export function validatePasswordMatch(password, confirm) {
  if (!confirm) {
    return ar() ? 'تأكيد كلمة المرور مطلوب' : 'Please confirm your password';
  }
  if (password !== confirm) {
    return ar() ? 'كلمة المرور غير متطابقة' : 'Passwords do not match';
  }
  return null;
}

export function validateRequired(value, fieldName = '') {
  const empty = !value || (typeof value === 'string' && !value.trim());
  if (empty) {
    return ar() ? `${fieldName} مطلوب` : `${fieldName} is required`;
  }
  return null;
}

export function getPasswordStrength(password) {
  if (!password || password.length < 8) return 'weak';
  const hasNumberOrSpecial = /[0-9!@#$%^&*()\-_=+[\]{};':"\\|,.<>/?]/.test(password);
  return hasNumberOrSpecial ? 'strong' : 'medium';
}
