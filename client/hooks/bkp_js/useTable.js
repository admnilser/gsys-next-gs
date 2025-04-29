import React from "react";

import useMerge from "./useMerge";

import _ from "utils";

export const useTableProps = (recs) => {
  const [state, setState] = useMerge({
    ids: [],
    recs: {},
    selectedIds: [],
  });

  React.useEffect(() => {
    setState({
      ids: _.map(recs, (r, i) => i),
      recs: _.reduce(
        recs,
        (acc, rec, idx) => {
          acc[idx] = rec;
          return acc;
        },
        {}
      ),
      selectedIds: [],
    });
  }, [recs]);

  return {
    ...state,
    selectAll: (check) =>
      setState({ selectedIds: check ? [...state.ids] : [] }),
    toggleSelected: (id) => {
      const { selectedIds } = state;
      selectedIds.includes(id)
        ? setState({ selectedIds: _.pull(selectedIds, id) })
        : setState({ selectedIds: [...selectedIds, id] });
    },
  };
};
