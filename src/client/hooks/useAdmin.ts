import React from "react";

import { AdminContext, type AdminContextState } from "@next-gs/client/context/admin";

export function useAdmin() {
	return React.useContext(AdminContext) as AdminContextState;
}
