import _ from "@next-gs/utils/funcs";

import { FieldType } from "./types";

import type {
	QueryWhere,
	Entity,
	EntityID,
	JsonValue,
	TableRow,
	UpdaterOptions,
} from "@next-gs/client";

import type { Model } from "./model";

import type { Table } from "./table";

import { DataRecord } from "./record";

const isSameType = (a: JsonValue, b: JsonValue) => typeof a === typeof b;

export class Updater<E extends Entity, R extends TableRow> {
	public oldData = new DataRecord<E>();
	public newData = new DataRecord<E>();
	public allData = new DataRecord<E>();
	public updData = new DataRecord<E>();

	constructor(
		private model: Model<E, R>,
		private opts: UpdaterOptions,
	) {}

	get repo() {
		return this.model.repo;
	}

	get exists() {
		return !this.oldData.empty;
	}

	async prepareDelta(table: Table) {
		const oldData = this.oldData.safe();
		const newData = this.newData.safe();

		const updData = await this.model.beforeUpdate({
			oldData,
			newData,
			mixData: _.assign({}, oldData, newData),
			allData: this.allData.safe(),
		});

		let changes = 0;

		const delta = _.pickBy(updData, (val, key) => {
			if (table.isPrimary(key)) return true;

			if (key === "$more" || key === "$master") return false;

			const f = table.getField(key);

			const changed =
				f && !f.readOnly && !f.lookup && this.oldData.isDiff(key, val);

			if (changed) changes++;

			return changed;
		});

		this.updData.assign(updData);

		return changes > 0 || !this.exists ? delta : undefined;
	}

	async checkFieldValues(table: Table) {
		await Promise.all(
			_.map(table.fields, async (field, name) => {
				let value: JsonValue;

				if (
					field.type === FieldType.Object ||
					field.type === FieldType.ObjectText
				) {
					const pfx = `${name}_`;

					const oldObj = _.reduce<object, object>(
						this.allData.data,
						(obj, val, key) => {
							if (key.startsWith(pfx)) _.set(obj, [key.slice(pfx.length)], val);
							return obj;
						},
						this.exists ? _.strToObj(this.oldData.str(name)) : {},
					);

					value = _.objToStr(oldObj);
				} else {
					value = table.fmtFieldValue(field, this.allData.val(name));

					if (field.type === FieldType.Image) {
						if (_.isObject(value)) {
							value = await this.repo.storeBlob(_.get(value, [0]));
						}
					} else if (field.type === FieldType.ObjectJson) {
						value = _.isObject(value) ? JSON.stringify(value) : "{}";
					} else if (field.type === FieldType.Number) {
						if (_.isNaN(value)) value = undefined;
					} else if (field.type === FieldType.Text) {
						if (_.isString(value)) value = _.trim(value);
					}
				}

				//**** set field if is different
				if (value !== undefined && this.oldData.isDiff(name, value))
					this.newData.put(name, value);
			}),
		);
	}

	async updateTable(table: Table, tid: QueryWhere) {
		await this.checkFieldValues(table);

		const delta = await this.prepareDelta(table);

		if (delta) {
			/*this.opts.upsert
				? await this.ctx.upsert(table.name, delta)
				: this.exists
					? await this.ctx.update(table.name, tid, delta)
					: await this.ctx.insert(table.name, delta);*/
			return true;
		}
	}

	async updateLookups(table: Table, tid: JsonValue) {
		await Promise.all(
			_.map(table.meta.lookupFields, async (lkp) => {
				const { ref, relation, update } = lkp;
				if (!ref || update !== true) return;

				if (!lkp.model) lkp.model = this.repo.createModel(ref);

				const lkpTable = (lkp.model as Model<E>).table;

				const lkpData = this.allData.clone();

				lkpData.id = (
					isSameType(lkpTable.primary, table.primary)
						? tid
						: table.objToId(lkpData)
				) as EntityID;

				_.forEach(relation, (key, src) => {
					_.set(lkpData, [key], this.allData.val(src));
				});

				await (lkp.model as Model<E>).updateOne(lkpData, {
					upsert: _.toString(update) === "upsert",
				});
			}),
		);
	}

	async updateDetails(table: Table) {
		const $master = _.assign({}, this.allData.data, this.updData.data);

		await Promise.all(
			_.map(table.meta.detailFields, async (dtl, name) => {
				if (!(dtl.update && dtl.ref)) return;

				const detail = this.allData.val(name);
				if (_.isArray(detail)) {
					const { ref, relation, onUpdate } = dtl;

					const dtlRows = await Promise.all(
						_.map(detail, async (record, idx) => {
							const dtlData = { ...record, $master };

							_.forEach(relation, (m, d) => {
								dtlData[d] = this.updData.val(m);
							});

							return onUpdate ? await onUpdate($master, dtlData, idx) : dtlData;
						}),
					);

					if (!dtl.model) {
						dtl.model = this.repo.createModel(ref);
					}

					const dtlData = await (dtl.model as Model<E>).updateMany(dtlRows);

					this.updData.put(name, dtlData);
				}
			}),
		);
	}

	async execute(data: Partial<E>) {
		const m = this.model;
		const t = this.model.table;

		const { match = t.primary } = this.opts;

		const {
			parsed: { id: _id, ...all },
		} = await m.validate(data);

		let id: JsonValue = _id;

		this.oldData.reset();
		this.newData.reset();
		this.allData.reset(all as Partial<E>);
		this.updData.reset();

		const key = _.isNil(id)
			? _.isArray(match)
				? this.allData.pick(match)
				: this.allData.val(match)
			: t.idToObj(id);

		if (_.notNil(key)) this.oldData.reset(await m.findFirst(key));

		id = this.exists
			? this.oldData.val("id")
			: _.isArray(t.primary)
				? t.objToId(this.allData)
				: await m.repo.generateId(t.generator);

		if (!this.exists) {
			this.newData.reset(await m.initialValues(this.allData.safe()));
			this.allData.assign(this.newData);
		}

		let updated = 0;

		await this.model.queueTables(async (table: Table) => {
			const tid = table.idToObj(id);

			this.newData.assign(tid as DataRecord<E>);

			if (await this.updateTable(table, tid)) updated++;

			await this.updateLookups(table, id);

			await this.updateDetails(table);
		}, true);

		if (updated > 0) await m.afterUpdate(this.updData);

		const saved = await m.findOneOrFail(id as EntityID);

		return this.allData
			.assign(this.updData)
			.assign(saved)
			.remove("$master")
			.safe();
	}
}
