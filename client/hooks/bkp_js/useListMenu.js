import { PopupMenu } from "ui";

import useListPopup from "./useListPopup";

const useListMenu = (props) => useListPopup({ as: PopupMenu, ...props });

export default useListMenu;
