import { useEffect, useMemo, useState } from "react";

import { useAtsBoard } from "@/features/customerAts/hooks/useAtsBoard";
import { useAtsOrgName } from "@/features/customerAts/hooks/useAtsOrgName";
import {
  createAdminAtsClient,
  createCustomerAtsClient,
  type AtsClient,
} from "@/features/customerAts/services/atsClient";
import type { CustomerJob } from "@/features/customerAts/types";
import { toUserMessage } from "@/shared/errors/toUserMessage";

type UseCustomerJobsViewArgs = {
  mode: "customer" | "admin";
  orgId?: string;
};

type JobPayload = {
  title: string;
  status: string;
  jobUrl: string | null;
};

export type CustomerJobsViewState = {
  orgName: string;
  orgError: string | null;
  isLoading: boolean;
  error: string | null;
  actionError: string | null;
};

export type CustomerJobsViewData = {
  jobs: CustomerJob[];
  jobCount: number;
  jobCandidateCounts: Map<string, number>;
};

export type CustomerJobsViewModals = {
  isModalOpen: boolean;
  isDetailsOpen: boolean;
  editingJob: CustomerJob | null;
  detailsJob: CustomerJob | null;
  pendingDelete: CustomerJob | null;
};

export type CustomerJobsViewActions = {
  openCreate: () => void;
  openEdit: (job: CustomerJob) => void;
  openDetails: (job: CustomerJob) => void;
  closeModal: () => void;
  closeDetails: () => void;
  confirmDelete: (job: CustomerJob) => void;
  cancelDelete: () => void;
  handleSave: (payload: JobPayload) => Promise<void>;
  handleDelete: () => Promise<void>;
  refresh: () => Promise<void>;
};

export type CustomerJobsView = {
  client: AtsClient;
  state: CustomerJobsViewState;
  data: CustomerJobsViewData;
  modals: CustomerJobsViewModals;
  actions: CustomerJobsViewActions;
};

export function useCustomerJobsView({
  mode,
  orgId,
}: UseCustomerJobsViewArgs): CustomerJobsView {
  const client: AtsClient = useMemo(() => {
    if (mode === "admin") {
      if (!orgId) {
        throw new Error("Missing orgId for admin ATS");
      }
      return createAdminAtsClient(orgId);
    }
    return createCustomerAtsClient();
  }, [mode, orgId]);

  const { jobs, candidates, isLoading, error, refresh } = useAtsBoard(client);
  const { orgName, error: orgError } = useAtsOrgName(client);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<CustomerJob | null>(null);
  const [detailsJob, setDetailsJob] = useState<CustomerJob | null>(null);
  const [pendingDelete, setPendingDelete] = useState<CustomerJob | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const jobCount = useMemo(() => jobs.length, [jobs.length]);
  const jobCandidateCounts = useMemo(() => {
    const counts = new Map<string, number>();
    candidates.forEach((candidate) => {
      if (!candidate.job_id) return;
      counts.set(candidate.job_id, (counts.get(candidate.job_id) ?? 0) + 1);
    });
    return counts;
  }, [candidates]);

  const openCreate = () => {
    setEditingJob(null);
    setIsModalOpen(true);
  };

  const openEdit = (job: CustomerJob) => {
    setEditingJob(job);
    setIsModalOpen(true);
  };

  const openDetails = (job: CustomerJob) => {
    setDetailsJob(job);
    setIsDetailsOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);
  const closeDetails = () => setIsDetailsOpen(false);

  const confirmDelete = (job: CustomerJob) => setPendingDelete(job);
  const cancelDelete = () => setPendingDelete(null);

  const handleSave = async (payload: JobPayload) => {
    setActionError(null);
    if (editingJob) {
      await client.updateJob(editingJob.id, payload);
    } else {
      await client.createJob(payload);
    }
    await refresh();
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setActionError(null);
    try {
      await client.deleteJob(pendingDelete.id);
      await refresh();
    } catch (err) {
      setActionError(toUserMessage(err, "Failed to delete job."));
    } finally {
      setPendingDelete(null);
    }
  };

  useEffect(() => {
    if (!detailsJob) return;
    const fresh = jobs.find((job) => job.id === detailsJob.id) ?? null;
    setDetailsJob(fresh);
  }, [detailsJob, jobs]);

  return {
    client,
    state: {
      orgName,
      orgError,
      isLoading,
      error,
      actionError,
    },
    data: {
      jobs,
      jobCount,
      jobCandidateCounts,
    },
    modals: {
      isModalOpen,
      isDetailsOpen,
      editingJob,
      detailsJob,
      pendingDelete,
    },
    actions: {
      openCreate,
      openEdit,
      openDetails,
      closeModal,
      closeDetails,
      confirmDelete,
      cancelDelete,
      handleSave,
      handleDelete,
      refresh,
    },
  };
}
