import knex, { Knex } from "knex";

import _ from "./funcs";

import type { QueryWhere } from "./types";

export type ConnOptions = {
	name: string;
	port?: number;
	host?: string;
	user?: string;
	pswd?: string;
};

export interface Transaction extends Knex.Transaction {
	id: string;
}

export interface IConnector {
	knx: Knex;
	trx?: Transaction;
	opt?: ConnOptions;
	knex(table: string): Knex.QueryBuilder;
	connect(opts: ConnOptions): void;
	query(table: string, filter?: QueryWhere, options?: any): Knex.QueryBuilder;
	queryRaw(stmt: string, args?: Knex.RawBinding): Promise<any>;
	queryCount(query: Knex.QueryBuilder): Promise<number>;
	log(table: string, action: string, data: unknown): Promise<void>;
	insert(table: string, data: any): Promise<any>;
	update(table: string, where: QueryWhere, data: any): Promise<any>;
	upsert(table: string, data: any): Promise<void>;
	delete(table: string, where: QueryWhere): Promise<void>;
	locate<T>(table: string, where: QueryWhere): Promise<T>;
	raw<T>(stmt: string, args?: Knex.RawBinding): Knex.Raw<T>;
	startTrx(log?: boolean): Promise<any>;
	closeTrx(commit: boolean): Promise<void>;
	withTrx(fn: () => any | void): Promise<any>;
	generateId(gen: string): Promise<number>;
}

export class Connector implements IConnector {
	private _opt?: ConnOptions;
	private _knx?: any;
	private _trx?: any;

	get knx() {
		if (!this._knx) throw new Error("Database is not ready!");

		return this._knx;
	}

	get trx() {
		return this._trx;
	}

	get opt() {
		return this._opt;
	}

	knex(table: string) {
		return this.knx(table);
	}

	connect(opts: ConnOptions) {
		this._opt = opts;

		const { DB_HOST, DB_PORT = "3306", DB_USER, DB_PSWD } = process.env;

		const { user = DB_USER } = opts;

		// eslint-disable-next-line @typescript-eslint/no-require-imports
		this._knx = knex({
			client: "mysql2",
			connection: {
				timezone: "-03:00",
				host: opts.host || DB_HOST,
				port: opts.port || parseInt(DB_PORT),
				user: `${user}_dba`,
				password: opts.pswd || DB_PSWD,
				database: `${user}_${opts.name}`,
			},
			pool: { min: 0, max: 25 },
			postProcessResponse: (result: any, options: any = {}) => {
				const { onCalculate } = options;
				if (_.isObject(result) && onCalculate) {
					return _.isArray(result)
						? _.map(result, onCalculate)
						: onCalculate(result);
				}
				return result;
			},
		});

		if (this._knx) {
			this._knx.on("query", ({ sql, bindings }: any) => {
				//if (_.includes(sql, "insert") || _.includes(sql, "update"))
				console.log(sql, bindings);
			});

			this._knx.on("query-error", (error: any) => {
				console.log(error);
				throw new Error("Internal database server error.");
			});
		}
	}

	query(table: string, where?: QueryWhere, options?: any) {
		const qry = this.knex(table);
		if (options) qry.queryContext(options);

		_.forEach(where, (v, k) => {
			if (v !== undefined) {
				if (_.isArray(v)) qry.whereIn(k, v as []);
				else qry.where(k, v);
			}
		});

		if (this._trx) qry.transacting(this._trx);

		return qry;
	}

	async queryRaw(stmt: string, args: Knex.RawBinding = []) {
		const raw = await this.knx.raw(stmt, args);
		const r1 = _.isArray(raw) ? raw[0] : undefined;
		return _.isArray(r1[0]) ? r1[0] : r1;
	}

	async queryCount(query: Knex.QueryBuilder) {
		const [row] = await query.clone().count("* AS ROW_COUNT");
		return row["ROW_COUNT"];
	}

	async log(table: string, action: string, data: unknown) {
		console.log(table, action, data);
	}

	async insert(table: string, data: any) {
		if (_.isEmpty(data)) return {};
		await this.query(table).insert(data);
		await this.log(table, "INSERT", data);
	}

	async update(table: string, where: QueryWhere, data: any) {
		if (_.isEmpty(data)) return {};
		await this.query(table, where).update(data);
		await this.log(table, "UPDATE", data);
	}

	async upsert(table: string, data: any) {
		await this.query(table).insert(data).onConflict("").merge();
		await this.log(table, "UPSERT", data);
	}

	async delete(table: string, where: QueryWhere) {
		await this.query(table, where).delete();
		await this.log(table, "DELETE", where);
	}

	async locate<T>(table: string, where: QueryWhere) {
		return (await this.query(table, where).first()) as T;
	}

	raw<T>(stmt: string, args: Knex.RawBinding = []) {
		return this.knx.raw(stmt, args) as Knex.Raw<T>;
	}

	async startTrx(log: boolean = true) {
		this._trx = await this.knx.transaction();
		this._trx.id = log ? await this.generateId("GEN_SYS_LOG_ID") : undefined;
		return this._trx;
	}

	async closeTrx(commit: boolean) {
		if (this._trx) {
			if (commit) await this._trx.commit();
			else await this._trx.rollback();
			this._trx = undefined;
		}
	}

	async withTrx(fn: () => any | void) {
		await this.startTrx();
		try {
			const res = await fn();
			await this.closeTrx(Boolean(res));
			return res;
		} catch (error) {
			await this.closeTrx(false);
			throw error;
		}
	}

	async generateId(gen: string) {
		const timestamp = Date.now();
		const random = Math.floor(Math.random() * 1000 * gen.length);
		return Number(`${timestamp}${random}`);
	}
}

export { Knex };
