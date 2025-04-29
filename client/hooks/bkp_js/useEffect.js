import React from "react";

const useEffect = (callback, deps) => {
  React.useEffect(
    callback,
    deps.map((dep) => JSON.stringify(dep))
  );
};

export default useEffect;
