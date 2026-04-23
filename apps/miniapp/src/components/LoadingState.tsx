type LoadingStateProps = {
  message?: string;
};

export function LoadingState(props: LoadingStateProps) {
  return <p>{props.message ?? "Loading..."}</p>;
}
