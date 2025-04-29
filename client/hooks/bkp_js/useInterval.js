import React from "react";

const useInterval = (callback, time) => {
  const ref = React.useRef();

  const terminate = () => clearInterval(ref.current);

  React.useEffect(() => {
    if (callback) {
      if (ref.current) terminate();

      ref.current = setInterval(callback, time);

      return terminate;
    }
  }, [callback, time]);

  return terminate;
};

export default useInterval;
