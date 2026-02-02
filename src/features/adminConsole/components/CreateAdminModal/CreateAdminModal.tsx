"use client";

import { useState } from "react";

import type {
  CreateAdminPayload,
  CreateAdminResponse,
} from "@/features/adminConsole/types";
import { MIN_PASSWORD_LENGTH } from "@/core/validation/isPasswordStrong";
import styles from "@/features/adminConsole/components/CreateAdminModal/CreateAdminModal.module.scss";
import Button from "@/shared/components/Button/Button";
import Modal from "@/shared/components/Modal/Modal";
import FormField from "@/shared/components/FormField/FormField";
import PasswordField from "@/shared/components/PasswordField/PasswordField";

type CreateAdminModalProps = {
  open: boolean;
  onClose: () => void;
  onCreate: (payload: CreateAdminPayload) => Promise<CreateAdminResponse>;
};

function generatePassword() {
  const cryptoObj = typeof globalThis !== "undefined" ? globalThis.crypto : undefined;

  if (cryptoObj?.randomUUID) {
    return cryptoObj.randomUUID();
  }

  if (cryptoObj?.getRandomValues) {
    const buffer = new Uint32Array(4);
    cryptoObj.getRandomValues(buffer);
    return Array.from(buffer, (value) => value.toString(36)).join("");
  }

  return "";
}

export default function CreateAdminModal({
  open,
  onClose,
  onCreate,
}: CreateAdminModalProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdPassword, setCreatedPassword] = useState<string | null>(null);
  const [isPasswordCopied, setIsPasswordCopied] = useState(false);
  const formId = "create-admin-form";

  if (!open) return null;

  const handleClose = () => {
    setIsSuccess(false);
    setCreatedPassword(null);
    setError(null);
    setIsPasswordCopied(false);
    setEmail("");
    setName("");
    setPassword("");
    onClose();
  };

  const handleCopyPassword = async () => {
    if (!createdPassword) return;
    await navigator.clipboard?.writeText(createdPassword);
    setIsPasswordCopied(true);
    window.setTimeout(() => setIsPasswordCopied(false), 2000);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setIsSuccess(false);
    setCreatedPassword(null);

    try {
      const payload: CreateAdminPayload = {
        email,
        name: name || undefined,
        password,
      };
      await onCreate(payload);
      setIsSuccess(true);
      setCreatedPassword(password);
      setPassword("");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create admin";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={isSuccess ? "Admin created" : "Create Admin"}
      footer={
        isSuccess ? (
          <>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleCopyPassword}
            >
              {isPasswordCopied ? "Password copied" : "Copy password"}
            </Button>
            <Button type="button" onClick={handleClose}>
              Close
            </Button>
          </>
        ) : (
          <>
            <Button type="button" variant="secondary" onClick={handleClose}>
              Close
            </Button>
            <Button type="submit" form={formId} disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Admin"}
            </Button>
          </>
        )
      }
    >
      {isSuccess ? (
        <div className={styles.notice}>
          <div>Email: {email}</div>
          <div>
            Password: <strong>••••••••</strong>
          </div>
        </div>
      ) : (
        <form id={formId} className={styles.form} onSubmit={handleSubmit}>
          <FormField
            label="Admin email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <FormField
            label="Admin name (optional)"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <PasswordField
            label="Password"
            value={password}
            onChange={setPassword}
            onGenerate={generatePassword}
            onCopy={(value) => void navigator.clipboard?.writeText(value)}
            hint={`Minimum ${MIN_PASSWORD_LENGTH} characters.`}
            error={error}
            required
          />
        </form>
      )}
    </Modal>
  );
}
