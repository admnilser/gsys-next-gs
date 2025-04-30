import React from "react";

import { useGetMany } from "./useData";

import type { Entity, EntityID, ResourceRef } from "@next-gs/client";

import fn from "@next-gs/utils/funcs";

export function useReference<E extends Entity>(res: ResourceRef<E>, id?: EntityID) {
	const [getReference, { data: [reference], loading }] = useGetMany(res);

	React.useEffect(() => {
		fn.notNil(id) && getReference([id]);
	}, [id]);

	return { reference, loading };
}
