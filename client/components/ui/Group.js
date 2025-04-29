import React from "react";

import { Grid } from "semantic-ui-react";

import _ from "utils";

const Group = ({ widths, children }) => (
  <Grid.Column {..._.suiWidths(widths)}>
    <Grid>{children}</Grid>
  </Grid.Column>
);

export default Group;
