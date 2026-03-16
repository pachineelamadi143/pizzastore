import React, { useEffect, useRef } from 'react';

/* ─── per-toast type metadata ─────────────────────────────────────── */
const TYPE_META = {
  ORDER_PLACED: {
    icon: '🍕',
    title: 'Order Placed!',
    accent: '#22c55e',   // green
    bg: '#f0fdf4',
  },
  ORDER_STATUS_UPDATE: {
    icon: '🔔',
    title: 'Order Update',
    accent: '#f97316',   // orange
    bg: '#fff7ed',
  },
  ORDER_CANCELLED: {
    icon: '✖',
    title: 'Order Cancelled',
    accent: '#ef4444',   // red
    bg: '#fef2f2',
  },
  SUCCESS: {
    icon: '✅',
    title: 'Success!',
    accent: '#22c55e',   // green
    bg: '#f0fdf4',
  },
  ERROR: {
    icon: '❌',
    title: 'Error',
    accent: '#ef4444',   // red
    bg: '#fef2f2',
  }
};

const DEFAULT_META = {
  icon: '📣',
  title: 'Notification',
  accent: '#6366f1',
  bg: '#eef2ff',
};

function getMeta(type) {
  return TYPE_META[type] || DEFAULT_META;
}

/* ─── Single Toast ────────────────────────────────────────────────── */
function Toast({ id, type, message, onClose }) {
  const { icon, title, accent, bg } = getMeta(type);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => onClose(id), 5000);
    return () => clearTimeout(timerRef.current);
  }, [id, onClose]);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        backgroundColor: bg,
        border: `1px solid ${accent}`,
        borderLeft: `4px solid ${accent}`,
        borderRadius: '12px',
        padding: '14px 16px',
        marginBottom: '10px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
        animation: 'ws-toast-in 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        minWidth: '300px',
        maxWidth: '360px',
        position: 'relative',
      }}
    >
      {/* Icon bubble */}
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          backgroundColor: `${accent}22`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.3rem',
          flexShrink: 0,
        }}
      >
        {icon}
      </div>

      {/* Text */}
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: accent, marginBottom: 3 }}>
          {title}
        </div>
        <div style={{ fontSize: '0.82rem', color: '#374151', lineHeight: 1.4 }}>
          {message}
        </div>
      </div>

      {/* Close btn */}
      <button
        onClick={() => onClose(id)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#9ca3af',
          fontSize: '1.1rem',
          padding: 0,
          lineHeight: 1,
        }}
        aria-label="Close notification"
      >
        ×
      </button>

      {/* Progress bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          height: 3,
          borderRadius: '0 0 12px 12px',
          backgroundColor: accent,
          animation: 'ws-toast-progress 5s linear forwards',
          width: '100%',
        }}
      />
    </div>
  );
}

/* ─── Toast Container ─────────────────────────────────────────────── */
function NotificationToast({ toasts, onClose }) {
  return (
    <>
      {/* Keyframe styles injected once */}
      <style>{`
        @keyframes ws-toast-in {
          from { opacity: 0; transform: translateX(60px) scale(0.9); }
          to   { opacity: 1; transform: translateX(0)    scale(1);   }
        }
        @keyframes ws-toast-progress {
          from { width: 100%; }
          to   { width: 0%;   }
        }
      `}</style>

      <div
        style={{
          position: 'fixed',
          top: 80,
          right: 24,
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          pointerEvents: 'none',
        }}
      >
        {toasts.map((t) => (
          <div key={t.id} style={{ pointerEvents: 'auto' }}>
            <Toast id={t.id} type={t.type} message={t.message} onClose={onClose} />
          </div>
        ))}
      </div>
    </>
  );
}

export default NotificationToast;
