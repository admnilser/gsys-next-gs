import React from "react";

import {
	useLookup,
	type Entity,
	type UseLookupProps,
	type UseLookupState,
} from "@next-gs/client";

export type EntityLookupProps<E extends Entity, R> = UseLookupProps<E, R> & {
	render: (props: UseLookupState<R>) => React.ReactNode;
};

export const EntityLookup = <E extends Entity, R>({
	render,
	...rest
}: EntityLookupProps<E, R>) => {
	const props = useLookup<E, R>(rest);

	const memoized = React.useMemo(
		() => (render ? render(props) : null),
		[render, props],
	);

	return memoized;
};
