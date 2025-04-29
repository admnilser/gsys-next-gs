import React from "react";

import { useLocation, useHistory } from "react-router-dom";

const useLocationSearch = () => {
  const history = useHistory();
  const location = useLocation();

  const getParam = React.useCallback(
    (param) => new URLSearchParams(location.search).get(param) || "",
    [location.search]
  );

  const setParam = React.useCallback(
    (param, value) => {
      const search = new URLSearchParams(location.search);
      search.set(param, value);
      history.replace(`${location.pathname}?${search.toString()}`);
    },
    [history, location]
  );

  return [getParam, setParam];
};

export default useLocationSearch;
