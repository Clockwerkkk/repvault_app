import type { WorkoutHistoryItem } from "../types";
import type { MessageKey } from "../i18n/messages";
import { formatLocalDate } from "../utils/dateTime";

type HistoryScreenProps = {
  items: WorkoutHistoryItem[];
  loading: boolean;
  t: (key: MessageKey, params?: Record<string, string | number>) => string;
  onBack: () => void;
  onOpenWorkout: (workoutId: string) => void;
};

export function HistoryScreen(props: HistoryScreenProps) {
  return (
    <section className="screen">
      <div className="sticky-header">
        <button className="text-btn" onClick={props.onBack} type="button">
          {props.t("back")}
        </button>
      </div>
      <h1>{props.t("workoutHistory")}</h1>

      {props.loading ? <p>{props.t("loadingHistory")}</p> : null}
      {!props.loading && props.items.length === 0 ? <p>{props.t("noCompletedWorkouts")}</p> : null}

      {!props.loading &&
        props.items.map((item) => (
          <article className="card" key={item.id}>
            <p><strong>{item.title}</strong></p>
            <p>{formatLocalDate(item.startedAt)}</p>
            <p>{props.t("exercisesCount", { count: item.exercisesCount })}</p>
            <p>{props.t("setsCount", { count: item.setsCount })}</p>
            <p>{props.t("volumeLabel", { value: item.totalVolume.toFixed(2) })}</p>
            <button className="secondary-btn" onClick={() => props.onOpenWorkout(item.id)} type="button">
              {props.t("openDetails")}
            </button>
          </article>
        ))}
    </section>
  );
}
