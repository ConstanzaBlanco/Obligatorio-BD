import { useCallback, useState } from "react";
import Modal from "./Modal";
import Button from "./Button";
import { ConfirmContext } from "./useConfirm";

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
