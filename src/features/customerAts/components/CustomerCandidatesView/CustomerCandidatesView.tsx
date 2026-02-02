"use client";

import { DndContext, DragOverlay, closestCenter } from "@dnd-kit/core";

import Button from "@/shared/components/Button/Button";
import InlineError from "@/shared/components/InlineError/InlineError";
import SearchInput from "@/shared/components/SearchInput/SearchInput";
import SelectField from "@/shared/components/SelectField/SelectField";
import ConfirmDialog from "@/shared/components/ConfirmDialog/ConfirmDialog";
import AddCandidateModal from "@/features/customerAts/components/AddCandidateModal/AddCandidateModal";
import CandidateDetailsModal from "@/features/customerAts/components/CandidateDetailsModal/CandidateDetailsModal";
import ManageStagesModal from "@/features/customerAts/components/ManageStagesModal/ManageStagesModal";
import StageColumn from "@/features/customerAts/components/StageColumn/StageColumn";
import CandidateCard from "@/features/customerAts/components/CandidateCard/CandidateCard";
import candidateCardStyles from "@/features/customerAts/components/CandidateCard/CandidateCard.module.scss";
import CustomerShell from "@/features/customerAts/components/CustomerShell/CustomerShell";
import ScrollArea from "@/shared/components/ScrollArea/ScrollArea";
import { useCustomerCandidatesView } from "@/features/customerAts/hooks/useCustomerCandidatesView";
import styles from "@/features/customerAts/components/CustomerCandidatesView/CustomerCandidatesView.module.scss";

type CustomerCandidatesViewProps = {
  mode?: "customer" | "admin";
  orgId?: string;
  basePath?: string;
  contextLabel?: string;
  wrapInShell?: boolean;
};

export default function CustomerCandidatesView({
  mode = "customer",
  orgId,
  basePath,
  contextLabel,
  wrapInShell = true,
}: CustomerCandidatesViewProps) {
  const { client, state, filters, data, modals, dnd, actions } =
    useCustomerCandidatesView({ mode, orgId });

  const content = (
    <div className={styles.page}>
      <InlineError message={state.orgError} />
      <div className={styles.toolbar}>
        <div className={styles.searchRow}>
          <SearchInput
            placeholder="Search candidates..."
            value={filters.search}
            onChange={(event) => filters.setSearch(event.target.value)}
          />
          <Button
            type="button"
            variant="secondary"
            className={styles.filterButton}
            onClick={filters.toggleFilters}
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
            aria-expanded={filters.showFilters}
            aria-controls="candidate-filters"
          >
            <span className={styles.filterLabel}>Filter</span>
          </Button>
        </div>
        <div
          id="candidate-filters"
          className={[
            styles.filters,
            filters.showFilters ? styles.filtersOpen : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <SelectField
            label="Job"
            value={filters.jobFilter}
            onChange={(event) => filters.setJobFilter(event.target.value)}
          >
            <option value="">All Jobs</option>
            {filters.openJobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
            {filters.jobFilter &&
            filters.jobsById.get(filters.jobFilter)?.status === "closed" ? (
              <option value={filters.jobFilter} disabled>
                {filters.jobsById.get(filters.jobFilter)?.title} (Closed)
              </option>
            ) : null}
          </SelectField>
        </div>
        <div className={styles.actions}>
          <Button variant="secondary" onClick={modals.openStages} startIcon="⚙">
            Manage Stages
          </Button>
          <Button
            className={styles.addCandidateButton}
            onClick={modals.openAddCandidate}
            startIcon="+"
          >
            Add Candidate
          </Button>
        </div>
      </div>

      <InlineError message={state.error || state.actionError} />

      {state.isLoading ? (
        <div className={styles.loading}>Loading candidates...</div>
      ) : data.stages.length === 0 ? (
        <div className={styles.emptyState}>
          No pipeline stages found. Open “Manage Stages” to add one.
        </div>
      ) : (
        <ScrollArea className={styles.boardScroll} orientation="x">
          <DndContext
            sensors={dnd.sensors}
            onDragStart={(event) => {
              dnd.handleDragStart(String(event.active.id));
            }}
            onDragCancel={dnd.handleDragCancel}
            onDragEnd={(event) => {
              dnd.handleDragCancel();
              void dnd.handleDragEnd(event);
            }}
            collisionDetection={closestCenter}
          >
            <div className={styles.board}>
              {data.stages.map((stage) => {
                const stageCandidates = data.filteredCandidates.filter(
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
                            modals.openDetailsCandidate(candidate);
                          }}
                        />
                      ))
                    )}
                  </StageColumn>
                );
              })}
            </div>
            <DragOverlay>
              {dnd.activeCandidate ? (
                <div
                  className={`${candidateCardStyles.card} ${candidateCardStyles.overlay}`}
                >
                  <div className={candidateCardStyles.name}>
                    {dnd.activeCandidate.name}
                  </div>
                  {dnd.activeCandidate.job_title ? (
                    <div className={candidateCardStyles.role}>
                      {dnd.activeCandidate.job_title}
                    </div>
                  ) : (
                    <div className={candidateCardStyles.warning}>
                      <span
                        className={candidateCardStyles.warningIcon}
                        aria-hidden
                      >
                        !
                      </span>
                      No job linked
                    </div>
                  )}
                  {dnd.activeCandidate.email ? (
                    <div className={candidateCardStyles.meta}>
                      {dnd.activeCandidate.email}
                    </div>
                  ) : (
                    <div
                      className={`${candidateCardStyles.meta} ${candidateCardStyles.placeholder}`}
                    >
                      No email
                    </div>
                  )}
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </ScrollArea>
      )}

      <Button
        className={styles.fab}
        onClick={modals.openAddCandidate}
        aria-label="Add candidate"
        type="button"
      >
        <span className={styles.fabIcon}>+</span>
      </Button>

      <AddCandidateModal
        open={modals.isAddOpen}
        onClose={modals.closeAddCandidate}
        onCreated={actions.refresh}
        jobs={data.jobs}
        stages={data.stages}
        candidate={modals.editingCandidate}
        client={client}
        orgId={orgId}
      />
      <CandidateDetailsModal
        open={Boolean(modals.detailsCandidate)}
        onClose={modals.closeDetailsCandidate}
        candidate={modals.detailsCandidate}
        onEdit={(candidate) => {
          modals.closeDetailsCandidate();
          modals.openEditCandidate(candidate);
        }}
        onArchive={(candidate) => {
          modals.closeDetailsCandidate();
          modals.openArchiveCandidate(candidate);
        }}
      />
      <ConfirmDialog
        open={Boolean(modals.pendingArchive)}
        title="Archive candidate?"
        message="Archiving removes the candidate from the board but keeps their data for history."
        confirmLabel="Archive"
        onConfirm={actions.confirmArchiveCandidate}
        onCancel={modals.closeArchiveCandidate}
      />

      <ManageStagesModal
        open={modals.isStagesOpen}
        onClose={modals.closeStages}
        onSaved={actions.refresh}
        stages={data.stages}
        candidateCounts={data.candidateCounts}
        client={client}
      />
    </div>
  );

  if (!wrapInShell) {
    return content;
  }

  return (
    <CustomerShell
      orgName={state.orgName}
      basePath={basePath}
      contextLabel={contextLabel}
    >
      {content}
    </CustomerShell>
  );
}
