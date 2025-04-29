import React from "react";

import useState from "./useState";

const useMerge = (initialState) => {
  const [state, setState] = useState(initialState);

  const mergeState = React.useCallback(
    (newState) => {
      setState((curState) => ({ ...curState, ...newState }));
    },
    [setState]
  );

  const resetState = React.useCallback(
    () => setState(initialState),
    [setState, initialState]
  );

  const changeState = React.useCallback(
    (e, { name, value }) => mergeState({ [name]: value }),
    [mergeState]
  );

  return [state, mergeState, resetState, changeState];
};

export default useMerge;
