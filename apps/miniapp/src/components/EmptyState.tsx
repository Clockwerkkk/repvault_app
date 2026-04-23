type EmptyStateProps = {
  title: string;
  description: string;
};

export function EmptyState(props: EmptyStateProps) {
  return (
    <article className="card">
      <h2>{props.title}</h2>
      <p>{props.description}</p>
    </article>
  );
}
