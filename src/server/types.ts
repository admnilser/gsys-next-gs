/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Knex } from "../utils/knex";

import type { UserCredentials, User } from "./auth";

import type {
	Dictionary,
	Entity,
	JsonValue,
	QuerySortBy,
	TableRow,
} from "@next-gs/client";

export type TablePrimary = string | string[];

export type TableFields = Dictionary<Field>;

export type QueryBuilder = Knex.QueryBuilder;

export type QueryBuilderOptions<R = TableRow, E = Entity> = {
	onCalculate?: (row: R) => E | undefined;
};

export enum FieldType {
	Text = 0,
	Number = 1,
	Boolean = 2,
	Date = 3,
	Time = 4,
	DateTime = 5,
	Image = 6,
	Blob = 7,
	Detail = 8,
	Object = 9,
	ObjectText = 10,
	ObjectJson = 11,
}

export type FieldFormatFunc = (value: JsonValue) => JsonValue;

export interface Field {
	type: FieldType;
	label?: string;
	fixed?: JsonValue;
	readOnly?: boolean;
	lookup?: boolean;
	hidden?: boolean;
	alias?: string;
	initial?: JsonValue | "now" | "user_owner" | "user_id";
	format?: FieldFormatFunc | FieldFormatFunc[];
}

export interface RelationField<E extends Entity> {
	ref?: ModelReference;
	model?: IModel;
	relation?: Dictionary<string>;
	raw?: ((data: E[]) => Promise<E>) | string;
	update?: boolean | "upsert";
}

export interface LookupField<E extends Entity> extends RelationField<E> {
	lkpAlias?: string;
	lkpName?: string;
	lkpJoin?:
	| string
	| ((a1: string, a2: string) => string)
	| [QueryBuilder, string, string];
	lkpCols?: string[] | Dictionary<string>;
}

export interface DetailField<M extends Entity, D extends Entity>
	extends RelationField<D> {
	sorter?: QuerySortBy<D>;
	format?: (data: D[]) => Promise<D> | D;
	onUpdate?: (
		mst: Partial<M>,
		dtl: Partial<D>,
		idx: number,
	) => Promise<D> | D | null;
}

export interface TableMeta<
	E extends Entity = Entity,
	R extends TableRow = TableRow,
> extends QueryBuilderOptions<R, E> {
	name: string;
	fields: TableFields;
	primary?: TablePrimary;
	queryFields?: Dictionary<"#" | "%" | "=">;
	lookupFields?: Dictionary<LookupField<Entity>>;
	detailFields?: Dictionary<DetailField<Entity, Entity>>;
	computeFields?: ((rec: R) => Promise<E>) | Dictionary<(rec: E) => Promise<E>>;
	deleteField?: string | false;
	ownerField?: string;
	join?: {
		pk: TablePrimary;
		pkPath: string;
		fk: TablePrimary;
		fkPath: string;
	};
}

export interface IRepository {
	user?: User;
	shop?: number;
}

export interface IModel { repo: IRepository }

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type ModelConstructor = new (arg: any) => IModel;

export type ModelReference = string | ModelConstructor;

export type StorableUser = Pick<User, "name" | "email" | "image" | "pswd">;

export interface RepoConfig<U extends User> {
	createModel: (ref: ModelReference) => IModel;
	initialize: (name: string) => Promise<void>;
	evaluate: (expr: string, def?: JsonValue) => JsonValue;
	generateId: (gen: string) => Promise<number>;
	storeBlob: (blob: string) => JsonValue;
	checkUser: (args: string | UserCredentials) => Promise<U | null>;
	storeUser: (user: StorableUser) => Promise<U | null>;
}
