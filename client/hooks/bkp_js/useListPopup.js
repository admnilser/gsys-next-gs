import React from "react";

import { Popup } from "semantic-ui-react";

const useListPopup = ({ as: Component = Popup, ...props }) => {
  const [state, setState] = React.useState(null);

  const popup = React.useCallback(
    (e, data) => {
      e.stopPropagation();
      setState({ context: e.target, data });
    },
    [setState]
  );

  const close = React.useCallback(() => setState(null), [setState]);

  return [
    <Component open={state !== null} onClose={close} {...state} {...props} />,
    popup,
    close,
  ];
};

export default useListPopup;
