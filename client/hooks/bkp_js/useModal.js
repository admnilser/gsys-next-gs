import React from "react";

import { Modal as SuiModal } from "semantic-ui-react";

import _ from "utils";

const useModal = ({
  content,
  onClose,
  unwrap,
  scrolling,
  closeable = true,
  ...rest
}) => {
  const [modal, setModal] = React.useState(null);

  const handleClose = (res) => {
    setModal(null);
    onClose && onClose(res);
  };

  return [
    modal,
    (data) => {
      const contentProps = {
        ...data,
        modalCallback: handleClose,
      };

      const contentWithData = _.isFunction(content)
        ? React.createElement(content, contentProps)
        : content(contentProps);

      return setModal(
        <SuiModal
          open={true}
          closeOnDimmerClick={closeable}
          closeOnEscape={closeable}
          content={
            unwrap ? (
              contentWithData
            ) : (
              <SuiModal.Content
                content={contentWithData}
                scrolling={scrolling}
              />
            )
          }
          onClose={() => handleClose(null)}
          {...rest}
        />
      );
    },
    handleClose,
  ];
};

export default useModal;
