import type { MessageKey } from "../i18n/messages";
import type { WorkoutTemplate } from "../types";

type TemplatesScreenProps = {
  items: WorkoutTemplate[];
  loading: boolean;
  t: (key: MessageKey, params?: Record<string, string | number>) => string;
  onBack: () => void;
  onCreateTemplate: () => void;
  onOpenTemplate: (templateId: string) => void;
  onStartFromTemplate: (templateId: string) => void;
};

export function TemplatesScreen(props: TemplatesScreenProps) {
  return (
    <section className="screen">
      <div className="top-row sticky-header">
        <button className="text-btn" onClick={props.onBack} type="button">
          {props.t("back")}
        </button>
        <h1>{props.t("templatesTitle")}</h1>
      </div>
      <button className="primary-btn" onClick={props.onCreateTemplate} type="button">
        {props.t("createTemplate")}
      </button>

      {props.loading ? <p>{props.t("loadingTemplates")}</p> : null}
      {!props.loading && props.items.length === 0 ? <p>{props.t("noTemplatesYet")}</p> : null}

      {!props.loading &&
        props.items.map((template) => (
          <article className="card" key={template.id}>
            <p><strong>{template.title}</strong></p>
            <p>{props.t("exercisesCount", { count: template.exercises.length })}</p>
            <div className="actions-row">
              <button className="secondary-btn" onClick={() => props.onOpenTemplate(template.id)} type="button">
                {props.t("openDetails")}
              </button>
              <button className="secondary-btn" onClick={() => props.onStartFromTemplate(template.id)} type="button">
                {props.t("startFromTemplate")}
              </button>
            </div>
          </article>
        ))}
    </section>
  );
}
