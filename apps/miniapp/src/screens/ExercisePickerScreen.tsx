import type { ExerciseListItem } from "../types";
import type { MessageKey } from "../i18n/messages";
import type { ExerciseGroup } from "../data/exerciseGroups";

type ExercisePickerScreenProps = {
  items: ExerciseListItem[];
  searchValue: string;
  selectedGroupId: string;
  groups: ExerciseGroup[];
  addedExerciseIds: string[];
  loading: boolean;
  t: (key: MessageKey, params?: Record<string, string | number>) => string;
  onBack: () => void;
  onSearchChange: (value: string) => void;
  onGroupChange: (value: string) => void;
  onSelectExercise: (exerciseId: string) => void;
};

export function ExercisePickerScreen(props: ExercisePickerScreenProps) {
  const selectedGroup = props.groups.find((group) => group.id === props.selectedGroupId);
  const addedIds = new Set(props.addedExerciseIds);

  return (
    <section className="screen">
      <div className="top-row sticky-header">
        <button className="text-btn" onClick={props.onBack} type="button">
          {props.t("back")}
        </button>
        <h1>{props.t("exercisePicker")}</h1>
      </div>

      {!selectedGroup ? <p>{props.t("pickCategoryFirst")}</p> : null}

      {!selectedGroup ? (
        <div className="group-tiles-scroll">
          <div className="group-tiles-grid">
            {props.groups.map((group) => (
              <button
                key={group.id}
                className="secondary-btn group-tile-btn"
                onClick={() => props.onGroupChange(group.id)}
                type="button"
              >
                {group.title}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {selectedGroup ? (
        <>
          <p>{props.t("selectedCategory", { value: selectedGroup.title })}</p>
          <button className="text-btn" onClick={() => props.onGroupChange("")} type="button">
            {props.t("changeCategory")}
          </button>
          <input
            className="input"
            placeholder={props.t("searchByName")}
            value={props.searchValue}
            onChange={(event) => props.onSearchChange(event.target.value)}
          />
        </>
      ) : null}

      {props.loading ? <p>{props.t("loadingExercises")}</p> : null}

      {!props.loading && selectedGroup && props.items.length === 0 ? (
        <p>{props.t("noExercisesFound")}</p>
      ) : null}

      {!props.loading &&
        selectedGroup &&
        props.items.map((item) => (
          <article key={item.id} className="card">
            <p><strong>{item.name}</strong></p>
            <p>{item.category.name}</p>
            {addedIds.has(item.id) ? (
              <button className="secondary-btn" type="button" disabled>
                {props.t("alreadyAdded")}
              </button>
            ) : (
              <button
                className="primary-btn"
                onClick={() => props.onSelectExercise(item.id)}
                type="button"
              >
                {props.t("addToWorkout")}
              </button>
            )}
          </article>
        ))}
    </section>
  );
}
