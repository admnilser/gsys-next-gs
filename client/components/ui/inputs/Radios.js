import React from "react";

import { Header, Radio } from "semantic-ui-react";

import _ from "utils";

const Radios = ({ label, value, onChange, items }) => {
  const handleChange = (e, { value }) => {
    onChange && onChange(value);
  };

  return (
    <div>
      {label && <Header as="h5" content={label} />}
      {_.isArray(items)
        ? items.map((item, idx) => (
            <div key={idx}>
              <Radio
                label={item.label}
                value={item.value}
                checked={value === item.value}
                onChange={handleChange}
              />
            </div>
          ))
        : null}
    </div>
  );
};

export default Radios;
