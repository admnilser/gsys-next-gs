import React from "react";

export function useReplace<T>(initial: T) {
  const [state, setState] = React.useState<T>(initial);

  const replace = (ssa: React.SetStateAction<T>) => {
    const undo = () => setState(state);
    setState(ssa);
    return undo;
  };

  const reset = () => setState(initial);

  const undo = () => setState(state);

  return [state, { replace, undo, reset }] as const;
}
