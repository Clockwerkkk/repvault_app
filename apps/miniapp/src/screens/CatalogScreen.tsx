import { useMemo, useState } from "react";
import type { ExerciseListItem } from "../types";
import type { MessageKey } from "../i18n/messages";

type CatalogScreenProps = {
  groupedItems: Array<{ id: string; title: string; items: ExerciseListItem[] }>;
  loading: boolean;
  searchValue: string;
  t: (key: MessageKey, params?: Record<string, string | number>) => string;
  onBack: () => void;
  onSearchChange: (value: string) => void;
  onOpenProgress: (exerciseId: string) => void;
};

export function CatalogScreen(props: CatalogScreenProps) {
  const [openedGroupId, setOpenedGroupId] = useState<string | null>(null);
  const openedGroup = useMemo(
    () => props.groupedItems.find((group) => group.id === openedGroupId) ?? null,
    [openedGroupId, props.groupedItems]
  );

  return (
    <section className="screen">
      <div className="top-row sticky-header">
        <button className="text-btn" onClick={props.onBack} type="button">
          {props.t("back")}
        </button>
        <h1>{props.t("exerciseCatalog")}</h1>
      </div>

      <input
        className="input"
        placeholder={props.t("searchByName")}
        value={props.searchValue}
        onChange={(event) => props.onSearchChange(event.target.value)}
      />
      <p>{props.t("groupedByBodyParts")}</p>

      {props.loading ? <p>{props.t("loadingExercises")}</p> : null}
      {!props.loading && props.groupedItems.length === 0 ? <p>{props.t("noExercisesFound")}</p> : null}

      {!props.loading && !openedGroup
        ? props.groupedItems.map((group) => (
            <article key={group.id} className="card">
              <h2>{group.title}</h2>
              <button className="secondary-btn" onClick={() => setOpenedGroupId(group.id)} type="button">
                {props.t("openDetails")}
              </button>
            </article>
          ))
        : null}

      {!props.loading && openedGroup ? (
        <article className="card">
          <div className="top-row">
            <h2>{openedGroup.title}</h2>
            <button className="text-btn" onClick={() => setOpenedGroupId(null)} type="button">
              {props.t("back")}
            </button>
          </div>
          {openedGroup.items.map((item) => (
            <div key={item.id} className="list-item">
              <strong>{item.name}</strong>
              <button
                className="secondary-btn"
                onClick={() => props.onOpenProgress(item.id)}
                type="button"
              >
                {props.t("openProgress")}
              </button>
            </div>
          ))}
        </article>
      ) : null}
    </section>
  );
}
