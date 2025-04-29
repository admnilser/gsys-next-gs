"use client";

import React from "react";

import type {
	AdminActions,
	RepoFindManyParams,
	RepoPersistParams,
	Entity,
	EntityID,
	ResourceRef,
	Query,
	RepoActionResult,
} from "@next-gs/client";

import fn from "@next-gs/utils/funcs";

import notify from "@next-gs/utils/notify";

import { useAdmin } from "./useAdmin";
import { useShallowEffect } from "@mantine/hooks";

export type DataState<D> = {
	data: D;
	loading?: boolean;
	loaded?: boolean;
	error?: unknown;
};

export function useData<E extends Entity, P, S>(
	resRef: ResourceRef<E>,
	promise: (res: string, admin: AdminActions, params: P) => Promise<S>,
	initial: S,
	params?: P,
) {
	const { actions: admin, getResource } = useAdmin();

	const res = getResource(resRef);

	const [state, setState] = React.useState<DataState<S>>({ data: initial });

	const trigger = async (params: P) => {
		let data = state.data;
		setState({ data, loading: true, loaded: false });
		try {
			data = (await promise(res.name, admin, params)) || initial;
			setState({ data, loading: false, loaded: true });
			return data;
		} catch (error) {
			setState({ data, loading: false, loaded: false, error });
			throw error;
		}
	};

	useShallowEffect(() => {
		console.log("useData shallow effect", params);
		if (params) trigger(params);
	}, [params]);

	return [trigger, state, (data: S) => setState({ data })] as const;
}

export const useGetOne = <E extends Entity>(
	ref: ResourceRef<E>,
	initial?: EntityID,
) =>
	useData<E, EntityID, E | null>(
		ref,
		(res, admin, id) =>
			admin.getOne<E>(res, id).then(({ object }) => object || null),
		null,
		initial,
	);

export const useGetMany = <E extends Entity>(ref: ResourceRef<E>) =>
	useData<E, EntityID[], E[]>(
		ref,
		(res, admin, ids) => admin.getMany<E>(res, ids).then(({ data }) => data),
		[],
	);

export type UseGetListParams<E extends Entity, R> = Query<E> & {
	keyByIds?: boolean;
	success?: (data: E[]) => R;
	failure?: (error: unknown) => void;
};

export const useGetList = <E extends Entity, R>(
	ref: ResourceRef<E>,
	initial: R,
	params?: UseGetListParams<E, R>,
) =>
	useData<E, UseGetListParams<E, R>, R>(
		ref,
		async (res, admin, { keyByIds, success, failure, ...opts }) => {
			const ret = await admin.getList<E, R>(res, opts)
				.then(({ data }) => success?.(data) || data)
				.catch((error) => Promise.reject(failure?.(error) || error));

			if (keyByIds) {
				return fn.keyBy(ret, "id") as R;
			}

			return ret as R;
		},
		initial,
		params,
	);

export const useUpdate = <E extends Entity>(ref: ResourceRef<E>) =>
	useData<E, RepoPersistParams<E>, E | E[] | null>(
		ref,
		(res, admin, item) =>
			admin.persist<E>(res, item).then(({ object }) => object || null),
		null,
	);

export const useDelete = <E extends Entity>(ref: ResourceRef<E>) =>
	useData<E, EntityID, E | null>(
		ref,
		(res, admin, id) =>
			admin.destroy<E>(res, id).then(({ removed }) => removed || null),
		null,
	);

export const useMethod = <E extends Entity, R extends RepoActionResult>(
	ref: ResourceRef<E>,
	method: string,
) =>
	useData<E, string[], R>(
		ref,
		(res, admin, args) => admin.execute(res, method, args),
		{} as R,
	);

export const useEntity = <E extends Entity>(ref: ResourceRef<E>) => {
	const [
		getEntity,
		{
			data: [entity] = [],
		},
		setEntity,
	] = useGetList<E, E[]>(ref, []);

	const [updEntity, { loading }] = useUpdate<E>(ref);

	return [
		{ entity, loading },
		async (query: RepoFindManyParams<E>, onData: (data: E) => E) => {
			const data = await getEntity({
				...query,
				skip: 0,
				take: 1,
			});

			const item = data?.[0] || null;

			if (!item) return null;

			return onData ? onData(item) : item;
		},
		(item: E) => setEntity([item]),
		async (data: RepoPersistParams<E>, reset: boolean) => {
			updEntity(data || entity).then((saved) => {
				if (reset) {
					setEntity([]);
				} else {
					setEntity(!saved ? [] : fn.isArray(saved) ? saved : [saved]);
				}
				notify.info("Registro atualizado com sucesso!");
			});
		},
	];
};

export type UseEntityListParams<E extends Entity, R> = UseGetListParams<E, R> & {
	converter: (entity: E) => R;
};

export interface IndexedEntity extends Entity {
	index: number;
	modified: boolean;
}

export const useEntityList = <E extends IndexedEntity>(
	ref: ResourceRef<E>,
	{ converter, ...params }: UseEntityListParams<E, E>,
) => {
	const toEntities = (data: E | E[]) =>
		fn.isArray(data)
			? converter
				? fn.map(data, converter)
				: data
			: converter
				? [converter(data)]
				: [data];

	const [
		getter,
		{ loading: getting, error: getError, data: entities },
		setEntities,
	] = useGetList<E, E[]>(ref, [], {
		...params,
		success: toEntities,
	});

	const [update, { loading: updating, error: updError }] = useUpdate(ref);

	return {
		entities,
		getting,
		getError,
		addEntity: (item: E) =>
			update(item).then((saved) => {
				if (!saved) return entities;

				const data = [...toEntities(saved), ...entities];
				setEntities(data);
				return data;
			}),
		updEntity: (index: number, saved: E) => {
			const data = [...entities];
			data[index] = { ...saved, modified: true };
			setEntities(data);
			return saved;
		},
		submitUpdates: () => {
			const data = fn.map(entities, (entity, index) => {
				entity.index = index;
				return entity;
			});

			const items = fn.filter(data, { modified: true }) as RepoPersistParams<E>;

			return fn.notEmpty(items)
				? update(items).then((saved) => {
					fn.forEach(saved, (item) => {
						const { index, modified, ...entity } = item as IndexedEntity
						data[index] = entity as E;
					});
					setEntities(data);
				}) : null;
		},
		updating,
		updError,
	};
};
