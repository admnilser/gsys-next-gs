"use client"

import { useShallowEffect } from "@mantine/hooks";

import { useGetList } from "./useData";

import type {
	Entity,
	QuerySortBy,
	QueryWhere,
	ResourceRef,
} from "@next-gs/client";

import fn from "@next-gs/utils/funcs";

export interface UseLookupProps<E extends Entity, R> {
	autoFetch?: boolean;
	resource: ResourceRef<E>;
	filter?: QueryWhere;
	sortBy?: QuerySortBy<E>;
	converter: (entity: E) => R;
}

export interface UseLookupState<R> {
	loading: boolean;
	items: R[];
	fetchData: (where?: QueryWhere) => Promise<R[]>;
}

export function useLookup<E extends Entity, R>({
	autoFetch = true,
	resource,
	filter,
	sortBy,
	converter,
	...rest
}: UseLookupProps<E, R>) {

	const [request, { loading, data: items }] = useGetList<E, R[]>(
		resource,
		[],
	);

	const fetchData = async (where?: QueryWhere) => {
		try {
			return await request({
				where: fn.assign({}, where, filter),
				sort: sortBy,
				success: (data) => data.map(
					(e) => (converter?.(e) || e) as R
				)
			});
		} catch {
			return [];
		}
	};

	useShallowEffect(() => {
		if (!autoFetch) fetchData();
	}, [autoFetch, filter, sortBy]);

	return {
		loading,
		items,
		fetchData,
		...rest
	} as UseLookupState<R>;
}

export default useLookup;
