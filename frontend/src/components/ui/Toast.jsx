import { createContext, useContext, useCallback, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./Toast.module.css";

const ToastContext = createContext(null);

/**
 * useToast() -> { toast, success, error, info, warning }
 * Each returns void and shows a transient, accessible notification.
 *   const { success, error } = useToast();
 *   success("Reserva cancelada");
 *   error("No se pudo cancelar la reserva");
 */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast debe usarse dentro de <ToastProvider>");
  return ctx;
}

const ICONS = {
  success: "M20 6 9 17l-5-5",
  error: "M18 6 6 18M6 6l12 12",
  warning: "M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z",
  info: "M12 16v-4m0-4h.01M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z",
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (message, variant = "info", duration = 4200) => {
      const id = ++idRef.current;
      setToasts((list) => [...list, { id, message, variant }]);
      if (duration > 0) window.setTimeout(() => dismiss(id), duration);
      return id;
    },
    [dismiss]
  );

  const api = {
    toast: push,
    success: (m, d) => push(m, "success", d),
    error: (m, d) => push(m, "error", d),
    warning: (m, d) => push(m, "warning", d),
    info: (m, d) => push(m, "info", d),
    dismiss,
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      {createPortal(
        <div className={styles.viewport} role="region" aria-label="Notificaciones">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`${styles.toast} ${styles[t.variant]}`}
              role={t.variant === "error" ? "alert" : "status"}
              aria-live={t.variant === "error" ? "assertive" : "polite"}
            >
              <svg className={styles.icon} width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d={ICONS[t.variant]} />
              </svg>
              <span className={styles.message}>{t.message}</span>
              <button type="button" className={styles.close} onClick={() => dismiss(t.id)} aria-label="Descartar">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}
