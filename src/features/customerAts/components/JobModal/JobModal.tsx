"use client";

import { useEffect, useState } from "react";

import Button from "@/shared/components/Button/Button";
import FormField from "@/shared/components/FormField/FormField";
import Modal from "@/shared/components/Modal/Modal";
import SelectField from "@/shared/components/SelectField/SelectField";
import InlineError from "@/shared/components/InlineError/InlineError";
import type { CustomerJob } from "@/features/customerAts/types";
import styles from "@/features/customerAts/components/JobModal/JobModal.module.scss";

const statusOptions = [
  { value: "open", label: "Open" },
  { value: "closed", label: "Closed" },
];

function isValidUrl(value: string) {
  if (!value.trim()) return true;
  return /^https?:\/\//i.test(value.trim());
}

type JobModalProps = {
  open: boolean;
  onClose: () => void;
  onSave: (payload: {
    title: string;
    status: string;
    jobUrl: string | null;
  }) => Promise<void>;
  job?: CustomerJob | null;
};

export default function JobModal({
  open,
  onClose,
  onSave,
  job,
}: JobModalProps) {
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("open");
  const [jobUrl, setJobUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const isEditing = Boolean(job);

  useEffect(() => {
    if (!open) return;
    setTitle(job?.title ?? "");
    setStatus(job?.status ?? "open");
    setJobUrl(job?.job_url ?? "");
    setError(null);
  }, [job, open]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Job title is required");
      return;
    }

    if (!isValidUrl(jobUrl)) {
      setError("Job URL must start with http:// or https://");
      return;
    }

    try {
      setIsSaving(true);
      await onSave({
        title: title.trim(),
        status,
        jobUrl: jobUrl.trim() ? jobUrl.trim() : null,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save job");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Edit Job" : "Create Job"}
    >
      <form className={styles.form} onSubmit={handleSubmit} id="job-form">
        <FormField
          label="Job Title *"
          name="title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
        />
        <SelectField
          label="Status"
          name="status"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </SelectField>
        <FormField
          label="Job URL (optional)"
          name="job_url"
          value={jobUrl}
          onChange={(event) => setJobUrl(event.target.value)}
          placeholder="https://company.com/jobs/..."
        />
        <InlineError message={error} />
      </form>
      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" form="job-form" disabled={isSaving}>
          {isSaving ? "Saving..." : isEditing ? "Save Changes" : "Create Job"}
        </Button>
      </div>
    </Modal>
  );
}
