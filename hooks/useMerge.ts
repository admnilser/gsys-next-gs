import React from "react";

export function useMerge<T>(initial: T) {
  const [state, setState] = React.useState(initial);

  function merge(value: Partial<T>) {
    setState({ ...state, ...value });
  }

  return [state, merge] as [T, (value: T) => void];
}
