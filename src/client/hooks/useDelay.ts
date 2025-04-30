import React from "react";

export const useDelay = <T>(callback: (args?: T) => void, timeout: number) => {
  const delay = React.useRef<NodeJS.Timeout | null>(null);

  return React.useCallback(
    (args?: T) => {
      if (delay.current) clearTimeout(delay.current);
      delay.current = setTimeout(() => callback(args), timeout);
    },
    [callback, timeout]
  );
};
