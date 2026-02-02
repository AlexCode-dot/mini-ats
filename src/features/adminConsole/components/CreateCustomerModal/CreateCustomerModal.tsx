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
  const cryptoObj =
    typeof globalThis !== "undefined" ? globalThis.crypto : undefined;

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

export default function CreateCustomerModal({
  open,
  onClose,
  onCreate,
}: CreateCustomerModalProps) {
  const [orgName, setOrgName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [password, setPassword] = useState("");
  const [sendInvite, setSendInvite] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdPassword, setCreatedPassword] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [isPasswordCopied, setIsPasswordCopied] = useState(false);
  const [isInviteCopied, setIsInviteCopied] = useState(false);
  const formId = "create-customer-form";

  const handleClose = () => {
    setIsSuccess(false);
    setError(null);
    setCreatedPassword(null);
    setInviteLink(null);
    setIsPasswordCopied(false);
    setIsInviteCopied(false);
    setOrgName("");
    setCustomerEmail("");
    setCustomerName("");
    setPassword("");
    setSendInvite(false);
    onClose();
  };

  const handleCopyInvite = async () => {
    if (!inviteLink) return;
    await navigator.clipboard?.writeText(inviteLink);
    setIsInviteCopied(true);
    window.setTimeout(() => setIsInviteCopied(false), 2000);
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
    setInviteLink(null);

    try {
      const payload: CreateOrganizationPayload = {
        orgName,
        customerEmail,
        customerName: customerName || undefined,
        ...(sendInvite ? {} : { password }),
        sendInvite,
      };
      const result = await onCreate(payload);
      setIsSuccess(true);
      setCreatedPassword(sendInvite ? null : password);
      setInviteLink(result.inviteLink ?? null);
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
            {sendInvite ? (
              inviteLink ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleCopyInvite}
                >
                  {isInviteCopied ? "Invite copied" : "Copy invite link"}
                </Button>
              ) : null
            ) : (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleCopyPassword}
              >
                {isPasswordCopied ? "Password copied" : "Copy password"}
              </Button>
            )}
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
          {sendInvite ? (
            <div className={styles.noticeSubtext}>
              Invite sent. The customer can set a password from the email.
            </div>
          ) : (
            <div>
              Password: <strong>••••••••</strong>
            </div>
          )}
          {sendInvite && inviteLink ? (
            <div className={styles.inviteRow}>
              <button
                type="button"
                className={styles.inviteButton}
                onClick={handleCopyInvite}
              >
                {isInviteCopied ? "Invite copied" : "Copy invite link"}
              </button>
            </div>
          ) : null}
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
          <div className={styles.inviteToggle}>
            <label className={styles.inviteLabel}>
              <input
                type="checkbox"
                checked={sendInvite}
                onChange={(event) => {
                  const next = event.target.checked;
                  setSendInvite(next);
                  if (next) {
                    setPassword("");
                  }
                }}
              />
              Generate invite link instead of setting a password
            </label>
            <div className={styles.inviteHint}>
              Generates a secure invite link for the customer to set their
              password.
            </div>
          </div>
          {!sendInvite ? (
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
          ) : null}
        </form>
      )}
    </Modal>
  );
}
