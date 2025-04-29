import _ from "@next-gs/utils/funcs";

import type { Entity, JsonValue } from "@next-gs/client";

export class DataRecord<E extends Entity> {
	private _data?: Partial<E>;

	get data() {
		return this._data;
	}

	get empty() {
		return this._data === undefined;
	}

	reset(data?: Partial<E>) {
		this._data = data;
	}

	str(key: string) {
		return _.toString(this.val(key));
	}

	val(key: string) {
		return _.get(this.data, key) as JsonValue;
	}

	put(key: string, val: JsonValue) {
		if (this._data) _.set(this._data, key, val);
		else this._data = { [key]: val } as Partial<E>;
		return this;
	}

	assign(data: DataRecord<E> | Partial<E> | undefined) {
		_.assign(this._data, data instanceof DataRecord ? data._data : data);
		return this;
	}

	pick(keys: string[]) {
		let cnt = 0;

		const obj = _.reduce(
			keys,
			(o, k) => {
				const val = this.val(k);
				if (val !== undefined) {
					_.set(o, [k], val);
					cnt++;
				}
				return o;
			},
			{},
		);

		return cnt > 0 ? obj : undefined;
	}

	remove(att: string) {
		if (this._data) delete this._data[att];
		return this;
	}

	clone() {
		return { ...this.safe() };
	}

	safe() {
		return (this._data || {}) as E;
	}

	isDiff(fld: string, val: JsonValue) {
		if (this.empty) return true;

		const old = this.str(fld);

		if (_.isBoolean(val)) return val !== Boolean(old);

		return String(val) !== old;
	}
}
