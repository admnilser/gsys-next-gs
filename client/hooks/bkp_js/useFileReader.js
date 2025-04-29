import React from "react";

const useFileReader = (file, onRead) => {
  const [state, setState] = React.useState({
    loading: true,
  });

  const filePath = file
    ? typeof file === "string"
      ? file
      : file.path
    : undefined;

  React.useEffect(() => {
    if (!filePath) return;

    const fr = new FileReader();

    fr.onload = function () {
      const result = onRead ? onRead(fr.result) : fr.result;
      Promise.resolve(result)
        .then((data) => setState({ loading: false, data }))
        .catch((error) => setState({ loading: false, error }));
    };

    setState({ loading: true });

    fr.readAsText(file);
  }, [filePath]);

  return state;
};

export default useFileReader;
