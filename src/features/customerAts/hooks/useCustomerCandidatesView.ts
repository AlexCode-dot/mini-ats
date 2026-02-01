import {
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useMemo, useState } from "react";

import { useAtsBoard } from "@/features/customerAts/hooks/useAtsBoard";
import { useAtsOrgName } from "@/features/customerAts/hooks/useAtsOrgName";
import {
  createAdminAtsClient,
  createCustomerAtsClient,
  type AtsClient,
} from "@/features/customerAts/services/atsClient";
import type {
  CustomerCandidate,
  CustomerJob,
  CustomerStage,
} from "@/features/customerAts/types";

type UseCustomerCandidatesViewArgs = {
  mode: "customer" | "admin";
  orgId?: string;
};

export type CustomerCandidatesViewState = {
  orgName: string;
  orgError: string | null;
  isLoading: boolean;
  error: string | null;
  actionError: string | null;
  setActionError: (value: string | null) => void;
};

export type CustomerCandidatesViewFilters = {
  search: string;
  setSearch: (value: string) => void;
  jobFilter: string;
  setJobFilter: (value: string) => void;
  showFilters: boolean;
  toggleFilters: () => void;
  openJobs: CustomerJob[];
  jobsById: Map<string, CustomerJob>;
};

export type CustomerCandidatesViewData = {
  stages: CustomerStage[];
  candidates: CustomerCandidate[];
  jobs: CustomerJob[];
  filteredCandidates: CustomerCandidate[];
  candidateCounts: Record<string, number>;
};

export type CustomerCandidatesViewModals = {
  isAddOpen: boolean;
  openAddCandidate: () => void;
  closeAddCandidate: () => void;
  editingCandidate: CustomerCandidate | null;
  openEditCandidate: (candidate: CustomerCandidate) => void;
  detailsCandidate: CustomerCandidate | null;
  openDetailsCandidate: (candidate: CustomerCandidate) => void;
  closeDetailsCandidate: () => void;
  pendingArchive: CustomerCandidate | null;
  openArchiveCandidate: (candidate: CustomerCandidate) => void;
  closeArchiveCandidate: () => void;
  isStagesOpen: boolean;
  openStages: () => void;
  closeStages: () => void;
};

export type CustomerCandidatesViewDnd = {
  sensors: ReturnType<typeof useSensors>;
  activeCandidate: CustomerCandidate | null;
  handleDragStart: (candidateId: string) => void;
  handleDragCancel: () => void;
  handleDragEnd: (event: DragEndEvent) => Promise<void>;
};

export type CustomerCandidatesViewActions = {
  refresh: () => Promise<void>;
  confirmArchiveCandidate: () => Promise<void>;
};

export type CustomerCandidatesView = {
  client: AtsClient;
  state: CustomerCandidatesViewState;
  filters: CustomerCandidatesViewFilters;
  data: CustomerCandidatesViewData;
  modals: CustomerCandidatesViewModals;
  dnd: CustomerCandidatesViewDnd;
  actions: CustomerCandidatesViewActions;
};

export function useCustomerCandidatesView({
  mode,
  orgId,
}: UseCustomerCandidatesViewArgs): CustomerCandidatesView {
  const client: AtsClient = useMemo(() => {
    if (mode === "admin") {
      if (!orgId) {
        throw new Error("Missing orgId for admin ATS");
      }
      return createAdminAtsClient(orgId);
    }
    return createCustomerAtsClient();
  }, [mode, orgId]);

  const { stages, candidates, jobs, isLoading, error, refresh, setCandidates } =
    useAtsBoard(client);
  const { orgName, error: orgError } = useAtsOrgName(client);
  const [search, setSearch] = useState("");
  const [jobFilter, setJobFilter] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isStagesOpen, setIsStagesOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [editingCandidate, setEditingCandidate] =
    useState<CustomerCandidate | null>(null);
  const [detailsCandidate, setDetailsCandidate] =
    useState<CustomerCandidate | null>(null);
  const [pendingArchive, setPendingArchive] =
    useState<CustomerCandidate | null>(null);
  const [activeCandidate, setActiveCandidate] =
    useState<CustomerCandidate | null>(null);

  const sensors = useSensors(useSensor(PointerSensor));

  const filteredCandidates = useMemo(() => {
    const term = search.trim().toLowerCase();
    return candidates.filter((candidate) => {
      if (jobFilter && candidate.job_id !== jobFilter) {
        return false;
      }
      if (!term) return true;
      return (
        candidate.name.toLowerCase().includes(term) ||
        candidate.email?.toLowerCase().includes(term)
      );
    });
  }, [candidates, jobFilter, search]);

  const candidateCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    candidates.forEach((candidate) => {
      counts[candidate.stage_id] = (counts[candidate.stage_id] ?? 0) + 1;
    });
    return counts;
  }, [candidates]);

  const jobsById = useMemo(() => {
    return new Map(jobs.map((job) => [job.id, job]));
  }, [jobs]);

  const openJobs = useMemo(
    () => jobs.filter((job) => job.status !== "closed"),
    [jobs]
  );

  const toggleFilters = () => setShowFilters((current) => !current);

  const openAddCandidate = () => {
    setEditingCandidate(null);
    setIsAddOpen(true);
  };

  const closeAddCandidate = () => {
    setIsAddOpen(false);
    setEditingCandidate(null);
  };

  const openEditCandidate = (candidate: CustomerCandidate) => {
    setEditingCandidate(candidate);
    setIsAddOpen(true);
  };

  const openDetailsCandidate = (candidate: CustomerCandidate) => {
    setDetailsCandidate(candidate);
  };

  const closeDetailsCandidate = () => setDetailsCandidate(null);

  const openArchiveCandidate = (candidate: CustomerCandidate) => {
    setPendingArchive(candidate);
  };

  const closeArchiveCandidate = () => setPendingArchive(null);

  const openStages = () => setIsStagesOpen(true);
  const closeStages = () => setIsStagesOpen(false);

  const handleDragStart = (candidateId: string) => {
    const candidate =
      candidates.find((item) => item.id === candidateId) ?? null;
    setActiveCandidate(candidate);
  };

  const handleDragCancel = () => setActiveCandidate(null);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const candidateId = String(active.id);
    const nextStageId = String(over.id);
    const prevStageId = active.data.current?.stageId;

    if (!prevStageId || nextStageId === prevStageId) {
      return;
    }

    setActionError(null);
    let previousCandidates: typeof candidates | null = null;
    setCandidates((prev) => {
      previousCandidates = prev;
      const moving = prev.find((candidate) => candidate.id === candidateId);
      if (!moving) return prev;
      const updated = { ...moving, stage_id: nextStageId };
      const rest = prev.filter((candidate) => candidate.id !== candidateId);
      const lastIndex = rest
        .map((candidate) => candidate.stage_id)
        .lastIndexOf(nextStageId);
      if (lastIndex === -1) {
        return [...rest, updated];
      }
      const next = [...rest];
      next.splice(lastIndex + 1, 0, updated);
      return next;
    });

    try {
      await client.updateCandidateStage(candidateId, nextStageId);
    } catch (err) {
      if (previousCandidates) {
        setCandidates(previousCandidates);
      } else {
        setCandidates((prev) =>
          prev.map((candidate) =>
            candidate.id === candidateId
              ? { ...candidate, stage_id: prevStageId }
              : candidate
          )
        );
      }
      setActionError(
        err instanceof Error ? err.message : "Failed to move candidate"
      );
    }
  };

  const confirmArchiveCandidate = async () => {
    if (!pendingArchive) return;
    try {
      await client.archiveCandidate(pendingArchive.id);
      await refresh();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to archive");
    } finally {
      setPendingArchive(null);
    }
  };

  return {
    client,
    state: {
      orgName,
      orgError,
      isLoading,
      error,
      actionError,
      setActionError,
    },
    filters: {
      search,
      setSearch,
      jobFilter,
      setJobFilter,
      showFilters,
      toggleFilters,
      openJobs,
      jobsById,
    },
    data: {
      stages,
      candidates,
      jobs,
      filteredCandidates,
      candidateCounts,
    },
    modals: {
      isAddOpen,
      openAddCandidate,
      closeAddCandidate,
      editingCandidate,
      openEditCandidate,
      detailsCandidate,
      openDetailsCandidate,
      closeDetailsCandidate,
      pendingArchive,
      openArchiveCandidate,
      closeArchiveCandidate,
      isStagesOpen,
      openStages,
      closeStages,
    },
    dnd: {
      sensors,
      activeCandidate,
      handleDragStart,
      handleDragCancel,
      handleDragEnd,
    },
    actions: {
      refresh,
      confirmArchiveCandidate,
    },
  };
}
