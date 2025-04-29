import type { DefaultSession } from "next-auth";

export type AuthUser = (DefaultSession["user"] & {
	id: string; roles: Record<string, string>
}) | null;

export type Awaitable<T> = T | Promise<T>;

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export interface ResourceParseResult<T> {
	parsed?: Partial<T>;
	errors?: Record<keyof T, string>;
}

export interface ResourceTitle {
	simple: string;
	plural: string;
}

export type ResourceRules = Record<
	"read" | "create" | "update" | "delete" | "manage" | "all",
	string
>;

export interface Resource<E extends Entity> {
	name: string;
	title: {
		simple: string;
		plural: string;
	};
	role?: string;
	nameField: string;
	nodeField?: string;
	query?: Partial<Query<E>>;
	onSelect?: <D = E | E[]>(data: D) => D;
	handlePersist?: (
		data: Partial<E>,
		admin: AdminActions,
	) => Promise<RepoPersistResult<E>>;
	handleDestroy?: (
		id: EntityID,
		admin: AdminActions,
	) => Promise<RepoDestroyResult<E>>;
}

export type ResourceRef<E extends Entity> = string | Resource<E>;

export type Nullable<T> = T | null;

export type DataValue = Nullable<string | number | boolean | Date>;

export type JsonValue = DataValue | object | undefined;
export type JsonDate = Omit<JsonValue, "boolean">;

export type EntityID = string | number;

export interface Entity extends TableRow<JsonValue> {
	id?: EntityID;
	$master?: Entity;
	$more?: Partial<Entity>;
}

export type QueryWhere = Record<string, JsonValue | JsonValue[]> & {
	_q?: string;
};

export type QuerySortBy<E extends Entity> = Record<keyof E, "asc" | "desc">;

export interface Query<E extends Entity> {
	where?: QueryWhere;
	sort?: QuerySortBy<E>;
	skip?: number;
	take?: number;
	full?: boolean;
}

export type Dictionary<T> = Record<string, T>;

export interface UpdaterOptions {
	match?: string;
	upsert?: boolean;
};

export interface UpdaterState<E extends Partial<Entity>> {
	oldData: E;
	newData: E;
	mixData: E;
	allData: E;
};

export interface TableRow<T = DataValue> {
	[key: string]: T;
}

export type ResourceTreeNode = Record<string, EntityID>;

export interface ResourceState<E extends Entity> {
	data: E[];
	keys: EntityID[];
	recs: Record<EntityID, E | undefined>;
	total: number;
	item: E | null | undefined;
	pending: boolean;
	error: Error | string | unknown | null | undefined;
	query: Query<E>;
	marks: string[];
	tree: {
		node: Record<"root" | string, ResourceTreeNode>;
		open: Record<string, boolean>;
	};
};

//**** Admin types *****/

export interface RepoActionResult {
	error?: { code?: string; name?: string; message: string };
};

// FindOneAction
export type RepoFindOneResult<E extends Entity> = RepoActionResult & {
	object?: E;
};

export type RepoFindOneAction<E extends Entity> = (
	id: string,
) => Promise<RepoFindOneResult<E>>;

// FindManyAction
export interface RepoFindManyResult<E extends Entity> extends RepoActionResult {
	data: E[];
	total: number;
	page: number;
	pageSize: number;
	pageCount: number;
};

export type RepoFindManyParams<E extends Entity> = Partial<Query<E>>;

export type AdminFindManyAction<E extends Entity> = (
	query: RepoFindManyParams<E>,
) => Promise<RepoFindManyResult<E>>;


// PersistAction
export interface RepoPersistResult<E extends Entity> extends RepoActionResult {
	object?: E | E[];
	errors?: Dictionary<string>;
};

export type RepoPersistParams<E extends Entity> = E | E[];

export type RepoPersistAction<E extends Entity> = (
	data: RepoPersistParams<E>,
) => Promise<RepoPersistResult<E>>;

// DestroyAction
export interface RepoDestroyResult<E extends Entity> extends RepoActionResult {
	id?: string;
	removed?: E;
	success: boolean;
};

export type RepoDestroyParams = EntityID | EntityID[];

export type RepoDestroyAction<E extends Entity> = (
	ids: RepoDestroyParams,
) => Promise<RepoDestroyResult<E>>;

export type AdminActions = {
	getList: <E extends Entity, R>(
		res: string,
		qry: Query<E>,
	) => Promise<RepoFindManyResult<E>>;
	getOne: <E extends Entity>(
		res: string,
		id: EntityID,
	) => Promise<RepoFindOneResult<E>>;
	getMany: <E extends Entity>(
		res: string,
		ids: EntityID[],
	) => Promise<RepoFindManyResult<E>>;
	persist: <E extends Entity>(
		res: string,
		data: RepoPersistParams<E>,
	) => Promise<RepoPersistResult<E>>;
	destroy: <E extends Entity>(
		res: string,
		ids: RepoDestroyParams,
	) => Promise<RepoDestroyResult<E>>;
	execute: <R extends RepoActionResult>(res: string, method: string, args: string[]) => Promise<R>;
};

export class AdminError extends Error {
	constructor(error: RepoActionResult["error"]) {
		super(error?.message);
		this.name = error?.name || "AdminError";
	}
}

export interface ResServicePager {
	page: number;
	pageSize: number;
	pageCount: number;
};

export interface ResServiceRefreshParams<E extends Entity> extends Partial<Query<E>> {
	nodeKey?: EntityID;
};

export type ResServiceRefreshResult<E extends Entity> = Pick<
	ResourceState<E>,
	"data" | "keys" | "recs" | "total" | "tree"
>;

export type ResServiceNavigateParams = Partial<ResServicePager>;

export interface ResourceService<E extends Entity> extends ResourceState<E> {
	res: Resource<E>;
	pager: ResServicePager;
	select: (entity?: Partial<E>) => Promise<E>;
	persist: (value: RepoPersistParams<E>) => Promise<RepoPersistResult<E>>;
	refresh: (
		query?: ResServiceRefreshParams<E>,
	) => Promise<ResServiceRefreshResult<E>>;
	navigate: (
		pager: ResServiceNavigateParams,
	) => Promise<ResServiceRefreshResult<E>>;
	destroy: (ids: EntityID[]) => Promise<RepoDestroyResult<E>[]>;
};
