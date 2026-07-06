import { createContext, useContext } from "react";

export const ToastContext = createContext(null);

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
