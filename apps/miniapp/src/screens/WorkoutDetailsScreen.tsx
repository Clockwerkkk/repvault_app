import type { WorkoutDetails } from "../types";
import type { MessageKey } from "../i18n/messages";
import { formatLocalDate } from "../utils/dateTime";

type WorkoutDetailsScreenProps = {
  workout: WorkoutDetails | null;
  loading: boolean;
  t: (key: MessageKey, params?: Record<string, string | number>) => string;
  onBack: () => void;
  onOpenExerciseProgress: (exerciseId: string) => void;
};

export function WorkoutDetailsScreen(props: WorkoutDetailsScreenProps) {
  return (
    <section className="screen">
      <div className="sticky-header">
        <button className="text-btn" onClick={props.onBack} type="button">
          {props.t("back")}
        </button>
      </div>
      <h1>{props.t("workoutDetails")}</h1>

      {props.loading ? <p>{props.t("loadingWorkoutDetails")}</p> : null}
      {!props.loading && !props.workout ? <p>{props.t("workoutNotFound")}</p> : null}

      {!props.loading && props.workout ? (
        <>
          <article className="card">
            <p><strong>{props.workout.title}</strong></p>
            <p>{props.t("dateLabel", { value: formatLocalDate(props.workout.startedAt) })}</p>
            <p>{props.t("totalVolumeLabel", { value: props.workout.totalVolume.toFixed(2) })}</p>
          </article>

          {props.workout.exercises.map((item) => (
            <article className="card" key={item.id}>
              <p>
                <strong>
                  {item.orderIndex}. {item.exercise.name}
                </strong>
              </p>
              {item.sets.map((set) => (
                <p key={set.id}>
                  {props.t("setDetails", {
                    index: set.setIndex,
                    weight: set.weightKg,
                    reps: set.reps,
                    setType: set.setType === "working" ? props.t("working") : props.t("warmup")
                  })}
                </p>
              ))}
              <button
                className="secondary-btn"
                onClick={() => props.onOpenExerciseProgress(item.exercise.id)}
                type="button"
              >
                {props.t("viewProgress")}
              </button>
            </article>
          ))}
        </>
      ) : null}
    </section>
  );
}
