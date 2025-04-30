import React from "react";

export function useMerge<S>(initial: S) {
  const [state, setState] = React.useState<S>(initial);

  const merge = React.useCallback((newState: Partial<S>) => {
    setState((curState) => ({ ...curState, ...newState }));
  }, []);

  return [state, merge, setState] as const;
}