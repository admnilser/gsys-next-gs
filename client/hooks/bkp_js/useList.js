import { useResourceWithStore } from "./useResource";

import _ from "utils";

const useList = (resource) => {
  const {
    list,
    data,
    tree,
    updateList,
    updateTree,
    refresh,
    refreshItem,
    select,
    destroy,
    update,
    replace,
    checkAction,
  } = useResourceWithStore(resource);

  const toggleNode = (nodeKey) => {
    const open = { ...tree.open };
    if (open[nodeKey] === undefined) {
      refresh({ nodeKey });
    } else {
      open[nodeKey] = !open[nodeKey];
      updateTree({ open });
    }
  };

  const insert = (values) => checkAction("I") && select(values || {});

  const modify = (id) => checkAction("U") && select({ id });

  const setSort = (field) => {
    let order =
      field !== list.sort.field
        ? "ASC"
        : list.sort.order === "ASC"
        ? "DESC"
        : "ASC";

    return refresh({
      sort: field ? { field, order } : {},
    });
  };

  const setPage = (page) => refresh({ page });

  const setFilter = (values) =>
    refresh({ filter: { ...list.filter, ...values } });

  const setSelectedIds = (selectedIds) => updateList({ selectedIds });

  const selectAll = (select) =>
    updateList({ selectedIds: select ? data.ids : [] });

  const toggleSelected = (id) => {
    updateList({ selectedIds: _.toggle(list.selectedIds, id) });
  };

  const destroySelected = () =>
    destroy(list.selectedIds).then(() => updateList({ selectedIds: [] }));

  return {
    ...list,
    ...data,
    tree,
    resource,
    refresh,
    refreshItem,
    select,
    insert,
    modify,
    replace,
    update,
    destroy,
    setSort,
    setPage,
    setFilter,
    setSelectedIds,
    selectAll,
    toggleSelected,
    toggleNode,
    destroySelected,
  };
};

export default useList;
