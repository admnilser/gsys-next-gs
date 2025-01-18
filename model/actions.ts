"use server";

import _ from "../utils/lodash";

import prisma, { repository } from "../utils/prisma";

import {
  Entity,
  EntityActions,
  EntityID,
  EntityQuery,
  EntityQueryWhere,
} from "./entity";

import { Resource } from "./resource";

function parseError(e: unknown) {
  if (e instanceof Error) return { message: e.message };
  return { message: _.toString(e) };
}

export async function createEntityActions<E extends Entity>(res: Resource<E>) {
  const repo = repository<EntityID, E>(res.name);

  const parseWhere = (where: EntityQueryWhere<E>) => {
    const { _term, _filter, ...w } = where;

    function putWhere(key: string, val: unknown) {
      const path = _.split(key, "-");
      _.set(w, path, val);
      if (path[1] === "contains") {
        _.set(w, [path[0], "mode"], "insensitive");
      }
    }

    if (_filter) {
      _.forEach(_filter, (val, key) => putWhere(key, val));
    }

    if (_term) {
      _.forEach(res.termFields || [res.nameField], (f) =>
        putWhere(f + "-contains", _term)
      );
    }

    return w;
  };

  const findMany = async (query: EntityQuery<E> = {}) => {
    try {
      const { where = {}, take = 10, skip = 0, orderBy } = query;

      const findWhere = parseWhere(where);

      const [total, data] = await prisma.$transaction([
        repo.count({ where: findWhere }),
        repo.findMany({ where: findWhere, skip, take, orderBy }),
      ]);

      const page = skip / take + 1;
      const pageSize = take;
      const pageCount =
        pageSize > 0 && pageSize < total ? Math.ceil(total / pageSize) : 1;

      return {
        data,
        total,
        page,
        pageSize,
        pageCount,
      };
    } catch (error) {
      return {
        data: [],
        total: 0,
        page: 1,
        pageSize: 0,
        pageCount: 1,
        error: parseError(error),
      };
    }
  };

  const findOne = async (id: EntityID) => {
    try {
      const object = await repo.findUnique({ where: { id } });
      return { object };
    } catch (error) {
      return { error: parseError(error) };
    }
  };

  const persist = async (data: Partial<E>) => {
    try {
      const id = data.id;

      const { parsed, errors } = res.parse(data);

      if (errors) {
        return { errors, error: parseError("Dados inválidos") };
      } else if (parsed) {
        let object;

        if (id !== undefined) {
          object = await repo.update({ where: { id }, data: parsed });
        } else {
          object = await repo.create({ data: parsed });
        }

        return { object };
      } else {
        return { object: data, error: parseError("Dados Inválidos") };
      }
    } catch (error) {
      return { error: parseError(error) };
    }
  };

  const destroy = async (id: EntityID) => {
    try {
      const removed = await repo.findUnique({ where: { id } });

      if (removed) await repo.delete({ where: { id } });

      return { success: Boolean(removed), removed };
    } catch (error) {
      return { success: false, error: parseError(error) };
    }
  };

  return { findMany, findOne, persist, destroy } as EntityActions<E>;
}
