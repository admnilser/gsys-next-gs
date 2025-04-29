import React from "react";

import { Dropdown as SuiDropdown } from "semantic-ui-react";

import _ from "utils";

const DropDown = ({ options, children, ...rest }) => {
  const items = React.useMemo(() => {
    return _.isArray(options) ? options : _.split(options, "");
  }, [options]);

  return (
    <SuiDropdown {...rest}>
      <SuiDropdown.Menu>
        {_.map(items, (item, idx) =>
          _.isObject(item) ? (
            <SuiDropdown.Item key={idx} {...item} />
          ) : (
            <SuiDropdown.Item key={idx} content={item} />
          )
        )}
      </SuiDropdown.Menu>
    </SuiDropdown>
  );
};

export default DropDown;
