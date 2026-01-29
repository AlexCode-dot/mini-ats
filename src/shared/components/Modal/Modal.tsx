import type { ReactNode } from "react";

import styles from "@/shared/components/Modal/Modal.module.scss";

type ModalProps = {
  open: boolean;
  title?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
};

export default function Modal({
  open,
  title,
  onClose,
  children,
  footer,
}: ModalProps) {
  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(event) => event.stopPropagation()}
      >
        {title ? <div className={styles.header}>{title}</div> : null}
        <div className={styles.body}>{children}</div>
        {footer ? <div className={styles.actions}>{footer}</div> : null}
      </div>
    </div>
  );
}
