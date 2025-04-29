import useApi from "./useApi";
import useNotify from "./useNotify";
import useMerge from "./useMerge";

const useReports = () => {
  const [state, setState] = useMerge({});

  const api = useApi();
  const notify = useNotify();

  const build = (options, onData) => {
    setState({ building: options.path });
    return api
      .post(options)
      .then(({ type, ctype, ...rest }) =>
        onData({ type, ctype, raw: rest[type] })
      )
      .catch((error) => notify.error(error))
      .finally(() => setState({ building: null }));
  };

  const find = (id, options, onData) =>
    build({ path: `report/${id}`, ...options }, onData);

  const load = (onData, id) => {
    setState({ loading: true });
    return api
      .get({ path: "report" + (id ? "/" + id : "") })
      .then(({ json }) => onData(json))
      .catch((error) => notify.error(error))
      .finally(() => setState({ loading: false }));
  };

  const browse = (url) => {
    const win = window.open(url);
    if (win) win.location.href = url;
  };

  const open = ({ raw, ctype }) =>
    browse(
      URL.createObjectURL(
        raw instanceof Blob ? raw : new Blob([raw], { type: ctype })
      )
    );

  return {
    find,
    load,
    open,
    build,
    browse,
    ...state,
  };
};

export default useReports;
