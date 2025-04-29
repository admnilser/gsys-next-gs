import { useSelector, useDispatch } from "react-redux";

import actions from "redux/actions";

import useSound from "./useSound";

const useNotify = () => {
  const messages = useSelector((state) => state.ui.messages);

  const dispatch = useDispatch();

  const beep = useSound("error");

  const show = (content, type = "info") =>
    dispatch({
      type: actions.UI_NOTIFY_PUSH,
      payload: { content, type },
    });

  return {
    messages,
    show,
    error: (error) => {
      if (error) {
        beep();
        show(error.toString(), "error");
      }
    },
    hide: (index) => dispatch({ type: actions.UI_NOTIFY_HIDE, payload: index }),
  };
};

export default useNotify;
