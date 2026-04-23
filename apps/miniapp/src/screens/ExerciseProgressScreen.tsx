import type { ExerciseProgress } from "../types";
import type { MessageKey } from "../i18n/messages";
import { formatLocalDate } from "../utils/dateTime";

type ExerciseProgressScreenProps = {
  progress: ExerciseProgress | null;
  loading: boolean;
  t: (key: MessageKey, params?: Record<string, string | number>) => string;
  onBack: () => void;
};

export function ExerciseProgressScreen(props: ExerciseProgressScreenProps) {
  return (
    <section className="screen">
      <div className="top-row sticky-header">
        <button className="text-btn" onClick={props.onBack} type="button">
          {props.t("back")}
        </button>
        <h1>{props.t("exerciseProgress")}</h1>
      </div>

      {props.loading ? <p>{props.t("loadingProgress")}</p> : null}
      {!props.loading && !props.progress ? <p>{props.t("noProgressData")}</p> : null}

      {!props.loading && props.progress ? (
        <>
          <article className="card">
            <p><strong>{props.progress.exercise.name}</strong></p>
            <p>{props.t("categoryLabel", { value: props.progress.exercise.category.name })}</p>
            <p>{props.t("bestWeight", { value: props.progress.metrics.bestWeight.toFixed(2) })}</p>
            <p>{props.t("bestE1rm", { value: props.progress.metrics.bestEstimatedOneRepMax.toFixed(2) })}</p>
            <p>{props.t("totalVolume", { value: props.progress.metrics.totalVolume.toFixed(2) })}</p>
            <p>{props.t("sessions", { count: props.progress.metrics.sessionsCount })}</p>
          </article>

          <article className="card">
            <h2>{props.t("progressPoints")}</h2>
            {props.progress.history.length === 0 ? <p>{props.t("noHistoryYet")}</p> : null}
            {props.progress.history.map((point) => (
              <p key={`${point.workoutId}-${point.date}`}>
                {props.t("progressPointLine", {
                  date: formatLocalDate(point.date),
                  bestWeight: point.bestWeight.toFixed(2),
                  e1rm: point.bestEstimatedOneRepMax.toFixed(2),
                  volume: point.volume.toFixed(2)
                })}
              </p>
            ))}
          </article>
        </>
      ) : null}
    </section>
  );
}
