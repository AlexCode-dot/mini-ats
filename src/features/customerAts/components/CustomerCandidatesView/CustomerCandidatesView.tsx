"use client";

import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { useMemo, useState } from "react";

import Button from "@/shared/components/Button/Button";
import InlineError from "@/shared/components/InlineError/InlineError";
import SearchInput from "@/shared/components/SearchInput/SearchInput";
import SelectField from "@/shared/components/SelectField/SelectField";
import AddCandidateModal from "@/features/customerAts/components/AddCandidateModal/AddCandidateModal";
import ManageStagesModal from "@/features/customerAts/components/ManageStagesModal/ManageStagesModal";
import StageColumn from "@/features/customerAts/components/StageColumn/StageColumn";
import CandidateCard from "@/features/customerAts/components/CandidateCard/CandidateCard";
import CustomerShell from "@/features/customerAts/components/CustomerShell/CustomerShell";
import { useCustomerOrgName } from "@/features/customerAts/hooks/useCustomerOrgName";
import { updateCandidateStage } from "@/features/customerAts/services/customerAtsClient";
import { useCustomerBoard } from "@/features/customerAts/hooks/useCustomerBoard";
import styles from "@/features/customerAts/components/CustomerCandidatesView/CustomerCandidatesView.module.scss";

export default function CustomerCandidatesView() {
  const { stages, candidates, jobs, isLoading, error, refresh, setCandidates } =
    useCustomerBoard();
  const { orgName, error: orgError } = useCustomerOrgName();
  const [search, setSearch] = useState("");
  const [jobFilter, setJobFilter] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isStagesOpen, setIsStagesOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<
    (typeof candidates)[number] | null
  >(null);

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
    setCandidates((prev) =>
      prev.map((candidate) =>
        candidate.id === candidateId
          ? { ...candidate, stage_id: nextStageId }
          : candidate
      )
    );

    try {
      await updateCandidateStage(candidateId, nextStageId);
    } catch (err) {
      setCandidates((prev) =>
        prev.map((candidate) =>
          candidate.id === candidateId
            ? { ...candidate, stage_id: prevStageId }
            : candidate
        )
      );
      setActionError(
        err instanceof Error ? err.message : "Failed to move candidate"
      );
    }
  };

  return (
    <CustomerShell orgName={orgName}>
      <div className={styles.page}>
        <InlineError message={orgError} />
        <div className={styles.toolbar}>
          <div className={styles.searchRow}>
            <SearchInput
              placeholder="Search candidates..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <Button
              type="button"
              variant="secondary"
              className={styles.filterButton}
              onClick={() => setShowFilters((current) => !current)}
              startIcon={
                <svg
                  viewBox="0 0 24 24"
                  role="img"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path
                    d="M3 5h18l-7 8v5l-4 2v-7L3 5z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              }
              aria-label="Toggle job filter"
              aria-expanded={showFilters}
              aria-controls="candidate-filters"
            >
              <span className={styles.filterLabel}>Filter</span>
            </Button>
          </div>
          <div
            id="candidate-filters"
            className={[styles.filters, showFilters ? styles.filtersOpen : ""]
              .filter(Boolean)
              .join(" ")}
          >
            <SelectField
              label="Job"
              value={jobFilter}
              onChange={(event) => setJobFilter(event.target.value)}
            >
              <option value="">All Jobs</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title}
                </option>
              ))}
            </SelectField>
          </div>
          <div className={styles.actions}>
            <Button
              variant="secondary"
              onClick={() => setIsStagesOpen(true)}
              startIcon="⚙"
            >
              Manage Stages
            </Button>
            <Button
              className={styles.addCandidateButton}
              onClick={() => {
                setEditingCandidate(null);
                setIsAddOpen(true);
              }}
              startIcon="+"
            >
              Add Candidate
            </Button>
          </div>
        </div>

        <InlineError message={error || actionError} />

        {isLoading ? (
          <div className={styles.loading}>Loading candidates...</div>
        ) : stages.length === 0 ? (
          <div className={styles.emptyState}>
            No pipeline stages found. Open “Manage Stages” to add one.
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            onDragEnd={handleDragEnd}
            collisionDetection={closestCenter}
          >
            <div className={styles.board}>
              {stages.map((stage) => {
                const stageCandidates = filteredCandidates.filter(
                  (candidate) => candidate.stage_id === stage.id
                );
                return (
                  <StageColumn
                    key={stage.id}
                    stage={stage}
                    count={stageCandidates.length}
                  >
                    {stageCandidates.length === 0 ? (
                      <div className={styles.empty}>
                        <div className={styles.emptyIcon}>
                          <svg
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                            focusable="false"
                          >
                            <path
                              d="M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0ZM4 20a6 6 0 0 1 12 0"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M18 12.5c1.8.5 3 2 3 3.5"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.6"
                              strokeLinecap="round"
                            />
                          </svg>
                        </div>
                        <div className={styles.emptyTitle}>No candidates</div>
                        <div className={styles.emptySubtitle}>
                          Drop candidates here
                        </div>
                      </div>
                    ) : (
                      stageCandidates.map((candidate) => (
                        <CandidateCard
                          key={candidate.id}
                          candidate={candidate}
                          onOpen={() => {
                            setEditingCandidate(candidate);
                            setIsAddOpen(true);
                          }}
                        />
                      ))
                    )}
                  </StageColumn>
                );
              })}
            </div>
          </DndContext>
        )}

        <Button
          className={styles.fab}
          onClick={() => {
            setEditingCandidate(null);
            setIsAddOpen(true);
          }}
          aria-label="Add candidate"
          type="button"
        >
          <span className={styles.fabIcon}>+</span>
        </Button>

        <AddCandidateModal
          open={isAddOpen}
          onClose={() => {
            setIsAddOpen(false);
            setEditingCandidate(null);
          }}
          onCreated={refresh}
          jobs={jobs}
          stages={stages}
          candidate={editingCandidate}
        />

        <ManageStagesModal
          open={isStagesOpen}
          onClose={() => setIsStagesOpen(false)}
          onSaved={refresh}
          stages={stages}
          candidateCounts={candidateCounts}
        />
      </div>
    </CustomerShell>
  );
}
