"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import Button from "@/shared/components/Button/Button";
import InlineError from "@/shared/components/InlineError/InlineError";
import Modal from "@/shared/components/Modal/Modal";
import ConfirmDialog from "@/shared/components/ConfirmDialog/ConfirmDialog";
import {
  createCustomerAtsClient,
  type AtsClient,
} from "@/features/customerAts/services/atsClient";
import type { CustomerStage, StageDraft } from "@/features/customerAts/types";
import styles from "@/features/customerAts/components/ManageStagesModal/ManageStagesModal.module.scss";

type ManageStagesModalProps = {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  stages: CustomerStage[];
  candidateCounts?: Record<string, number>;
  client?: AtsClient;
};

function SortableStageRow({
  stage,
  onNameChange,
  onDelete,
}: {
  stage: StageDraft;
  onNameChange: (id: string, value: string) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: stage.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className={styles.stageRow}>
      <button
        type="button"
        className={styles.dragHandle}
        {...attributes}
        {...listeners}
        aria-label="Drag stage"
      >
        <span className={styles.dragDots} />
        <span className={styles.dragDots} />
        <span className={styles.dragDots} />
      </button>
      <input
        value={stage.name}
        onChange={(event) => onNameChange(stage.id, event.target.value)}
        placeholder="Stage name"
      />
      <button
        type="button"
        className={styles.deleteButton}
        onClick={() => onDelete(stage.id)}
        aria-label="Delete stage"
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M4 7h16M9 7V4h6v3M9 10v7M15 10v7M6 7l1 13h10l1-13"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}

export default function ManageStagesModal({
  open,
  onClose,
  onSaved,
  stages,
  candidateCounts,
  client,
}: ManageStagesModalProps) {
  const [drafts, setDrafts] = useState<StageDraft[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [pendingDeleteCount, setPendingDeleteCount] = useState(0);
  const [pendingDeleteFallback, setPendingDeleteFallback] = useState("");
  const atsClient = useMemo(
    () => client ?? createCustomerAtsClient(),
    [client]
  );

  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    if (!open) return;
    const sorted = [...stages]
      .sort((a, b) => a.position - b.position)
      .map((stage) => ({ ...stage }));
    setDrafts(sorted);
    setError(null);
  }, [open, stages]);

  const activeStages = useMemo(
    () => drafts.filter((stage) => !stage.isDeleted),
    [drafts]
  );

  const handleNameChange = (id: string, value: string) => {
    setDrafts((prev) =>
      prev.map((stage) => (stage.id === id ? { ...stage, name: value } : stage))
    );
  };

  const handleAddStage = () => {
    setDrafts((prev) => [
      ...prev,
      {
        id: `new-${Date.now()}-${prev.length}`,
        name: "",
        position: prev.length + 1,
        is_terminal: false,
        isNew: true,
      },
    ]);
  };

  const handleDelete = (id: string) => {
    setDrafts((prev) => {
      const remaining = prev.filter(
        (stage) => stage.id !== id && !stage.isDeleted
      );
      if (remaining.length === 0) {
        setError("At least one stage is required");
        return prev;
      }

      const count = candidateCounts?.[id] ?? 0;
      if (count > 0) {
        setPendingDeleteId(id);
        setPendingDeleteCount(count);
        setPendingDeleteFallback(remaining[0]?.name ?? "the first stage");
        return prev;
      }

      return prev.flatMap((stage) => {
        if (stage.id !== id) return [stage];
        if (stage.isNew) return [];
        return [{ ...stage, isDeleted: true }];
      });
    });
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;
    setError(null);

    const remaining = drafts.filter(
      (stage) => stage.id !== pendingDeleteId && !stage.isDeleted
    );
    const fallbackStage = remaining.find((stage) => !stage.isNew);

    if (!fallbackStage) {
      setError("Keep at least one existing stage before deleting others");
      setPendingDeleteId(null);
      setPendingDeleteCount(0);
      setPendingDeleteFallback("");
      return;
    }

    try {
      setIsDeleting(true);
      await atsClient.deleteStageWithCandidates(
        pendingDeleteId,
        fallbackStage.id
      );
      const normalizedRemaining = remaining
        .filter((stage) => !stage.isNew)
        .sort((a, b) => a.position - b.position)
        .map((stage, index) => ({ ...stage, position: index + 1 }));
      await atsClient.updateStages(normalizedRemaining as CustomerStage[]);
      setDrafts(normalizedRemaining);
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete stage");
    } finally {
      setIsDeleting(false);
      setPendingDeleteId(null);
      setPendingDeleteCount(0);
      setPendingDeleteFallback("");
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = activeStages.findIndex((stage) => stage.id === active.id);
    const newIndex = activeStages.findIndex((stage) => stage.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(activeStages, oldIndex, newIndex).map(
      (stage, index) => ({ ...stage, position: index + 1 })
    );

    setDrafts((prev) => {
      const deleted = prev.filter((stage) => stage.isDeleted);
      return [...reordered, ...deleted];
    });
  };

  const handleSave = async () => {
    setError(null);

    const remaining = drafts.filter((stage) => !stage.isDeleted);
    if (remaining.length === 0) {
      setError("At least one stage is required");
      return;
    }

    const normalized = remaining
      .map((stage, index) => ({ ...stage, position: index + 1 }))
      .map((stage) => ({ ...stage, name: stage.name.trim() }));

    if (normalized.some((stage) => !stage.name)) {
      setError("Stage name cannot be empty");
      return;
    }

    const existingStages = normalized.filter((stage) => !stage.isNew);
    const newStages = normalized.filter((stage) => stage.isNew);
    const deletedStages = drafts.filter(
      (stage) => stage.isDeleted && !stage.isNew
    );
    const fallbackStage = existingStages[0];

    if (deletedStages.length > 0 && !fallbackStage) {
      setError("Keep at least one existing stage before deleting others");
      return;
    }

    try {
      setIsSaving(true);
      for (const stage of deletedStages) {
        await atsClient.deleteStageWithCandidates(stage.id, fallbackStage.id);
      }
      const createdStages = await atsClient.createStages(newStages);
      const createdWithPositions = createdStages.map((stage, index) => ({
        ...stage,
        position: newStages[index]?.position ?? stage.position,
        name: newStages[index]?.name ?? stage.name,
        is_terminal: newStages[index]?.is_terminal ?? stage.is_terminal,
      }));
      await atsClient.updateStages([
        ...existingStages,
        ...createdWithPositions,
      ] as CustomerStage[]);
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save stages");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Modal open={open} onClose={onClose} title="Manage Pipeline Stages">
        <div className={styles.listWrapper}>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={activeStages.map((stage) => stage.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className={styles.stageList}>
                {activeStages.map((stage) => (
                  <SortableStageRow
                    key={stage.id}
                    stage={stage}
                    onNameChange={handleNameChange}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={handleAddStage}
          disabled={isSaving || isDeleting}
        >
          + Add Stage
        </Button>
        <InlineError message={error} />
        <div className={styles.actions}>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSaving || isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving || isDeleting}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </Modal>
      <ConfirmDialog
        open={Boolean(pendingDeleteId)}
        title="Delete stage?"
        message={`${pendingDeleteCount} candidate${pendingDeleteCount === 1 ? "" : "s"} in this stage will be moved to ${pendingDeleteFallback}. Continue?`}
        confirmLabel="Delete stage"
        onConfirm={confirmDelete}
        onCancel={() => {
          setPendingDeleteId(null);
          setPendingDeleteCount(0);
          setPendingDeleteFallback("");
        }}
      />
    </>
  );
}
