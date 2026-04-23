import type { ActiveWorkout } from "../types";
import type { MessageKey } from "../i18n/messages";
import { formatLocalDateTime } from "../utils/dateTime";

type ActiveWorkoutScreenProps = {
  workout: ActiveWorkout | null;
  loading: boolean;
  titleDraft: string;
  titleError: string | null;
  titleSaving: boolean;
  templateSaving: boolean;
  t: (key: MessageKey, params?: Record<string, string | number>) => string;
  onBack: () => void;
  onTitleDraftChange: (value: string) => void;
  onSaveTitle: () => void;
  onDeleteWorkout: () => void;
  onSaveTemplate: () => void;
  onAddExercise: () => void;
  onSelectWorkoutExercise: (workoutExerciseId: string) => void;
  onDeleteWorkoutExercise: (workoutExerciseId: string) => void;
  onFinishWorkout: () => void;
};

export function ActiveWorkoutScreen(props: ActiveWorkoutScreenProps) {
  return (
    <section className="screen">
      <div className="top-row sticky-header">
        <button className="text-btn" onClick={props.onBack} type="button">
          {props.t("back")}
        </button>
        <h1>{props.t("activeWorkout")}</h1>
      </div>

      {props.loading ? <p>{props.t("loadingWorkout")}</p> : null}

      {!props.loading && !props.workout ? <p>{props.t("noActiveWorkout")}</p> : null}

      {!props.loading && props.workout ? (
        <>
          <article className="card">
            <p>{props.t("titleLabel", { value: props.workout.title })}</p>
            <p>{props.t("startedLabel", { value: formatLocalDateTime(props.workout.startedAt) })}</p>
            <input
              className="input"
              value={props.titleDraft}
              placeholder={props.t("editWorkoutTitlePlaceholder")}
              onChange={(event) => props.onTitleDraftChange(event.target.value)}
            />
            {props.titleError ? <p className="error-text">{props.titleError}</p> : null}
            <button className="secondary-btn" onClick={props.onSaveTitle} type="button" disabled={props.titleSaving}>
              {props.titleSaving ? props.t("saving") : props.t("saveWorkoutTitle")}
            </button>
          </article>

          <article className="card">
            <h2>{props.t("exercisesTitle")}</h2>
            {props.workout.exercises.length === 0 ? <p>{props.t("noExercisesYet")}</p> : null}
            {props.workout.exercises.map((item) => (
              <div key={item.id} className="list-item">
                <strong>{item.orderIndex}. {item.exercise.name}</strong>
                <span>{item.exercise.category.name}</span>
                <span>{props.t("setsCount", { count: item.setsCount })}</span>
                <button
                  className="secondary-btn"
                  onClick={() => props.onSelectWorkoutExercise(item.id)}
                  type="button"
                >
                  {props.t("openExercise")}
                </button>
                <button
                  className="text-btn"
                  onClick={() => props.onDeleteWorkoutExercise(item.id)}
                  type="button"
                >
                  {props.t("deleteExercise")}
                </button>
              </div>
            ))}
          </article>
        </>
      ) : null}

      <div className="actions-row">
        <button className="primary-btn" onClick={props.onAddExercise} type="button">
          {props.t("addExercise")}
        </button>
        <button className="secondary-btn" onClick={props.onFinishWorkout} type="button">
          {props.t("finishWorkout")}
        </button>
        <button className="secondary-btn" onClick={props.onSaveTemplate} type="button" disabled={props.templateSaving}>
          {props.templateSaving ? props.t("saving") : props.t("saveAsTemplate")}
        </button>
        <button className="text-btn" onClick={props.onDeleteWorkout} type="button">
          {props.t("deleteWorkout")}
        </button>
      </div>
    </section>
  );
}
