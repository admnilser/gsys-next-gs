import React from "react";

import { Button } from "../controls";

const Submit = ({ formState = {}, color, ...rest }) => {
  const {
    submitting,
    pristine,
    touched,
    hasValidationErrors,
    handleSubmit,
    size,
  } = formState;

  return (
    <Button
      onClick={handleSubmit}
      disabled={(pristine && !touched) || hasValidationErrors}
      loading={submitting}
      primary={!color}
      color={color}
      size={size}
      {...rest}
    />
  );
};

export default Submit;
