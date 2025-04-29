import React from "react";

import { Checkbox } from "semantic-ui-react";

import { FormSpy } from "react-final-form";

const FieldLabel = ({ text, checked, onToggle }) => {
  const renderLabel = (props) => {
    const check = checked(props);
    return (
      <label>
        <Checkbox
          label={text}
          checked={check}
          onChange={() => onToggle(!check, props)}
        />
      </label>
    );
  };

  return <FormSpy subscription={{ values: true }} render={renderLabel} />;
};

export default FieldLabel;
