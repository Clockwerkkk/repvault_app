import type { ActiveWorkout } from "../types";
import type { MessageKey } from "../i18n/messages";
import type { KeyboardEvent } from "react";

type WorkoutExerciseScreenProps = {
  workoutExercise: ActiveWorkout["exercises"][number] | null;
  weightKg: string;
  reps: string;
  setType: "working" | "warmup";
  editingSetId: string | null;
  saving: boolean;
  weightError: string | null;
  repsError: string | null;
  t: (key: MessageKey, params?: Record<string, string | number>) => string;
  onBack: () => void;
  onWeightChange: (value: string) => void;
  onRepsChange: (value: string) => void;
  onSetTypeChange: (value: "working" | "warmup") => void;
  onAddSet: () => void;
  onStartEditSet: (setId: string) => void;
  onCancelEditSet: () => void;
  onSaveEditSet: () => void;
  onDeleteSet: (setId: string) => void;
};

export function WorkoutExerciseScreen(props: WorkoutExerciseScreenProps) {
  const submitSetForm = (): void => {
    if (props.editingSetId) {
      props.onSaveEditSet();
      return;
    }
    props.onAddSet();
  };

  const handleRepsEnter = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key !== "Enter") {
      return;
    }
    event.preventDefault();
    submitSetForm();
  };

  if (!props.workoutExercise) {
    return (
      <section className="screen">
        <div className="sticky-header">
          <button className="text-btn" onClick={props.onBack} type="button">
            {props.t("back")}
          </button>
        </div>
        <p>{props.t("exerciseNotFoundInWorkout")}</p>
      </section>
    );
  }

  return (
    <section className="screen">
      <div className="sticky-header">
        <button className="text-btn" onClick={props.onBack} type="button">
          {props.t("back")}
        </button>
      </div>

      <h1>{props.workoutExercise.exercise.name}</h1>
      <p>{props.t("categoryLabel", { value: props.workoutExercise.exercise.category.name })}</p>

      <article className="card">
        <h2>{props.t("setsTitle")}</h2>
        {props.workoutExercise.sets.length === 0 ? <p>{props.t("noSetsYet")}</p> : null}
        {props.workoutExercise.sets.map((set) => (
          <div key={set.id} className="list-item">
            <strong>{props.t("setLabel", { index: set.setIndex })}</strong>
            <span>
              {set.weightKg} kg x {set.reps} ({set.setType === "working" ? props.t("working") : props.t("warmup")})
            </span>
            <button
              className="text-btn"
              onClick={() => props.onDeleteSet(set.id)}
              type="button"
              disabled={props.saving}
            >
              {props.t("delete")}
            </button>
            <button
              className="text-btn"
              onClick={() => props.onStartEditSet(set.id)}
              type="button"
              disabled={props.saving}
            >
              {props.t("edit")}
            </button>
          </div>
        ))}
      </article>

      <article className="card keyboard-safe">
        <h2>{props.editingSetId ? props.t("editSet") : props.t("addSet")}</h2>
        <input
          className="input"
          placeholder={props.t("weightPlaceholder")}
          value={props.weightKg}
          type="number"
          inputMode="decimal"
          enterKeyHint="next"
          autoComplete="off"
          onChange={(event) => props.onWeightChange(event.target.value)}
        />
        {props.weightError ? <p className="error-text">{props.weightError}</p> : null}
        <input
          className="input"
          placeholder={props.t("repsPlaceholder")}
          value={props.reps}
          type="number"
          inputMode="numeric"
          enterKeyHint="done"
          autoComplete="off"
          onChange={(event) => props.onRepsChange(event.target.value)}
          onKeyDown={handleRepsEnter}
        />
        {props.repsError ? <p className="error-text">{props.repsError}</p> : null}
        <div className="actions-row">
          <button
            className={props.setType === "working" ? "primary-btn" : "secondary-btn"}
            onClick={() => props.onSetTypeChange("working")}
            type="button"
            disabled={props.saving}
          >
            {props.t("working")}
          </button>
          <button
            className={props.setType === "warmup" ? "primary-btn" : "secondary-btn"}
            onClick={() => props.onSetTypeChange("warmup")}
            type="button"
            disabled={props.saving}
          >
            {props.t("warmup")}
          </button>
        </div>
        {props.editingSetId ? (
          <div className="actions-row">
            <button className="primary-btn" onClick={submitSetForm} type="button">
              {props.saving ? props.t("saving") : props.t("saveChanges")}
            </button>
            <button className="secondary-btn" onClick={props.onCancelEditSet} type="button">
              {props.t("cancel")}
            </button>
          </div>
        ) : (
          <button className="primary-btn" onClick={submitSetForm} type="button">
            {props.saving ? props.t("saving") : props.t("addSet")}
          </button>
        )}
      </article>
    </section>
  );
}
