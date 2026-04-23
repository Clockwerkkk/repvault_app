type ErrorStateProps = {
  message: string;
};

export function ErrorState(props: ErrorStateProps) {
  return <p className="error-text">{props.message}</p>;
}
