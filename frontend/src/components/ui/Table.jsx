import styles from "./Table.module.css";

/**
 * Table — styled table inside a horizontal-scroll container so wide tables
 * never push the page sideways. Pass a standard <thead>/<tbody> as children.
 * `dense` tightens row padding for data-heavy screens.
 */
export default function Table({ dense = false, className = "", children, ...rest }) {
  return (
    <div className={styles.wrap}>
      <table
        className={[styles.table, dense ? styles.dense : "", className].filter(Boolean).join(" ")}
        {...rest}
      >
        {children}
      </table>
    </div>
  );
}
