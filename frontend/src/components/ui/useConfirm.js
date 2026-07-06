import { createContext, useContext } from "react";

export const ConfirmContext = createContext(null);

/**
 * useConfirm() -> confirm(options) : Promise<boolean>
 * A styled, accessible replacement for window.confirm().
 *
 *   const confirm = useConfirm();
 *   if (!(await confirm({ title: "¿Cancelar reserva?" }))) return;
 */
export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm debe usarse dentro de <ConfirmProvider>");
  return ctx;
}
