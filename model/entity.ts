import { Resource } from "./resource";

export type EntityID = string | number;

export interface Entity extends Record<string, unknown> {
  id: EntityID;
}

export type EntityAttrib<E extends Entity> = keyof E | string;

export type EntityValues<E extends Entity> = Record<EntityAttrib<E>, unknown>;

export type EntityQueryWhereValue =
  | number
  | string
  | Record<"contains" | "endsWith" | "startsWith" | "mode", string>
  | null
  | undefined;

export type EntityQueryWhere<E extends Entity> =
  | {
      _term?: string;
      _filter?: EntityValues<E>;
    }
  | Record<EntityAttrib<E>, EntityQueryWhereValue>;

export type EntityQueryOrderBy<E extends Entity> = Record<
  EntityAttrib<E>,
  "asc" | "desc"
>;
export interface EntityQuery<E extends Entity> {
  where?: EntityQueryWhere<E>;
  orderBy?: EntityQueryOrderBy<E>;
  skip?: number;
  take?: number;
}

export type EntityActionParams<E extends Entity> =
  | EntityID
  | EntityQuery<E>
  | Partial<E>
  | undefined;

export interface EntityActionResult {
  error?: { code?: number; name?: string; message: string };
}

export type EntityAction<
  E extends Entity,
  P extends EntityActionParams<E>,
  R extends EntityActionResult
> = (params: P) => Promise<R>;

export interface EntityFindOneResult<E extends Entity>
  extends EntityActionResult {
  object?: E;
}

export type EntityFindOneAction<E extends Entity> = EntityAction<
  E,
  EntityID,
  EntityFindOneResult<E>
>;

export interface EntityFindManyResult<E extends Entity>
  extends EntityActionResult {
  data: E[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

export type EntityFindManyAction<E extends Entity> = EntityAction<
  E,
  EntityQuery<E>,
  EntityFindManyResult<E>
>;

export interface EntityPersistResult<E extends Entity>
  extends EntityActionResult {
  object?: E;
  errors?: Record<keyof E, string>;
}

export type EntityPersistAction<E extends Entity> = EntityAction<
  E,
  Partial<E>,
  EntityPersistResult<E>
>;

export interface EntityDestroyResult<E extends Entity>
  extends EntityActionResult {
  success: boolean;
  removed?: E;
}

export type EntityDestroyAction<E extends Entity> = EntityAction<
  E,
  EntityID,
  EntityDestroyResult<E>
>;

export interface EntityActions<E extends Entity> {
  persist: EntityPersistAction<E>;
  destroy: EntityDestroyAction<E>;
  findOne: EntityFindOneAction<E>;
  findMany: EntityFindManyAction<E>;
}

export type EntityServiceStateItem<E extends Entity> =
  | Partial<E>
  | null
  | undefined;

export interface EntityServicePager {
  page: number;
  pageSize: number;
  pageCount: number;
}

export type EntityFilter = Record<string, string>;

export interface EntityServiceState<E extends Entity> {
  item?: EntityServiceStateItem<E>;
  data: E[];
  total: number;
  ids: Record<string, E | undefined>;
  query?: EntityQuery<E>;
  pager: EntityServicePager;
  pending?: boolean;
}

export interface EntityService<E extends Entity>
  extends EntityActions<E>,
    EntityServiceState<E> {
  res: Resource<E>;
  select: (item: Partial<E> | null | undefined) => void;
  navigate: (
    pager: Partial<EntityServicePager>
  ) => Promise<EntityFindManyResult<E>>;
}
