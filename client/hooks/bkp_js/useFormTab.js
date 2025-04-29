import { useSelector, useDispatch } from "react-redux";

import actions from "redux/actions";

import _ from "utils";

const useFormTab = (resource) => {
  const dispatch = useDispatch();

  const formTab = useSelector((state) =>
    _.get(state, ["res", "form", resource, "tab"], 0)
  );

  const setFormTab = (tab) =>
    dispatch({ type: actions.RES_FORM_CHANGE_TAB, payload: { resource, tab } });

  return { formTab, setFormTab };
};

export default useFormTab;
