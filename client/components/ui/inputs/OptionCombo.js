import React from "react";

import Options from "./Options";

import { Combo } from "./Combo";

const OptionCombo = (props) => (
  <Options render={(comboProps) => <Combo {...comboProps} />} {...props} />
);

export default OptionCombo;
