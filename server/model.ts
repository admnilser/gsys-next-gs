import fn from "@next-gs/utils/funcs";

import {
	FieldType,
	type QueryBuilder,
	type QueryBuilderOptions,
	type TableMeta,
	type IModel,
} from "./types";

import type {
	JsonValue,
	Query,
	Entity,
	EntityID,
	Dictionary,
	TableRow,
	QueryWhere,
	UpdaterState,
	UpdaterOptions,
	Any,
} from "@next-gs/client";

import type { DataRecord } from "./record";

import { PK_VALUE_SEP, Table, type TableFunc } from "./table";

import * as Where from "./where";

import { Updater } from "./updater";

import type { Repository } from "./repository";

const asArray = (val: JsonValue) =>
	fn.notNil(val)
		? fn.isArray(val)
			? val
			: fn.isString(val)
				? fn.split(val, ",")
				: [val]
		: [];

export const FieldFormat = {
	numbers: (val: JsonValue) => (val ? String(val).replace(/\D/g, "") : val),
};

export abstract class Model<
	E extends Entity = Entity,
	R extends TableRow = TableRow,
> implements IModel {
	private _table?: Table<E>;
	private _tables: Table[] = [];

	private _query?: QueryBuilder;
	private _queryOptions?: QueryBuilderOptions<E>;

	constructor(public repo: Repository) { }

	get table() {
		return this._table;
	}

	get meta() {
		return this._table?.meta as TableMeta<E>;
	}

	set meta(value: TableMeta<E>) {
		if (!value.primary) value.primary = `COD${value.name}`;

		if (value.deleteField !== false && value.deleteField === undefined) {
			value.deleteField = `DEL${value.name}`;
		}

		if (this._table) {
			value.join = {
				pk: value.primary,
				pkPath: `${value.name}.${value.primary}`,
				fk: this._table.primary,
				fkPath: `${this._table.name}.${this._table.primary}`,
			};
		}

		this._table = new Table(value, this._table as unknown as Table);

		this._tables.push(this._table as unknown as Table);
	}

	get queryOptions() {
		if (this._queryOptions === undefined) {
			const objFields = this.table?.getFieldList(
				({ type }) =>
					type === FieldType.ObjectJson || type === FieldType.ObjectText,
			);

			let calcNodes = 0;
			this.forEachTable((table) => {
				if (table.meta.onCalculate) calcNodes++;
				return true;
			});

			// **** initialize query options
			this._queryOptions =
				calcNodes || objFields
					? {
						onCalculate: (row) => {
							let out = row as E;

							this.forEachTable(({ meta }) => {
								if (meta.onCalculate)
									out = meta.onCalculate(out as TableRow) as E;
								return true;
							});

							if (objFields)
								fn.forEach(objFields, (fld, key) => {
									let val = out[key];

									if (fld.type === FieldType.ObjectJson) {
										val = val ? JSON.parse(val as string) : {};
									} else if (fld.type === FieldType.ObjectText) {
										val = fn.strToObj(val as string);
									}

									fn.set(out, [key], val);
								});

							return out;
						},
					}
					: {};
		}

		return this._queryOptions;
	}

	forEachTable(fn: TableFunc<boolean>, inverse?: boolean) {
		if (inverse) {
			for (let t = 0; t < this._tables.length; t++) {
				if (!fn(this._tables[t])) break;
			}
		} else {
			for (let t = this._tables.length - 1; t >= 0; t--) {
				if (!fn(this._tables[t])) break;
			}
		}
	}

	async queueTables<R = void>(cb: TableFunc<Promise<R>>, inverse?: boolean) {
		const tables: Table[] = [];

		this.forEachTable((table) => {
			tables.push(table);
			return true;
		}, inverse);

		return await fn.queue<Table, R>(tables, cb);
	}

	async fetch(full?: boolean) {
		const rows = await this._query;

		if (rows && full) {
			await Promise.all(
				fn.map(rows, async (row, rowIdx) =>
					this.queueTables(async (table) => {
						const { detailFields, computeFields } = table.meta;
						await Promise.all(
							fn.map(detailFields, async (dtl, name) => {
								const { ref, relation, raw, format, sorter } = dtl;

								let dtlData = undefined;

								if (raw) {
									const mstKey = fn.map(relation, (m) => row[m]);

									if (fn.isFunction(raw)) {
										dtlData = await raw(mstKey);
									} else {
										dtlData = await this.repo.queryRaw(raw, [mstKey]);
									}
								} else if (ref) {
									if (!dtl.model) dtl.model = this.repo.createModel(ref);

									const dtlFilter = fn.reduce(
										relation,
										(f, m, d) => {
											f[d] = row[m];
											return f;
										},
										{} as { [key: string]: JsonValue },
									);

									dtlData = await (dtl.model as Model).findMany({
										where: dtlFilter,
										sort: sorter,
									});
								}

								if (dtlData) {
									row[name] = format ? format(dtlData) : dtlData;
								}
							}),
						);

						if (fn.isFunction(computeFields)) {
							rows[rowIdx] = await computeFields(row);
						} else {
							await Promise.all(
								fn.map(computeFields, async (func, name) => {
									row[name] = func ? await func(row) : undefined;
								}),
							);
						}
					}),
				),
			);
		}

		return rows as E[];
	}

	getFieldValue(field: string, value: JsonValue) {
		return this.table?.fmtFieldValue(field, value);
	}

	query(where?: QueryWhere) {
		if (!this.table) throw new Error("Model table is undefined");

		const query = this.repo.query(this.table.name, where, this.queryOptions);

		return query;
	}

	prepare({ where, sort }: Query<E>) {
		const query = this.query();

		const primary = this.table?.primary;

		const withField = (field: string, cb: (f: string) => void) =>
			fn.tryEach(field, (f) => cb((f === "id" ? primary : f) as string));

		this.forEachTable((table) => {
			const { join } = table.meta;
			if (join) {
				query
					.select(table.selectFields())
					.innerJoin(table.name, join.pkPath, join.fkPath);
			} else {
				const pk = table.primary;
				const pkRaw = fn.isArray(pk)
					? `CONCAT(${pk.join(`,'${PK_VALUE_SEP}',`)})`
					: pk;
				query
					.select(this.repo.raw(`${pkRaw} as id`))
					.select(table.selectFields())
					.table(table.name);
			}

			return true;
		}, true);

		this.onPrepare(query);

		const { _q, _removed, ...w } = where || {};

		this.prepareJoins(query, null, _removed === true);
		console.log("-- QUERY WHERE 1 ---", where);

		if (_q)
			query.where((qry: QueryBuilder) => {
				console.log("-- QUERY WHERE 2 ---", _q);

				this.forEachTable((table) => {
					const { queryFields } = table.meta;
					fn.forEach(queryFields, (op, col) => {
						const field = col.replace("$", ".");
						console.log("-- QUERY WHERE 3 ---", field, op, _q);
						if (op === "%") qry.orWhere(field, "LIKE", `%${_q}%`);
						else qry.orWhere(field, _q);
					});
					return true;
				});
			});

		if (w)
			for (const attr in w) {
				const { f: field, o } = Where.extract(attr);

				withField(field, (f) => {
					let v: JsonValue = fn.strToJson(w[attr]);

					if (fn.isNil(v)) {
						query.whereNull(f);
					} else if (f === "_raw") {
						query.whereRaw(v as string);
					} else if (o === "IN") {
						query.whereIn(f, asArray(v));
					} else if (o === "&" || o === "|") {
						v = asArray(v).reduce((sum, num) => sum + Number.parseInt(num), 0);
						if (v) query.whereRaw(`${f} ${o} ${v} <> 0`);
					} else {
						query.where((qry: QueryBuilder) =>
							fn.forEach(asArray(v), (val) => {
								const partial = fn.includes(val, "%");
								if (o === "LIKE" || partial) {
									qry.orWhere(f, "LIKE", partial ? val : `%${val}%`);
								} else {
									const v = this.getFieldValue(f, val);
									fn.notNil(v)
										? qry.orWhere(f, o || "=", v)
										: qry.orWhereNull(f);
								}
							}),
						);
					}
				});
			}

		// **** sort query
		fn.forEach(sort, (d, f) => query.orderBy(f, d));

		this._query = query;

		return this._query;
	}

	// **** includes fixed fields on query filter
	prepareFixed(query: QueryBuilder, table: Table, alias?: string) {
		fn.forEach(table.fields, ({ fixed }, name) => {
			console.log("prepareFixed", alias, name, fixed);
			const fullName = `${alias}.${name}`;
			this.onPrepareFixed(query, name, fullName);
			if (fixed !== undefined) query.where(fullName, fixed);
		});
	}

	prepareJoins(
		query: QueryBuilder,
		rootAlias: string | null,
		showRemoved: boolean,
	) {
		this.forEachTable((table) => {
			const tblName = table.name;

			if (rootAlias === null) this.prepareFixed(query, table, tblName);

			const modelAlias = table.parent ? tblName : rootAlias || tblName;

			// **** includes lookupfixed fields on query filter
			fn.forEach(table.meta.lookupFields, (lkp, key) => {
				if (fn.isString(lkp.raw)) {
					query.select(this.repo.raw(`(${lkp.raw}) as ${key}`));
					return;
				}

				const { ref, relation, lkpName = "*", lkpJoin, lkpCols } = lkp;

				if (fn.isArray(lkpJoin)) {
					const [p1, p2, p3] = lkpJoin;
					return query.select(`${key}.*`).leftJoin(p1, p2, p3);
				}

				const lkpModel = ref
					? (this.repo.createModel(ref) as Model)
					: undefined;

				const lkpTable = lkpModel?.table;

				const lkpAlias =
					lkp.lkpAlias ||
					`${modelAlias}_${lkpTable?.name}_${fn.map(
						relation,
						(key, src) => src,
					).join()}`;

				if (lkpName === "*") {
					const refFields = lkpCols
						? fn.isPlainObject(lkpCols)
							? fn.map(lkpCols, (a, f) => `${lkpAlias}.${f} as ${a}`)
							: fn.map(lkpCols, (f) => `${lkpAlias}.${f}`)
						: lkpTable
							? lkpTable.selectFields(lkpAlias)
							: `${lkpAlias}.*`;

					query.select(refFields);
				} else {
					query.select(`${lkpAlias}.${lkpName} as ${key}`);
				}

				if (fn.isString(lkpJoin)) {
					query.joinRaw(lkpJoin);
				} else if (fn.isFunction(lkpJoin)) {
					query.joinRaw(lkpJoin(lkpAlias, modelAlias));
				} else if (lkpTable) {
					query.leftJoin(`${lkpTable.name} as ${lkpAlias}`, function () {
						fn.forEach(relation, (key, src) => {
							this.on(`${modelAlias}.${src}`, "=", `${lkpAlias}.${key}`);
						});
					});
				}

				if (lkpName === "*" && lkpModel && lkpTable) {
					if (!lkpCols) lkpModel.prepareJoins(query, lkpAlias, showRemoved);
					lkpModel.prepareFixed(query, lkpTable, lkpAlias);
				}
			});

			if (!showRemoved && table.deleteField) {
				query.whereNull(`${modelAlias}.${table.deleteField}`);
			}

			return true;
		});
	}

	async initialValues(data: Partial<E>) {
		/*await this.queueTables(async (table) => {
		_.forEach(table.fields, ({ initial }, name) => {
			let val = data[name];

			if (_.isNil(val)) {
				if (name === `LOJ${table.name}`) {
					val = this.repo.shop;
				} else  if (initial !== undefined) {
					val = this.repo.parseExpr(_.toString(initial), initial);
				}
			}

			if (!(_.isUndefined(val) || _.isNaN(val))) _.set(data, [name], val);
		});
	});*/

		return data;
	}

	async findOne(id: EntityID, full?: boolean) {
		if (fn.notNil(id)) {
			this.prepare({ where: { id } });

			const rows = await this.fetch(full);

			return rows ? rows[0] : undefined;
		}
	}

	async findOneOrFail(id: EntityID, full?: boolean) {
		const found = await this.findOne(id, full);

		if (!found) throw new Error("Record not found!");

		return found;
	}

	async findFirst(where: QueryWhere) {
		const { data } = await this.findMany({ where, skip: 0, take: 1 });
		return data[0];
	}

	async findMany({ full, skip = 0, take = 200, ...rest }: Query<E> = {}) {
		const query = this.prepare(rest);

		if (!query) return { data: [], total: 0 };

		const total = await this.repo.queryCount(query);

		if (skip > 0) query.offset(skip);

		if (take > 0) query.limit(take);

		const data = await this.fetch(full);

		return { data, total };
	}

	async updateOne(data: Partial<E>, opts?: UpdaterOptions) {
		if (fn.isNil(data)) return data;

		const updater = new Updater<E, R>(this, opts || {});

		return await updater.execute(data);
	}

	async updateMany(data: Partial<E>[], opts?: UpdaterOptions) {
		return await fn.queue<Partial<E>, E>(data, (item) =>
			this.updateOne(item, opts),
		);
	}

	async removeOne(id: EntityID) {
		const previous = await this.findOneOrFail(id);

		await this.onDelete(id, previous);

		return previous;
	}

	async removeMany(ids: EntityID[]) {
		return await fn.queue(ids, (id) => this.removeOne(id));
	}

	async onDelete(id: JsonValue, previous?: E) {
		await this.beforeDelete(previous);

		await this.queueTables(async (table) => {
			const filter = table.idToObj(id);
			if (!filter) return;

			const { name, deleteField } = table;

			const qry = this.repo.query(name, filter);
			if (deleteField) {
				await qry.update({ [deleteField as string]: fn.time() });
			} else {
				await qry.delete();
			}
		});

		await this.afterDelete(previous);
	}

	async validate(data: Partial<E>) {
		this.forEachTable((table) => {
			fn.forEach(table.fields, ({ fixed, format: validators }, name) => {
				if (fixed !== undefined) fn.set(data, [name], fixed);

				fn.tryEach(validators, (func) => {
					if (func) fn.set(data, [name], func(data[name]));
				});
			});

			return true;
		});

		return { parsed: data } as {
			parsed: Partial<E>;
			errors?: Dictionary<string>;
		};
	}

	async checkAbility(action: string, subject: Partial<E> | undefined) {
		console.log("can", action, subject);
	}

	async beforeDelete(previous?: E) {
		console.log("beforeDelete", previous);
	}

	async beforeUpdate(state: UpdaterState<E>) {
		return state.newData;
	}

	async afterDelete(previous?: E) {
		console.log("afterDelete", previous);
	}

	async afterUpdate(data: DataRecord<E>) {
		console.log("afterUpdate", data);
	}

	abstract onPrepare(query: QueryBuilder): Promise<void>;
	abstract onPrepareFixed(
		query: QueryBuilder,
		field: string,
		fixed: JsonValue,
	): Promise<void>;
}
