import type { MessageKey } from "../i18n/messages";
import type { WorkoutTemplate } from "../types";

type TemplateDetailsScreenProps = {
  template: WorkoutTemplate | null;
  t: (key: MessageKey, params?: Record<string, string | number>) => string;
  editing: boolean;
  deleting: boolean;
  onBack: () => void;
  onEditTemplate: (templateId: string) => void;
  onDeleteTemplate: (templateId: string) => void;
  onStartFromTemplate: (templateId: string) => void;
};

export function TemplateDetailsScreen(props: TemplateDetailsScreenProps) {
  const template = props.template;

  return (
    <section className="screen">
      <div className="top-row sticky-header">
        <button className="text-btn" onClick={props.onBack} type="button">
          {props.t("back")}
        </button>
        <h1>{props.t("templateDetailsTitle")}</h1>
      </div>

      {!template ? <p>{props.t("templateNotFound")}</p> : null}

      {template ? (
        <>
          <article className="card">
            <p><strong>{template.title}</strong></p>
            <p>{props.t("exercisesCount", { count: template.exercises.length })}</p>
          </article>

          <article className="card">
            <h2>{props.t("exercisesTitle")}</h2>
            {template.exercises.map((item) => (
              <div className="list-item" key={item.id}>
                <strong>{item.orderIndex}. {item.exercise.name}</strong>
                <span>{item.exercise.category.name}</span>
              </div>
            ))}
          </article>

          <button className="primary-btn" onClick={() => props.onStartFromTemplate(template.id)} type="button">
            {props.t("startFromTemplate")}
          </button>
          <button className="secondary-btn" onClick={() => props.onEditTemplate(template.id)} type="button" disabled={props.editing}>
            {props.editing ? props.t("saving") : props.t("editTemplate")}
          </button>
          <button className="danger-btn" onClick={() => props.onDeleteTemplate(template.id)} type="button" disabled={props.deleting}>
            {props.deleting ? props.t("saving") : props.t("deleteTemplate")}
          </button>
        </>
      ) : null}
    </section>
  );
}
