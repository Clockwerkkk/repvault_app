import type { WorkoutDetails } from "../types";
import type { MessageKey } from "../i18n/messages";
import { formatLocalDate } from "../utils/dateTime";

type WorkoutDetailsScreenProps = {
  workout: WorkoutDetails | null;
  loading: boolean;
  t: (key: MessageKey, params?: Record<string, string | number>) => string;
  onBack: () => void;
  onDeleteWorkout: (workoutId: string) => void;
  onOpenExerciseProgress: (exerciseId: string) => void;
};

export function WorkoutDetailsScreen(props: WorkoutDetailsScreenProps) {
  const workout = props.workout;

  return (
    <section className="screen">
      <div className="top-row sticky-header">
        <button className="text-btn" onClick={props.onBack} type="button">
          {props.t("back")}
        </button>
        <h1>{props.t("workoutDetails")}</h1>
      </div>

      {props.loading ? <p>{props.t("loadingWorkoutDetails")}</p> : null}
      {!props.loading && !workout ? <p>{props.t("workoutNotFound")}</p> : null}

      {!props.loading && workout ? (
        <>
          <article className="card">
            <p><strong>{workout.title}</strong></p>
            <p>{props.t("dateLabel", { value: formatLocalDate(workout.startedAt) })}</p>
            <p>{props.t("totalVolumeLabel", { value: workout.totalVolume.toFixed(2) })}</p>
            <button className="text-btn" onClick={() => props.onDeleteWorkout(workout.id)} type="button">
              {props.t("deleteWorkout")}
            </button>
          </article>

          {workout.exercises.map((item) => (
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
                    weight: set.weightKg === null ? props.t("bodyweightLabel") : `${set.weightKg}кг`,
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
