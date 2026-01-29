"use client";

import { useEffect, useState } from "react";

import type {
  AdminOrgRow,
  UpdateOrganizationPayload,
  UpdateOrganizationResponse,
} from "@/features/adminConsole/types";
import styles from "@/features/adminConsole/components/EditCustomerModal/EditCustomerModal.module.scss";
import Button from "@/shared/components/Button/Button";
import Modal from "@/shared/components/Modal/Modal";
import FormField from "@/shared/components/FormField/FormField";

type EditCustomerModalProps = {
  open: boolean;
  organization: AdminOrgRow | null;
  onClose: () => void;
  onSave: (
    payload: UpdateOrganizationPayload
  ) => Promise<UpdateOrganizationResponse>;
};

export default function EditCustomerModal({
  open,
  organization,
  onClose,
  onSave,
}: EditCustomerModalProps) {
  const [orgName, setOrgName] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formId = "edit-customer-form";

  useEffect(() => {
    if (organization) {
      setOrgName(organization.name);
      setCustomerName(organization.customer_name ?? "");
      setCustomerEmail(organization.customer_email ?? "");
      setError(null);
    }
  }, [organization]);

  if (!open || !organization) return null;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const payload: UpdateOrganizationPayload = {
        orgId: organization.id,
        orgName,
        customerName: customerName || undefined,
        customerEmail,
        profileId: organization.customer_profile_id ?? "",
      };

      if (!payload.profileId) {
        setError("Customer profile missing for this org");
        setIsSaving(false);
        return;
      }

      await onSave(payload);
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit Customer"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form={formId} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </>
      }
    >
      <form id={formId} className={styles.form} onSubmit={handleSubmit}>
        <FormField
          label="Organization name"
          value={orgName}
          onChange={(event) => setOrgName(event.target.value)}
          required
        />
        <FormField
          label="Customer name"
          value={customerName}
          onChange={(event) => setCustomerName(event.target.value)}
        />
        <FormField
          label="Customer email"
          type="email"
          value={customerEmail}
          onChange={(event) => setCustomerEmail(event.target.value)}
          required
        />
        {error ? <div className={styles.error}>{error}</div> : null}
      </form>
    </Modal>
  );
}
