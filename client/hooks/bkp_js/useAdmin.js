"use client";

import React from "react";

import _ from "@next-gs/utils/funcs";

import { AdminError } from "@next-gs/client";

import type {
	AdminActions,
	AdminDestroyAction,
	AdminDestroyResult,
	AdminFindManyAction,
	AdminFindManyResult,
	AdminPager,
	AdminPersistAction,
	AdminPersistResult,
	AdminFindOneAction,
	AdminFindOneResult,
	AdminState,
	Entity,
	Resource,
	AdminActionResult,
} from "@next-gs/client";

const emptyState = {
	data: [],
	total: 0,
	ids: {},
	pager: { page: 1, pageSize: 10, pageCount: 0 },
};

export function useRepository<E extends Entity>(resource: Resource) {


	resource: Resource,
	const res = resource.name;
  `admin/${res}`
	useApi<AdminState<E>, emptyState);

	const replaceDataItem = (
		id: string | undefined,
		item: Partial<E> | undefined,
	) => {
		const { data, ids } = getState();

		const hasId = _.notNil(id);
		const idx = hasId ? _.findIndex(data, ["id", id]) : -1;

		if (idx > -1) {
			data.splice(idx, 1, item as E);
		} else {
			data.push(item as E);
		}

		if (id !== undefined) {
			ids[id] = item as E;
		}

		return replace((s) => ({
			...s,
			data: [...data],
			ids: { ...ids },
			pending: true,
		}));
	};

	const findOne: AdminFindOneAction<E> = async (id) => {
		setPending(true);
		try {
			const resp = await api.get<AdminFindOneResult<E>>({ _id: id, _f: true });
			if (resp.error) {
				throw new AdminError(resp.error);
			}
			return resp;
		} catch (error) {
			notify.error(error as Error);
			throw error;
		} finally {
			setPending(false);
		}
	};

	const findMany: AdminFindManyAction<E> = async (params) => {
		const query = _.assign({}, getState().query, params);

		setPending(true);
		try {
			const resp = await api.get<AdminFindManyResult<E>>({ _q: query });

			if (resp.error) {
				throw new AdminError(resp.error);
			}

			const { data, total } = resp;

			const pageSize = query.take || 20;

			replace({
				data,
				ids: _.keyBy(data, "id"),
				total,
				query,
				pager: {
					page: Math.floor((query.skip || 0) / pageSize) + 1,
					pageSize,
					pageCount: Math.ceil(total / pageSize),
				},
				pending: false,
			});

			return resp;
		} catch (error) {
			notify.error(error as Error);
			throw error;
		} finally {
			setPending(false);
		}
	};

	const persist: AdminPersistAction<E> = async ({ data }) => {
		return data as AdminPersistResult<E>;
		/*const undo = replaceDataItem(data.id, data);
    try {
      const resp = await api.post<E, AdminPersistResult<E>>(data);

      if (resp.error) {
        throw new ModelServiceError(resp.error);
      }

      notify.info(`${resource.title.simple} salvo com sucesso!`);
      setPending(false);

      return resp;
    } catch (error) {
      notify.error(error as Error);
      undo();
      throw error;
    }*/
	};

	const destroy: AdminDestroyAction<E> = async (id) => {
		return { id } as AdminDestroyResult<E>;
		/*const undo = replaceDataItem(id, undefined);
    try {
      const resp = await actions.destroy(repo, res, id);
      if (resp.error) {
        throw new ModelServiceError(resp.error);
      }

      if (resp.success) {
        notify.info(`${resource.title.simple} removido com sucesso!`);
        setPending(false);
      }

      return resp;
    } catch (error) {
      notify.error(error as Error);
      undo();
      throw error;
    }*/
	};

	const select = (item: Partial<E> | null | undefined) => {
		replace((s) => ({ ...s, item }));
	};

	const navigate = (pager: Partial<AdminPager>) => {
		const { page = 1, pageSize = 10 } = Object.assign(
			{},
			getState().pager,
			pager,
		);

		return findMany({ skip: (page - 1) * pageSize, take: pageSize });
	};

	React.useEffect(() => {
		findMany(); //load data
	}, []);

	return {
		res: resource,
		...getState(),
		findOne,
		findMany,
		persist,
		destroy,
		navigate,
		select,
	} satisfies AdminActions<E>;
}*/
