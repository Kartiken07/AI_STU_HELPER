import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = nextId++;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const bgColor = (type: string) => {
    switch (type) {
      case 'success': return 'rgba(34, 197, 94, 0.95)';
      case 'error': return 'rgba(239, 68, 68, 0.95)';
      default: return 'rgba(99, 102, 241, 0.95)';
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div style={{
        position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999,
        display: 'flex', flexDirection: 'column', gap: '8px',
      }}>
        {toasts.map(toast => (
          <div key={toast.id} style={{
            background: bgColor(toast.type),
            color: 'white', padding: '14px 20px', borderRadius: '12px',
            fontSize: '14px', fontWeight: 500,
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            cursor: 'pointer', maxWidth: '360px',
            animation: 'slideInRight 0.3s ease',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.1)',
          }} onClick={() => removeToast(toast.id)}>
            {toast.message}
          </div>
        ))}
      </div>
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
