"use client";

import { useState } from "react";

import type {
  CreateOrganizationPayload,
  CreateOrganizationResponse,
} from "@/features/adminConsole/types";
import { MIN_PASSWORD_LENGTH } from "@/core/validation/isPasswordStrong";
import styles from "@/features/adminConsole/components/CreateCustomerModal/CreateCustomerModal.module.scss";
import Button from "@/shared/components/Button/Button";
import Modal from "@/shared/components/Modal/Modal";
import FormField from "@/shared/components/FormField/FormField";
import PasswordField from "@/shared/components/PasswordField/PasswordField";

type CreateCustomerModalProps = {
  open: boolean;
  onClose: () => void;
  onCreate: (
    payload: CreateOrganizationPayload
  ) => Promise<CreateOrganizationResponse>;
};

function generatePassword() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    const buffer = new Uint32Array(4);
    crypto.getRandomValues(buffer);
    return Array.from(buffer, (value) => value.toString(36)).join("");
  }

  return "";
}

export default function CreateCustomerModal({
  open,
  onClose,
  onCreate,
}: CreateCustomerModalProps) {
  const [orgName, setOrgName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdPassword, setCreatedPassword] = useState<string | null>(null);
  const formId = "create-customer-form";

  const handleClose = () => {
    setIsSuccess(false);
    setError(null);
    setCreatedPassword(null);
    setOrgName("");
    setCustomerEmail("");
    setCustomerName("");
    setPassword("");
    onClose();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setIsSuccess(false);
    setCreatedPassword(null);

    try {
      const payload: CreateOrganizationPayload = {
        orgName,
        customerEmail,
        customerName: customerName || undefined,
        password,
      };
      await onCreate(payload);
      setIsSuccess(true);
      setCreatedPassword(password);
      setPassword("");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create customer";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={isSuccess ? "Customer created" : "Create Customer"}
      footer={
        isSuccess ? (
          <>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() =>
                createdPassword
                  ? void navigator.clipboard?.writeText(createdPassword)
                  : null
              }
            >
              Copy password
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
              {isSubmitting ? "Creating..." : "Create Customer"}
            </Button>
          </>
        )
      }
    >
      {isSuccess ? (
        <div className={styles.notice}>
          <div>Email: {customerEmail}</div>
          <div>
            Password: <strong>••••••••</strong>
          </div>
        </div>
      ) : (
        <form id={formId} className={styles.form} onSubmit={handleSubmit}>
          <FormField
            label="Organization name"
            value={orgName}
            onChange={(event) => setOrgName(event.target.value)}
            required
          />
          <FormField
            label="Customer email"
            type="email"
            value={customerEmail}
            onChange={(event) => setCustomerEmail(event.target.value)}
            required
          />
          <FormField
            label="Customer name (optional)"
            value={customerName}
            onChange={(event) => setCustomerName(event.target.value)}
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
