"use client";

import { useId, useState } from "react";

import Modal from "@/shared/components/Modal/Modal";
import Button from "@/shared/components/Button/Button";
import styles from "@/shared/components/ConfirmDialog/ConfirmDialog.module.scss";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmText?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmText,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [confirmInput, setConfirmInput] = useState("");
  const confirmInputId = useId();

  const needsConfirmText = Boolean(confirmText);
  const isConfirmBlocked =
    needsConfirmText && confirmInput.trim() !== confirmText;
  const handleCancel = () => {
    setConfirmInput("");
    onCancel();
  };
  const handleConfirm = () => {
    setConfirmInput("");
    onConfirm();
  };

  return (
    <Modal open={open} onClose={handleCancel} title={title}>
      <p className={styles.message}>{message}</p>
      {needsConfirmText ? (
        <div className={styles.confirmBlock}>
          <label className={styles.confirmLabel} htmlFor={confirmInputId}>
            Type <strong>{confirmText}</strong> to confirm
          </label>
          <input
            id={confirmInputId}
            className={styles.confirmInput}
            value={confirmInput}
            onChange={(event) => setConfirmInput(event.target.value)}
            placeholder={confirmText}
          />
        </div>
      ) : null}
      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={handleCancel}>
          {cancelLabel}
        </Button>
        <Button
          type="button"
          onClick={handleConfirm}
          disabled={isConfirmBlocked}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
