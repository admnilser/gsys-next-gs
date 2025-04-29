import { useSelector, useDispatch } from "react-redux";

import actions from "redux/actions";

const useSidebar = () => {
  const dispatch = useDispatch();
  const sidebarOpened = useSelector(({ ui }) => ui.sidebarOpened);

  const setSidebarOpened = (opened) =>
    dispatch({
      type: actions.UI_SIDE_MENU_TOGGLE,
      payload: opened,
    });

  return {
    hideSidebar: () => setSidebarOpened(false),
    sidebarOpened,
    setSidebarOpened,
  };
};

export default useSidebar;
