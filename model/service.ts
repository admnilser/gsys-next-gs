"use client";

import React from "react";

import {
  Entity,
  EntityActions,
  EntityDestroyAction,
  EntityFindManyAction,
  EntityFindOneAction,
  EntityID,
  EntityPersistAction,
  EntityService,
  EntityServicePager,
  EntityServiceState,
} from "./entity";

import { Resource } from "./resource";

import _ from "../utils/lodash";
import { useReplace } from "../hooks/useReplace";

const emptyState = {
  data: [],
  total: 0,
  ids: {},
  pager: { page: 1, pageSize: 10, pageCount: 0 },
};

export type ServerActions = Record<string, unknown>;

let serverActions: ServerActions;

export function registerEntityActions(actions: ServerActions) {
  serverActions = actions;
}

export function useEntityService<E extends Entity>(res: Resource<E>) {
  const [state, { replace }] = useReplace<EntityServiceState<E>>(emptyState);

  const actions = React.useMemo(
    () =>
      ({
        findOne: serverActions[`${res.name}FindOne`],
        findMany: serverActions[`${res.name}FindMany`],
        persist: serverActions[`${res.name}Persist`],
        destroy: serverActions[`${res.name}Destroy`],
      } as EntityActions<E>),
    []
  );

  const setPending = (pending: boolean) => replace((s) => ({ ...s, pending }));

  const replaceDataItem = (
    id: EntityID | undefined,
    item: Partial<E> | undefined
  ) => {
    const { data, ids } = state;

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

  const findOne: EntityFindOneAction<E> = async (id) => {
    setPending(true);
    try {
      return await actions.findMany({ where: { id } });
    } finally {
      setPending(false);
    }
  };

  const findMany: EntityFindManyAction<E> = async (query) => {
    replace((s) => ({
      ...s,
      query: { ...(s.query || {}), ...(query || {}) },
      pending: true,
    }));

    try {
      const resp = await actions.findMany(query);

      const { data, total, page, pageSize, pageCount } = resp;

      replace((s) => ({
        ...s,
        data,
        total,
        ids: _.keyBy(data, "id"),
        pager: { page, pageSize, pageCount },
        pending: false,
      }));

      return resp;
    } catch (error) {
      setPending(false);
      throw error;
    }
  };

  const persist: EntityPersistAction<E> = async (data) => {
    const undo = replaceDataItem(data.id, data as E);
    try {
      const resp = await actions.persist(data);
      if (resp.error) {
        undo();
      } else {
        setPending(false);
      }
      return resp;
    } catch (error) {
      undo();
      throw error;
    }
  };

  const destroy: EntityDestroyAction<E> = async (id) => {
    const undo = replaceDataItem(id, undefined);

    try {
      const resp = await actions.destroy(id);
      if (!resp.success) {
        undo();
      } else {
        setPending(false);
      }
      return resp;
    } catch (error) {
      undo();
      throw error;
    }
  };

  const select = (item: Partial<E> | null | undefined) => {
    replace((s) => ({ ...s, item }));
  };

  const navigate = (pager: Partial<EntityServicePager>) => {
    const { page = 1, pageSize = 10 } = state.pager || pager;

    return findMany({ skip: (page - 1) * pageSize, take: pageSize });
  };

  return {
    res,
    ...state,
    findMany,
    findOne,
    persist,
    destroy,
    navigate,
    select,
  } as EntityService<E>;
}
