import React from "react";

import Cookies from "js-cookie";

const useCookie = (name, opts = { expires: 365 }) => {
  const [state, setState] = React.useState(() => {
    const cookie = Cookies.get(name);
    try {
      return cookie ? JSON.parse(cookie) : undefined;
    } catch (e) {
      return undefined;
    }
  });

  return [
    state,
    (value) => {
      value !== undefined
        ? Cookies.set(name, JSON.stringify(value), opts)
        : Cookies.remove(name);
      setState(value);
    },
  ];
};

export default useCookie;
