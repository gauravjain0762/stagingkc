import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeToast } from '../store/slices/toastSlice';
import { navigateTo } from '../store/slices/uiSlice';

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

const TOAST_THEME = {
  success: { bg: '#0f2718', border: '#16a34a', iconBg: '#16a34a22', iconColor: '#4ade80', bar: '#16a34a' },
  info:    { bg: '#0d1720', border: '#1d4ed8', iconBg: '#1d4ed822', iconColor: '#60a5fa', bar: '#1d4ed8' },
  error:   { bg: '#2a0d0d', border: '#dc2626', iconBg: '#dc262622', iconColor: '#f87171', bar: '#dc2626' },
  warning: { bg: '#2a1f0d', border: '#d97706', iconBg: '#d9770622', iconColor: '#fbbf24', bar: '#d97706' },
};

function ToastItem({ toast }) {
  const dispatch = useDispatch();
  const theme = TOAST_THEME[toast.type] ?? TOAST_THEME.error;
  const Icon = toast.type === 'success' ? CheckIcon : toast.type === 'info' ? BellIcon : toast.type === 'warning' ? WarningIcon : XIcon;

  useEffect(() => {
    const t = setTimeout(() => dispatch(removeToast(toast.id)), 3500);
    return () => clearTimeout(t);
  }, [toast.id, dispatch]);

  function handleClick() {
    if (!toast.meta) return;
    dispatch(navigateTo(toast.meta));
    dispatch(removeToast(toast.id));
  }

  return (
    <div
      onClick={handleClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '12px 16px',
        borderRadius: 10,
        background: theme.bg,
        border: `1px solid ${theme.border}`,
        color: '#f1f5f9',
        fontSize: 14,
        fontWeight: 500,
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        minWidth: 260,
        maxWidth: 380,
        animation: 'toast-in 0.25s ease',
        position: 'relative',
        overflow: 'hidden',
        cursor: toast.meta ? 'pointer' : 'default',
      }}>
      {/* progress bar */}
      <span style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        height: 3,
        width: '100%',
        background: theme.bar,
        animation: 'toast-progress 3.5s linear forwards',
        transformOrigin: 'left',
      }} />

      <span style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 28,
        height: 28,
        borderRadius: '50%',
        background: theme.iconBg,
        color: theme.iconColor,
        flexShrink: 0,
      }}>
        <Icon />
      </span>

      <span style={{ flex: 1, lineHeight: 1.4 }}>{toast.message}</span>

      <button
        onClick={e => { e.stopPropagation(); dispatch(removeToast(toast.id)); }}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#64748b',
          padding: 2,
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}

export default function Toast() {
  const { toasts } = useSelector(s => s.toast);

  if (!toasts.length) return null;

  return (
    <>
      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes toast-progress {
          from { transform: scaleX(1); }
          to   { transform: scaleX(0); }
        }
      `}</style>
      <div style={{
        position: 'fixed',
        top: 20,
        right: 20,
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        pointerEvents: 'none',
      }}>
        {toasts.map(t => (
          <div key={t.id} style={{ pointerEvents: 'all' }}>
            <ToastItem toast={t} />
          </div>
        ))}
      </div>
    </>
  );
}
