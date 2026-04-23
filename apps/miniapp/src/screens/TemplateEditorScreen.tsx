import type { ExerciseGroup } from "../data/exerciseGroups";
import type { MessageKey } from "../i18n/messages";
import type { ExerciseListItem } from "../types";

type TemplateEditorScreenProps = {
  title: string;
  titleError: string | null;
  selectedGroupId: string;
  searchValue: string;
  groups: ExerciseGroup[];
  availableItems: ExerciseListItem[];
  selectedItems: ExerciseListItem[];
  loading: boolean;
  saving: boolean;
  t: (key: MessageKey, params?: Record<string, string | number>) => string;
  onBack: () => void;
  onTitleChange: (value: string) => void;
  onGroupChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onAddExercise: (exerciseId: string) => void;
  onRemoveExercise: (exerciseId: string) => void;
  onSave: () => void;
};

export function TemplateEditorScreen(props: TemplateEditorScreenProps) {
  const selectedGroup = props.groups.find((group) => group.id === props.selectedGroupId);
  const selectedIds = new Set(props.selectedItems.map((item) => item.id));

  return (
    <section className="screen">
      <div className="top-row sticky-header">
        <button className="text-btn" onClick={props.onBack} type="button">
          {props.t("back")}
        </button>
        <h1>{props.t("templateEditorTitle")}</h1>
      </div>

      <article className="card">
        <input
          className="input"
          value={props.title}
          placeholder={props.t("templateNamePlaceholder")}
          onChange={(event) => props.onTitleChange(event.target.value)}
        />
        {props.titleError ? <p className="error-text">{props.titleError}</p> : null}
      </article>

      <article className="card">
        <h2>{props.t("selectedExercisesTitle")}</h2>
        {props.selectedItems.length === 0 ? <p>{props.t("noExercisesYet")}</p> : null}
        {props.selectedItems.map((item, index) => (
          <div className="list-item" key={item.id}>
            <strong>{index + 1}. {item.name}</strong>
            <span>{item.category.name}</span>
            <button className="text-btn" onClick={() => props.onRemoveExercise(item.id)} type="button">
              {props.t("delete")}
            </button>
          </div>
        ))}
      </article>

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
      {!props.loading && selectedGroup && props.availableItems.length === 0 ? <p>{props.t("noExercisesFound")}</p> : null}
      {!props.loading &&
        selectedGroup &&
        props.availableItems.map((item) => (
          <article className="card" key={item.id}>
            <p><strong>{item.name}</strong></p>
            <p>{item.category.name}</p>
            {selectedIds.has(item.id) ? (
              <button className="secondary-btn" type="button" disabled>
                {props.t("alreadyAdded")}
              </button>
            ) : (
              <button className="primary-btn" onClick={() => props.onAddExercise(item.id)} type="button">
                {props.t("addToTemplate")}
              </button>
            )}
          </article>
        ))}

      <button className="primary-btn" onClick={props.onSave} type="button" disabled={props.saving}>
        {props.saving ? props.t("saving") : props.t("saveTemplateChanges")}
      </button>
    </section>
  );
}
