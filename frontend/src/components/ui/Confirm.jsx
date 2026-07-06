import { createContext, useContext, useCallback, useState } from "react";
import Modal from "./Modal";
import Button from "./Button";

const ConfirmContext = createContext(null);

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

export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null);

  const confirm = useCallback((options = {}) => {
    return new Promise((resolve) => {
      setState({ options, resolve });
    });
  }, []);

  const close = (result) => {
    state?.resolve(result);
    setState(null);
  };

  const o = state?.options ?? {};

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Modal
        isOpen={!!state}
        onClose={() => close(false)}
        title={o.title || "¿Confirmás la acción?"}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => close(false)}>
              {o.cancelText || "Cancelar"}
            </Button>
            <Button variant={o.danger ? "danger" : "primary"} onClick={() => close(true)}>
              {o.confirmText || "Confirmar"}
            </Button>
          </>
        }
      >
        {o.message && <p style={{ color: "var(--color-text-muted)", lineHeight: "var(--leading-normal)" }}>{o.message}</p>}
      </Modal>
    </ConfirmContext.Provider>
  );
}
