import { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export default function FormInput({
  label,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  icon: Icon,
  required,
  autoComplete,
}) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && (
        <label
          htmlFor={name}
          style={{
            fontSize: '0.875rem',
            fontWeight: 500,
            color: 'var(--theme-text-secondary)',
          }}
        >
          {label}
        </label>
      )}

      <div style={{ position: 'relative' }}>
        {Icon && (
          <span
            style={{
              position: 'absolute',
              top: '50%',
              transform: 'translateY(-50%)',
              insetInlineStart: '14px',
              color: focused ? 'var(--theme-accent)' : 'var(--theme-text-hint)',
              display: 'flex',
              pointerEvents: 'none',
              transition: 'color 0.2s',
              zIndex: 1,
            }}
          >
            <Icon style={{ width: '18px', height: '18px' }} />
          </span>
        )}

        <input
          id={name}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          className="theme-input"
          style={{
            width: '100%',
            boxSizing: 'border-box',
            background: 'var(--theme-surface)',
            border: `1px solid ${error ? '#ef4444' : focused ? 'var(--theme-accent)' : 'var(--theme-border)'}`,
            color: 'var(--theme-text-primary)',
            borderRadius: '10px',
            paddingTop: '12px',
            paddingBottom: '12px',
            paddingInlineStart: Icon ? '44px' : '16px',
            paddingInlineEnd: isPassword ? '44px' : '16px',
            fontSize: '0.9375rem',
            outline: 'none',
            transition: 'border-color 0.2s',
          }}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            tabIndex={-1}
            style={{
              position: 'absolute',
              top: '50%',
              transform: 'translateY(-50%)',
              insetInlineEnd: '14px',
              color: 'var(--theme-text-hint)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              padding: 0,
            }}
          >
            {showPassword
              ? <EyeSlashIcon style={{ width: '18px', height: '18px' }} />
              : <EyeIcon style={{ width: '18px', height: '18px' }} />
            }
          </button>
        )}
      </div>

      {error && (
        <p style={{ fontSize: '0.8125rem', color: '#ef4444', margin: 0 }}>{error}</p>
      )}
    </div>
  );
}
