import React from "react";

import { useSelector, useDispatch } from "react-redux";

import {
	resReducer,
	updateData,
	updateDataItem,
	type ResState,
} from "@next-gs/utils/store/res";

import fn from "@next-gs/utils/funcs";

import notify from "@next-gs/utils/notify";

import {
	AdminError,
	type Entity,
	type EntityID,
	type RepoPersistParams,
	type RepoActionResult,
	type RepoDestroyResult,
	type Resource,
	type ResourceRef,
	type ResourceService,
	type ResourceState,
	type ResServicePager,
	type ResServiceRefreshParams,
	type ResServiceRefreshResult,
} from "@next-gs/client";

import { useAdmin } from "./useAdmin";

import { useAuth } from "./useAuth";

type ResStoreSelector<E extends Entity> = (
	callback: (state: { res: ResState }) => ResourceState<E>,
) => ResourceState<E>;

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
type ResStoreDispatch = React.ActionDispatch<any>;

type ResStore<E extends Entity> = {
	resource: Resource<E>;
	state: ResourceState<E>;
	mutators: {
		updateData: (data: Partial<ResourceState<E>>) => void;
		updateDataItem: (item: Partial<E>, free?: boolean, index?: number) => void;
	};
};

function checkResponse(resp: RepoActionResult) {
	if (resp.error) throw new AdminError(resp.error);
}

const createResStore = <E extends Entity>(
	ref: ResourceRef<E>,
	selector: ResStoreSelector<E>,
	dispatch: ResStoreDispatch,
) => {
	const { getResource } = useAdmin();

	const resource = getResource(ref);

	if (!resource) {
		throw new Error(`Resource reference "${ref}" not found`)
	}

	const state = selector(({ res }) => {
		const {
			data = [],
			keys = [],
			recs = {},
			total = 0,
			query = {},
			marks = [],
			pending = false,
			error,
			tree = { node: {}, open: {} },
			item = null,
		} = fn.get(res, [resource.name], {}) as ResourceState<E>;

		const {
			where = resource.query?.where,
			sort = resource.query?.sort,
			skip = 0,
			take = 20,
		} = query;

		const { node = {}, open = {} } = tree;

		/*auth.getPref("list_pgsize", 10)

		if (page.current > 0) {
			if (fn.isNoU(page.size)) {
				page.size = ;
			}
			if (page.size > state.list.page.size) {
				page.current = 1;
			}
		}*/

		return {
			data,
			keys,
			recs,
			total,
			pending,
			error,
			tree: { node, open },
			item,
			query: {
				where,
				sort,
				skip,
				take,
			},
			marks,
		} satisfies ResourceState<E>;
	});

	return {
		resource,
		state,
		mutators: {
			updateData: (data: Partial<ResourceState<E>>) =>
				dispatch(
					updateData({
						res: resource.name,
						data: data as Partial<ResourceState<Entity>>,
					}),
				),
			updateDataItem: (item: Partial<E>, free?: boolean, index?: number) =>
				dispatch(
					updateDataItem({ res: resource.name, data: { item, free, index } }),
				),
		},
	} as ResStore<E>;
};

export const useResStore = <E extends Entity>(store: ResStore<E>) => {
	const { resource, state, mutators } = store;
	const res = resource.name;

	const { actions: admin } = useAdmin();

	const auth = useAuth();

	const checkAction = (action: string) => {
		const allows = auth.hasRole(resource.role || `TBL${res}`, action);

		if (!allows)
			notify.error("Você não possui permissão para executar esta ação!");

		return allows;
	};

	const handleError = (error: Error | string) => {
		notify.error(error);
		return Promise.reject(error);
	};

	const refresh = async (params: ResServiceRefreshParams<E>) => {
		const { nodeKey, ...query } = { ...state.query, ...params };

		if (fn.notNil(query.take)) {
			auth.setPref("list_pgsize", query.take);
		}

		mutators.updateData({
			query: query,
			error: null,
			pending: true,
		});

		const { nodeField } = resource;

		if (nodeField && fn.notNil(nodeKey)) {
			fn.set(query, ["where", nodeField], nodeKey);
		}

		/* fn.clean({ ...list.filter, ...fetchFilter });
		const { listFilter } = state.meta;
		if (listFilter)
			filter = fn.isFunction(listFilter)
				? listFilter(filter)
				: fn.assign(filter, listFilter);*/

		return await admin
			.getList<E, E>(res, query)
			.then((resp) => {
				checkResponse(resp);

				const data = {
					data: resp.data,
					keys: fn.map(resp.data, "id") as string[],
					recs: fn.keyBy(resp.data, "id"),
					total: resp.total,
					tree: { node: {}, open: {} },
				} as ResServiceRefreshResult<E>;

				/*if (nodeKey) {
				node = { ...state.tree.node, [nodeKey]: data.ids };
				open = { ...state.tree.open, [nodeKey]: data.ids.length > 0 };
			} else {
				const root = [];

				fn.forEach(data.recs, (rec) => {
					const k = rec[nodeField];

					if (fn.isNoU(k) || fn.isNil(recs[k])) {
						if (!root.includes(k)) root.push(k);
					}

					if (node[k] === undefined) {
						node[k] = [];
						open[k] = true;
					}

					node[k].push(rec.id);
				});

				node["root"] = root;
			}*/

				mutators.updateData({
					...data,
					error: null,
					pending: false,
				});

				return data;
			})
			.catch((error) => {
				mutators.updateData({ error, pending: false });
				return handleError(error);
			});
	};

	const replace = <I extends Partial<E> | undefined>(
		item: I | I[],
		free?: boolean,
		index?: number,
	) => {
		if (!item) return;

		const updater = (obj: I) => {
			if (!obj) return;

			const { id } = obj;

			const previous = id ? (state.recs[id] as E) : undefined;

			id && mutators.updateDataItem(obj, free, index);

			return previous;
		};

		return fn.isArray(item) ? fn.map(item, updater) : updater(item);
	};

	const refreshItem = (id: EntityID) =>
		admin
			.getList<E, E>(res, { where: { id } })
			.then(({ data }) => replace(data[0]))
			.catch(handleError);

	const select = async (entity?: E) => {
		mutators.updateData({ item: entity });

		if (fn.notNil(entity?.id)) {
			mutators.updateData({ pending: true });
			return await admin
				.getOne<E>(res, entity.id)
				.then(({ object }) => {
					const item = resource.onSelect?.(object) || object;
					mutators.updateData({ item, pending: false, error: undefined });
					return item;
				})
				.catch((error) => {
					mutators.updateData({ item: undefined, pending: false, error });
					return handleError(error);
				});
		}
	};

	const persist = async (value: RepoPersistParams<E>) => {
		const previous = replace(value);
		try {
			const resp = await admin.persist<E>(res, value);

			checkResponse(resp);

			if (resp.object) {
				replace(resp.object);

				notify.info(`${resource.title.simple} salvo(a) com sucesso!`);

				return resp;
			}
		} catch (error) {
			if (previous) replace(previous);
			handleError(error as Error);
		}
	};

	const destroy = async (ids: EntityID[]) => {
		if (!checkAction("D")) {
			throw new Error("Usuário não Autorizado!");
		}

		const { handleDestroy } = resource;

		const destroyOne: (id: EntityID) => Promise<RepoDestroyResult<E>> = async (
			id,
		) => {
			if (handleDestroy) {
				return await handleDestroy(id, admin);
			}

			const index = fn.indexOf(state.keys, id);

			const previous = replace({ id } as E, true);

			return await admin.destroy<E>(res, id).catch((error) => {
				replace(previous, false, index);
				return Promise.reject(error);
			});
		};

		return await Promise.all(
			ids.map((id) => destroyOne(id).catch(handleError)),
		);
	};

	const navigate = ({ page = 1, pageSize = 20 }: Partial<ResServicePager>) =>
		refresh({ skip: page * pageSize, take: pageSize });

	const {
		total,
		query: { skip = 0, take = 20 },
	} = state;

	return {
		res: resource,
		...state,
		pager: {
			page: take > 0 ? Math.floor(skip / take) + 1 : 1,
			pageCount: Math.ceil(total / take),
			pageSize: take,
		},
		select,
		navigate,
		refresh,
		persist,
		destroy,
	} as ResourceService<E>;
};

export const useStoreResource = <E extends Entity>(ref: ResourceRef<E>) => {
	const dispatch = useDispatch();

	const store = createResStore(ref, useSelector, dispatch);

	return useResStore(store);
};

export const useSimpleResource = <E extends Entity>(ref: ResourceRef<E>) => {
	const [state, dispatch] = React.useReducer(resReducer, {});

	const store = createResStore(
		ref,
		(callback) => callback({ res: state }),
		dispatch,
	);

	return useResStore(store);
};
