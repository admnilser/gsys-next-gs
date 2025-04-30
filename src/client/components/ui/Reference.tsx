import React from "react";

import { Loader } from "@mantine/core";

import type { Entity, EntityID, ResourceRef } from "@next-gs/client";

import { useReference } from "@next-gs/client/hooks/useReference";

import fn from "@next-gs/utils/funcs";

export type ReferenceRenderProps = { text: string; loading: boolean };

export type ReferenceProps<E extends Entity> = {
	resource: ResourceRef<E>;
	value?: EntityID;
	txtAttr?: keyof E;
	render?: (props: ReferenceRenderProps) => React.ReactNode;
};

export const Reference = <E extends Entity>({
	resource,
	value,
	txtAttr,
	render,
}: ReferenceProps<E>) => {
	const { reference = null, loading = false } = useReference<E>(
		resource,
		value,
	);

	return React.useMemo(() => {
		const text = txtAttr ? (fn.get(reference, [txtAttr], "") as string) : "";
		return render ? (
			render({ text, loading })
		) : loading ? (
			<Loader size="mini" />
		) : (
			text
		);
	}, [reference, loading, render, txtAttr]);
};
