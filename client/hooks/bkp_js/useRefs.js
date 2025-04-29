import React from "react";

import _ from "utils";

const useRefs = (recs = []) => {
  const [refs, setRefs] = React.useState({});

  React.useEffect(
    () =>
      setRefs(
        _.reduce(
          recs,
          (obj, { id }) => {
            if (!obj[id]) obj[id] = React.createRef();
            return obj;
          },
          refs
        )
      ),
    [recs.length]
  );

  return refs;
};

export default useRefs;
