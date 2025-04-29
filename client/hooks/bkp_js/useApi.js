import http from "utils/http";

import useApp from "./useApp";

const useApi = () => {
  const app = useApp();

  return http(app.appHost, () => {
    const headers = { "Content-Type": "application/json" };

    const bearer = app.appToken || app.auth.token;
    if (bearer) headers["Authorization"] = `Bearer ${bearer}`;

    const session = app.store.getItem("session");
    if (session) headers["X-Session"] = session;

    const device = app.store.getItem("device");
    if (device) headers["X-Device"] = device;

    if (app.company) headers["X-Company"] = app.company.id;

    return {
      headers,
      success: (resp) => {
        if (resp) {
          const xses = resp.headers.get("X-Session");
          if (xses !== session) app.store.setItem("session", xses);

          const xdev = resp.headers.get("X-Device");
          if (xdev) app.store.setItem("device", xdev);

          return Promise.resolve(resp);
        } else {
          return Promise.reject("Servidor não respondeu há tempo.");
        }
      },
      failure: (resp) => {
        if (resp.status === 401 || resp.status === 403) app.auth.logout();
        return Promise.reject(resp);
      },
    };
  });
};

export default useApi;
