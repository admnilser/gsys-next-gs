import React from "react";

import { useSelector, useDispatch } from "react-redux";

import actions from "redux/actions";

import _ from "utils";

const usePageState = (page, initialState = {}) => {
  const dispatch = useDispatch();

  const state = useSelector((state) =>
    _.get(state, ["ui", "resPages", page, "state"], initialState)
  );

  const setState = React.useCallback(
    (newState) =>
      dispatch({
        type: actions.UI_PAGES_STATE,
        payload: { page, state: { ...state, ...newState } },
      }),
    [page, state, dispatch]
  );

  return [state, setState];
};

export default usePageState;
