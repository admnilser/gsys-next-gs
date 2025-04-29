import React from "react";

import useMounted from "./useMounted";

const useState = (initialState) => {
  const mounted = useMounted();

  const [state, setState] = React.useState(initialState);

  const changeState = React.useCallback(
    (value) => mounted.current && setState(value),
    [setState, mounted]
  );

  return [state, changeState];
};

export default useState;
