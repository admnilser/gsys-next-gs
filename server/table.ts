/* eslint-disable @typescript-eslint/no-explicit-any */
import _ from "@next-gs/utils/funcs";

import type {
	Dictionary,
	Entity,
	JsonDate,
	JsonValue,
	TableRow,
} from "@next-gs/client";

import {
	FieldType,
	type Field,
	type TableFields,
	type TableMeta,
} from "./types";

import { DataRecord } from "./record";

export const PK_VALUE_SEP = "&";

export type TableFunc<R> = (item: Table) => R;

export class Table<E extends Entity = Entity> {
	constructor(
		public meta: TableMeta<E>,
		public parent: Table | null,
	) { }

	get name() {
		return this.meta.name;
	}

	get primary() {
		return this.meta.primary || "";
	}

	get fields() {
		return this.meta.fields;
	}

	get deleteField() {
		return this.meta.deleteField;
	}

	get generator(): string {
		return this.parent?.generator || `GEN_${this.name}_ID`;
	}

	isPrimary(field: string) {
		const pk = this.primary;
		return _.isArray(pk) ? pk.includes(field) : pk === field;
	}

	objToId(rec?: Dictionary<JsonValue> | DataRecord<E>) {
		const pk = this.primary;

		const obj = (
			rec instanceof DataRecord && _.isArray(pk) ? rec.pick(pk) : rec
		) as Dictionary<JsonValue>;

		if (_.isNil(obj) || !pk) return;

		return _.isArray(pk)
			? _.map(pk, (k) => obj[k]).join(PK_VALUE_SEP)
			: obj[pk];
	}

	idToObj(id: JsonValue) {
		const pk = this.primary;
		if (!pk) return;

		if (_.isArray(pk)) {
			const values = _.toString(id).split(PK_VALUE_SEP);
			return _.reduce(
				pk,
				(obj, fld, idx) => {
					_.set(obj, [fld], _.strToJson(values[idx]) || undefined);
					return obj;
				},
				{},
			);
		}
		return { [pk]: id };
	}

	selectFields(alias?: string) {
		const tblName = alias || this.name;

		return _.reduce<TableFields, string[]>(
			this.fields,
			(vis, fld, key) => {
				if (!(fld.hidden || fld.lookup)) {
					let fldName = `${tblName}.${key}`;

					if (fld.alias) fldName += ` as ${fld.alias}`;

					vis.push(fldName);
				}
				return vis;
			},
			[],
		);
	}

	iterate(fn: (table: Table) => boolean) {
		let table: Table | null = this as unknown as Table;
		while (table) {
			if (!fn(table)) break;
			table = table.parent;
		}
	}

	getField(name: string, deep?: boolean) {
		let field: Field | undefined;

		const getter = (table: Table) => {
			field = _.get(table.fields, [name]);
		};

		if (deep)
			this.iterate((t) => {
				getter(t);
				return field !== undefined;
			});
		else getter(this as unknown as Table);

		return field;
	}

	getFieldList(filter: (field: Field) => boolean) {
		const list: TableFields = {};

		this.iterate((table) => {
			_.assign(list, _.pickBy(table.fields, filter));
			return true;
		});

		return _.notEmpty(list) ? list : undefined;
	}

	fmtFieldValue(
		field: Field | string | undefined,
		value: JsonValue,
	): JsonValue {
		if (!field || value === undefined) return value;

		if (_.isString(field)) {
			return this.fmtFieldValue(this.getField(field, true), value);
		}

		switch (field.type) {
			case FieldType.Date:
				return _.sqlDate(value as JsonDate);
			case FieldType.Time:
				return _.sqlTime(value as JsonDate);
			case FieldType.DateTime:
				return _.sqlDateTime(value as JsonDate);
			default:
				return value;
		}
	}
}
