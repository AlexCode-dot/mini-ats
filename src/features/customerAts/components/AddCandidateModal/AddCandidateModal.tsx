"use client";

import { useEffect, useMemo, useState } from "react";

import Button from "@/shared/components/Button/Button";
import FormField from "@/shared/components/FormField/FormField";
import Modal from "@/shared/components/Modal/Modal";
import SelectField from "@/shared/components/SelectField/SelectField";
import InlineError from "@/shared/components/InlineError/InlineError";
import {
  createCustomerAtsClient,
  type AtsClient,
} from "@/features/customerAts/services/atsClient";
import type {
  CustomerCandidate,
  CustomerJob,
  CustomerStage,
} from "@/features/customerAts/types";
import styles from "@/features/customerAts/components/AddCandidateModal/AddCandidateModal.module.scss";

type AddCandidateModalProps = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  jobs: CustomerJob[];
  stages: CustomerStage[];
  candidate?: CustomerCandidate | null;
  client?: AtsClient;
};

export default function AddCandidateModal({
  open,
  onClose,
  onCreated,
  jobs,
  stages,
  candidate,
  client,
}: AddCandidateModalProps) {
  const [name, setName] = useState("");
  const [jobId, setJobId] = useState("");
  const [email, setEmail] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const isEditing = Boolean(candidate);
  const atsClient = useMemo(
    () => client ?? createCustomerAtsClient(),
    [client]
  );

  const jobsById = useMemo(() => {
    return new Map(jobs.map((job) => [job.id, job]));
  }, [jobs]);

  const openJobs = useMemo(
    () => jobs.filter((job) => job.status !== "closed"),
    [jobs]
  );

  const isSelectedJobOpen = useMemo(() => {
    if (!jobId) return false;
    const job = jobsById.get(jobId);
    return job?.status !== "closed";
  }, [jobId, jobsById]);

  const defaultStage = useMemo(
    () => [...stages].sort((a, b) => a.position - b.position)[0] ?? null,
    [stages]
  );

  useEffect(() => {
    if (!open) return;
    if (candidate) {
      setName(candidate.name);
      setJobId(candidate.job_id ?? "");
      setEmail(candidate.email ?? "");
      setLinkedinUrl(candidate.linkedin_url ?? "");
    } else {
      setName("");
      setJobId("");
      setEmail("");
      setLinkedinUrl("");
    }
    setError(null);
  }, [candidate, open]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (openJobs.length === 0) {
      setError("Create an open job before adding candidates.");
      return;
    }

    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    if (!jobId) {
      setError("Please select a job");
      return;
    }

    if (!isEditing && !isSelectedJobOpen) {
      setError("You can only add candidates to open jobs.");
      return;
    }

    if (isEditing && candidate?.job_id !== jobId && !isSelectedJobOpen) {
      setError("You can only move candidates to open jobs.");
      return;
    }

    try {
      setIsSaving(true);
      if (candidate) {
        await atsClient.updateCandidate(candidate.id, {
          name: name.trim(),
          jobId,
          email: email.trim() ? email.trim() : null,
          linkedinUrl: linkedinUrl.trim() ? linkedinUrl.trim() : null,
        });
      } else {
        if (!defaultStage) {
          setError("No pipeline stage available");
          return;
        }
        await atsClient.createCandidate({
          name: name.trim(),
          jobId,
          email: email.trim() ? email.trim() : null,
          linkedinUrl: linkedinUrl.trim() ? linkedinUrl.trim() : null,
          stageId: defaultStage.id,
        });
      }
      onCreated();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : isEditing
            ? "Failed to update candidate"
            : "Failed to add candidate"
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Edit Candidate" : "Add Candidate"}
    >
      <form className={styles.form} onSubmit={handleSubmit} id="add-candidate">
        {jobs.length === 0 ? (
          <div className={styles.notice}>
            You need at least one job to add a candidate.
          </div>
        ) : null}
        <FormField
          label="Name *"
          name="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
        <SelectField
          label="Job *"
          name="job"
          value={jobId}
          onChange={(event) => setJobId(event.target.value)}
          required
        >
          <option value="">Select a job...</option>
          {openJobs.map((job) => (
            <option key={job.id} value={job.id}>
              {job.title}
            </option>
          ))}
          {candidate?.job_id &&
          jobsById.get(candidate.job_id)?.status === "closed" ? (
            <option value={candidate.job_id} disabled>
              {jobsById.get(candidate.job_id)?.title} (Closed)
            </option>
          ) : null}
        </SelectField>
        <FormField
          label="Email (optional)"
          name="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <FormField
          label="LinkedIn URL (optional)"
          name="linkedin"
          value={linkedinUrl}
          onChange={(event) => setLinkedinUrl(event.target.value)}
        />
        <InlineError message={error} />
      </form>
      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" form="add-candidate" disabled={isSaving}>
          {isSaving
            ? "Saving..."
            : isEditing
              ? "Save Changes"
              : "Add Candidate"}
        </Button>
      </div>
    </Modal>
  );
}
