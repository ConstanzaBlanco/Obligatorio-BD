import { useId } from "react";
import styles from "./Field.module.css";

/**
 * Field — a labelled form control with hint/error slots.
 * Wraps a single control (Input/Select/Textarea) and wires up the label,
 * description, and aria-invalid/aria-describedby for accessibility.
 *
 * Usage:
 *   <Field label="CI a invitar" hint="Solo números" error={err}>
 *     <Input inputMode="numeric" value={ci} onChange={...} />
 *   </Field>
 */
export default function Field({ label, hint, error, required, children }) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  const control = children
    ? Object.assign({}, children, {
        props: {
          ...children.props,
          id: children.props.id || id,
          "aria-invalid": error ? true : children.props["aria-invalid"],
          "aria-describedby":
            [errorId, hintId, children.props["aria-describedby"]]
              .filter(Boolean)
              .join(" ") || undefined,
        },
      })
    : children;

  return (
    <div className={styles.field}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
          {required && <span className={styles.req} aria-hidden="true"> *</span>}
        </label>
      )}
      {control}
      {error ? (
        <p id={errorId} className={styles.error} role="alert">
          {error}
        </p>
      ) : (
        hint && (
          <p id={hintId} className={styles.hint}>
            {hint}
          </p>
        )
      )}
    </div>
  );
}

export function Input({ className = "", ...rest }) {
  return <input className={[styles.control, className].filter(Boolean).join(" ")} {...rest} />;
}

export function Select({ className = "", children, ...rest }) {
  return (
    <select className={[styles.control, styles.select, className].filter(Boolean).join(" ")} {...rest}>
      {children}
    </select>
  );
}

export function Textarea({ className = "", ...rest }) {
  return (
    <textarea className={[styles.control, styles.textarea, className].filter(Boolean).join(" ")} {...rest} />
  );
}
