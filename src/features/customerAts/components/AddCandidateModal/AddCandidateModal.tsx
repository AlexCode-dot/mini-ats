"use client";

import { useEffect, useMemo, useState } from "react";

import Button from "@/shared/components/Button/Button";
import FormField from "@/shared/components/FormField/FormField";
import TextAreaField from "@/shared/components/TextAreaField/TextAreaField";
import Modal from "@/shared/components/Modal/Modal";
import SelectField from "@/shared/components/SelectField/SelectField";
import InlineError from "@/shared/components/InlineError/InlineError";
import { toUserMessage } from "@/shared/errors/toUserMessage";
import {
  createCustomerAtsClient,
  type AtsClient,
} from "@/features/customerAts/services/atsClient";
import {
  uploadCandidateResume,
  getCandidateResumeUrl,
  deleteCandidateResume,
} from "@/features/customerAts/services/customerAtsClient";
import type {
  CustomerCandidate,
  CustomerJob,
  CustomerStage,
} from "@/features/customerAts/types";
import styles from "@/features/customerAts/components/AddCandidateModal/AddCandidateModal.module.scss";

const MAX_RESUME_BYTES = 10 * 1024 * 1024;

type AddCandidateModalProps = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  jobs: CustomerJob[];
  stages: CustomerStage[];
  candidate?: CustomerCandidate | null;
  client?: AtsClient;
  orgId?: string;
};

export default function AddCandidateModal({
  open,
  onClose,
  onCreated,
  jobs,
  stages,
  candidate,
  client,
  orgId,
}: AddCandidateModalProps) {
  const [name, setName] = useState("");
  const [jobId, setJobId] = useState("");
  const [email, setEmail] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [note, setNote] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [isReplacingResume, setIsReplacingResume] = useState(false);
  const [resumeLink, setResumeLink] = useState<string | null>(null);
  const [resumeLinkError, setResumeLinkError] = useState<string | null>(null);
  const [isResumeLinkLoading, setIsResumeLinkLoading] = useState(false);
  const [isResumeUploading, setIsResumeUploading] = useState(false);
  const [removeResume, setRemoveResume] = useState(false);
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
      setNote(candidate.note ?? "");
      setResumeFile(null);
      setIsReplacingResume(false);
      setRemoveResume(false);
    } else {
      setName("");
      setJobId("");
      setEmail("");
      setLinkedinUrl("");
      setNote("");
      setResumeFile(null);
      setIsReplacingResume(false);
      setRemoveResume(false);
    }
    setError(null);
    setResumeError(null);
    setResumeLink(null);
    setResumeLinkError(null);
  }, [candidate, open]);

  useEffect(() => {
    let isMounted = true;

    const loadResume = async () => {
      if (!open || !candidate?.resume_url) return;
      setIsResumeLinkLoading(true);
      setResumeLinkError(null);

      try {
        if (candidate.resume_url.startsWith("http")) {
          if (isMounted) {
            setResumeLink(candidate.resume_url);
          }
        } else {
          const url = await getCandidateResumeUrl(candidate.resume_url);
          if (isMounted) {
            setResumeLink(url);
          }
        }
      } catch {
        if (isMounted) {
          setResumeLinkError("Resume unavailable");
        }
      } finally {
        if (isMounted) {
          setIsResumeLinkLoading(false);
        }
      }
    };

    void loadResume();

    return () => {
      isMounted = false;
    };
  }, [candidate?.resume_url, open]);

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

    if (resumeError) {
      setError(resumeError);
      return;
    }

    if (isReplacingResume && !resumeFile) {
      setError("Choose a PDF file to replace the resume.");
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
      const previousResume = candidate?.resume_url ?? null;
      let resumeUrl = previousResume;
      let uploadedPath: string | null = null;
      let shouldRemovePrevious = false;

      if (removeResume) {
        resumeUrl = null;
        shouldRemovePrevious = Boolean(previousResume);
      } else if (resumeFile) {
        setIsResumeUploading(true);
        uploadedPath = await uploadCandidateResume(resumeFile, orgId);
        setIsResumeUploading(false);
        resumeUrl = uploadedPath;
        shouldRemovePrevious = Boolean(previousResume);
      }

      if (candidate) {
        try {
          await atsClient.updateCandidate(candidate.id, {
            name: name.trim(),
            jobId,
            email: email.trim() ? email.trim() : null,
            linkedinUrl: linkedinUrl.trim() ? linkedinUrl.trim() : null,
            resumeUrl,
            note: note.trim() ? note.trim() : null,
          });
        } catch (err) {
          if (uploadedPath) {
            try {
              await deleteCandidateResume(uploadedPath, orgId);
            } catch {
              // Best-effort cleanup only.
            }
          }
          throw err;
        }

        if (
          shouldRemovePrevious &&
          previousResume &&
          !previousResume.startsWith("http") &&
          previousResume !== uploadedPath
        ) {
          try {
            await deleteCandidateResume(previousResume, orgId);
          } catch {
            // Best-effort cleanup only.
          }
        }
      } else {
        if (!defaultStage) {
          setError("No pipeline stage available");
          return;
        }
        try {
          await atsClient.createCandidate({
            name: name.trim(),
            jobId,
            email: email.trim() ? email.trim() : null,
            linkedinUrl: linkedinUrl.trim() ? linkedinUrl.trim() : null,
            resumeUrl,
            note: note.trim() ? note.trim() : null,
            stageId: defaultStage.id,
          });
        } catch (err) {
          if (uploadedPath) {
            try {
              await deleteCandidateResume(uploadedPath, orgId);
            } catch {
              // Best-effort cleanup only.
            }
          }
          throw err;
        }
      }
      onCreated();
      onClose();
    } catch (err) {
      setError(
        toUserMessage(
          err,
          isEditing ? "Failed to update candidate" : "Failed to add candidate"
        )
      );
      setIsResumeUploading(false);
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
        <TextAreaField
          label="Note (optional)"
          name="note"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Add a short note about this candidate..."
        />
        {removeResume ? (
          <div className={styles.resumeRow}>
            <div>
              <div className={styles.resumeLabel}>Resume will be removed</div>
              <div className={styles.fileMeta}>
                You can undo this before saving.
              </div>
            </div>
            <button
              type="button"
              className={styles.keepButton}
              onClick={() => {
                setRemoveResume(false);
                setError(null);
                setResumeError(null);
              }}
            >
              Keep current resume
            </button>
          </div>
        ) : candidate?.resume_url && !isReplacingResume && !resumeFile ? (
          <div className={styles.resumeRow}>
            <div>
              <div className={styles.resumeLabel}>Resume on file</div>
              {isResumeLinkLoading ? (
                <div className={styles.fileMeta}>Loading resume...</div>
              ) : resumeLink ? (
                <a
                  className={styles.resumeLink}
                  href={resumeLink}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  Download current resume
                </a>
              ) : (
                <div className={styles.fileMeta}>
                  {resumeLinkError ?? "Resume attached"}
                </div>
              )}
            </div>
            <div className={styles.resumeActions}>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setIsReplacingResume(true);
                  setRemoveResume(false);
                  setError(null);
                  setResumeError(null);
                }}
              >
                Replace
              </Button>
              <button
                type="button"
                className={styles.removeButton}
                onClick={() => {
                  setRemoveResume(true);
                  setIsReplacingResume(false);
                  setResumeFile(null);
                  setResumeError(null);
                  setError(null);
                }}
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <label className={styles.fileField}>
            Resume (PDF, max 10MB)
            <input
              className={styles.fileInput}
              type="file"
              accept="application/pdf"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) {
                  setResumeFile(null);
                  setResumeError(null);
                  return;
                }
                setRemoveResume(false);
                if (file.type !== "application/pdf") {
                  setResumeFile(null);
                  setResumeError("Resume must be a PDF file.");
                  return;
                }
                if (file.size > MAX_RESUME_BYTES) {
                  setResumeFile(null);
                  setResumeError("Resume must be 10MB or smaller.");
                  return;
                }
                setResumeFile(file);
                setResumeError(null);
              }}
            />
            <span className={styles.fileMeta}>
              {resumeFile
                ? resumeFile.name
                : candidate?.resume_url
                  ? "Upload a new resume to replace the current one"
                  : "No resume uploaded"}
            </span>
            {isResumeUploading ? (
              <span className={styles.fileMeta}>Uploading resume...</span>
            ) : null}
            {isReplacingResume ? (
              <button
                type="button"
                className={styles.keepButton}
                onClick={() => {
                  setIsReplacingResume(false);
                  setResumeFile(null);
                  setResumeError(null);
                  setError(null);
                }}
              >
                Keep current resume
              </button>
            ) : null}
            {resumeError ? (
              <span className={styles.fileError}>{resumeError}</span>
            ) : null}
          </label>
        )}
        <InlineError message={error} />
      </form>
      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="submit"
          form="add-candidate"
          disabled={isSaving || isResumeUploading}
        >
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
