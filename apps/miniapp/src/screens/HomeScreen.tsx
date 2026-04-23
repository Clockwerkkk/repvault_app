import type { Language, MessageKey } from "../i18n/messages";
import type { HomeSummary } from "../types";
import { formatLocalDate } from "../utils/dateTime";

type HomeScreenProps = {
  userName: string;
  summary: HomeSummary | null;
  loading: boolean;
  hasActiveWorkout: boolean;
  language: Language;
  t: (key: MessageKey, params?: Record<string, string | number>) => string;
  onLanguageChange: (language: Language) => void;
  onStartWorkout: () => void;
  onOpenHistory: () => void;
  onOpenCatalog: () => void;
};

export function HomeScreen(props: HomeScreenProps) {
  return (
    <section className="screen">
      <h1>{props.t("helloUser", { name: props.userName })}</h1>
      <button className="primary-btn" onClick={props.onStartWorkout} type="button">
        {props.hasActiveWorkout ? props.t("continueWorkout") : props.t("startWorkout")}
      </button>

      {props.loading ? <p>{props.t("loadingSummary")}</p> : null}

      {!props.loading && props.summary?.lastWorkout ? (
        <article className="card">
          <h2>{props.t("lastWorkout")}</h2>
          <p>{props.summary.lastWorkout.title}</p>
          <p>{props.t("exercisesCount", { count: props.summary.lastWorkout.exercisesCount })}</p>
          <p>{props.t("setsCount", { count: props.summary.lastWorkout.setsCount })}</p>
        </article>
      ) : null}

      {!props.loading && !props.summary?.lastWorkout ? (
        <article className="card">
          <h2>{props.t("noWorkoutsYet")}</h2>
          <p>{props.t("startFirstWorkoutNow")}</p>
        </article>
      ) : null}

      <article className="card">
        <h2>{props.t("quickStats")}</h2>
        <p>{props.t("totalWorkouts", { count: props.summary?.stats.totalWorkouts ?? 0 })}</p>
        <p>
          {props.t("totalLoggedExercises", {
            count: props.summary?.stats.totalLoggedExercises ?? 0
          })}
        </p>
        <p>
          {props.t("lastDay", {
            value: props.summary?.stats.lastWorkoutDate
              ? formatLocalDate(props.summary.stats.lastWorkoutDate)
              : "-"
          })}
        </p>
      </article>

      <div className="actions-row">
        <span>{props.t("languageLabel")}:</span>
        <button
          className={props.language === "ru" ? "primary-btn" : "secondary-btn"}
          onClick={() => props.onLanguageChange("ru")}
          type="button"
        >
          RU
        </button>
        <button
          className={props.language === "en" ? "primary-btn" : "secondary-btn"}
          onClick={() => props.onLanguageChange("en")}
          type="button"
        >
          EN
        </button>
      </div>

      <div className="actions-row">
        <button className="secondary-btn" onClick={props.onOpenHistory} type="button">
          {props.t("history")}
        </button>
        <button className="secondary-btn" onClick={props.onOpenCatalog} type="button">
          {props.t("exerciseCatalog")}
        </button>
      </div>
    </section>
  );
}
