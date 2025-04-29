import React from "react";

import { Confirm } from "ui";

const useConfirm = (props) => {
  const [state, setState] = React.useState({});

  const trigger = (content, onConfirm, onDiscard, input) =>
    setState({ content, input, onConfirm, onDiscard, open: true });

  return [
    trigger,
    state.open ? (
      <Confirm {...state} {...props} onClose={() => setState({})} />
    ) : null,
  ];
};

export default useConfirm;
