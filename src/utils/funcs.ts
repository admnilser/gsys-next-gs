import _ from "lodash";

import { Duplex } from "stream";

import CryptoJS from "crypto-js";

import type { Dictionary, JsonValue } from "./types";

import mtz, {
	type MomentInput,
	type DurationInputArg1,
	type unitOfTime,
} from "moment-timezone";
mtz.locale("pt-BR");
mtz.tz.setDefault("America/Fortaleza");

export const moment = mtz;

export const DataTypes = {
	True: 1,
	False: 0,
}

export type NullableString = string | null | undefined;

const assert = (role: string | boolean, msg: string) => {
	if (role) throw new Error(msg || _.toString(role));
};

const asArray = <T>(obj: T) => {
	return (obj ? (_.isArray(obj) ? obj : [obj]) : []) as T[];
}

const contains = (str: string, sub: string) =>
	_.includes(_.lowerCase(str), _.lowerCase(sub));

export type AnyValue = string | number | boolean | object | null | undefined;
export type Any = AnyValue | AnyValue[];

export type CSVData = { key: string; val: string }[];

const csv = (data: CSVData | object) => {
	let arr: CSVData = [];

	if (_.isPlainObject(data)) {
		arr = _.map(data, (val, key) => ({ key, val: JSON.stringify(val) }));
	}

	return _.reduce(
		arr,
		(str, row) =>
			`${str + _.map(row, (val) => `"${val !== null ? val : ""}"`).join(";")
			}\n\r`,
		"",
	);
};

const tzDate = (m: Any) =>
	mtz.isMoment(m) && m.isValid()
		? m.add(process.env.TZ, "hours").toDate()
		: null;

const time = (
	delta: DurationInputArg1 = 0,
	unit: unitOfTime.DurationConstructor = "days",
) => {
	const m = mtz();
	if (delta !== 0) m.add(delta, unit);
	return tzDate(m) as Date;
};

const dateDiff = (
	d1: MomentInput,
	d2: MomentInput,
	unit: unitOfTime.DurationConstructor = "days",
) => mtz(d1).diff(d2 || mtz(), unit);

const dateDecode = (d: MomentInput) => {
	const m = tryMoment(d);
	return m ? [m.date(), m.month(), m.year()] : [];
};

const strToMoment = (d: MomentInput) => {
	if (!_.isString(d)) return undefined;

	let fmt: mtz.MomentFormatSpecification = mtz.ISO_8601;

	/*** sql format */
	if (d.length === 10) {
		if (d.charAt(4) === "-" && d.charAt(7) === "-") fmt = "YYYY-MM-DD";
		else if (d.charAt(2) === "/" && d.charAt(5) === "/") fmt = "DD/MM/YYYY";
	}

	const m = mtz(d, fmt, true);

	return m.isValid() ? m : undefined;
};

const strToJson = (val: Any) =>
	val === "true" ? true : val === "false" ? false : val;

const strToObj = (s: string) =>
	_.reduce<string, { [key: string]: Any }>(
		_.split(s, "\r\n"),
		(obj, str) => {
			const [k, v] = _.split(str, "=");
			if (k) obj[k] = strToJson(v);
			return obj;
		},
		{},
	);

const strToObjs = <R>(str: string, mapFunc: (s: string[]) => R | undefined) =>
	_.split(str, "\r\n")
		.filter((ln) => ln !== "")
		.map((ln) => mapFunc(ln.split(";")));

const objToStr = (obj: object) =>
	_.map(obj, (val, key) => `${key}=${val}`).join("\r\n");

const tryTime = (t: MomentInput) => tzDate(mtz(t, ["HH:mm:ss"], true));

const tryDate = (d: MomentInput) => {
	if (mtz.isDate(d)) return d;

	if (mtz.isMoment(d)) return tzDate(d);

	const m = strToMoment(d);

	return m ? tzDate(m) : tryTime(d);
};

const tryMoment = (d: MomentInput) => {
	if (mtz.isMoment(d)) return d;

	if (mtz.isDate(d)) return mtz(d);

	return strToMoment(d);
};

const addMonths = (d: MomentInput, inc: number) =>
	tzDate(tryMoment(d)?.add(inc, "M"));

const isTime = (t: string) => {
	const [h, m, s] = _.split(t, ":").map((n) => Number.parseInt(n));
	return h >= 0 && h < 24 && m >= 0 && m < 60 && s >= 0 && s < 60;
};

const monthStart = (d: MomentInput) => tryMoment(d)?.startOf("month");
const monthEnd = (d: MomentInput) => tryMoment(d)?.endOf("month");

const isPast = (d: MomentInput) => tryMoment(d)?.isBefore(time());
const isFuture = (d: MomentInput) => tryMoment(d)?.isAfter(time());
const isMonthStart = (d: MomentInput) => monthStart(d)?.isSame(d);
const isMonthEnd = (d: MomentInput) => monthEnd(d)?.isSame(d);

const dateISO = (d: MomentInput) => tryMoment(d)?.format() || "";

const dateSplit = (d: MomentInput) => {
	const [s1 = "", s2 = ""] = dateISO(d).split("T");
	return [s1, s2.slice(0, 8)];
};

const sqlDate = (d: MomentInput) => dateSplit(d)[0] || null;

const sqlDateTime = (d: MomentInput) => {
	const [dt, tm] = dateSplit(d);
	return dt && tm ? `${dt} ${tm.slice(0, 8)}` : null;
};

const sqlTime = (d: MomentInput) => {
	if (_.isString(d) && isTime(d)) return d;

	const res = dateSplit(d);

	return res[1] || null;
};

const sqlToday = (delta: DurationInputArg1) => sqlDate(time(delta));

const countChar = (str: string, ch: string) => _.countBy(str)[ch] || 0;

export type TryEachObj<T> = T | T[];

const tryEach = <T = Any>(obj: TryEachObj<T>, func: _.ArrayIterator<T, void>) => {
	if (obj) {
		if (_.isArray(obj)) _.forEach(obj, func);
		else func(obj, 0, []);
	}
};

const hashStr = (data: string | CryptoJS.lib.WordArray) =>
	CryptoJS.MD5(data).toString();

const hashBuffer = (buffer: number[]) =>
	hashStr(CryptoJS.lib.WordArray.create(buffer));

const hashObj = (obj: object) =>
	hashStr(_.map(obj, (v, k) => `${k}:$${v}`).join("|"));

const notEmpty = (val: Any) => !_.isEmpty(val);
const notNil = (val: Any) => !_.isNil(val);

const numbers = (str: Any) => (str ? _.toString(str).replace(/\D/g, "") : "");

const right = (str: Any, len: number) => _.toString(str).slice(-len);

const fmtDate = (d: MomentInput, fmt = "DD/MM/YY") => fmtDateTime(d, fmt);

const fmtDateTime = (d: MomentInput, fmt = "DD/MM/YY HH:mm:ss") => {
	const m = tryMoment(d);
	return m ? m.format(fmt) : "";
};

const fmtTime = (d: MomentInput, fmt = "HH:mm:ss") => fmtDateTime(d, fmt);

const ptbrNumber = (n: string | number | null | undefined) => {
	if (!n) return "";

	const m = _.toString(n).split(".");
	m[0] = m[0].split(/(?=(?:...)*$)/).join(".");
	return m.join(",");
};

const fmtMoney = (m: string | number) => {
	const f = _.isNumber(m) ? m : Number.parseFloat(m);

	return Number.isNaN(f) ? "" : ptbrNumber(f.toFixed(2));
};

const fmtNumber = (val: number, fmt: string | undefined) => {
	if (fmt) {
		const [i, f] = (fmt === "money" ? ",0.00" : fmt).split(".");

		const mfd = countChar(f, "0");

		const opts = {
			style: "decimal",
			useGrouping: i.includes(","),
			minimumIntegerDigits: countChar(i, "0"),
			minimumFractionDigits: mfd,
			maximumFractionDigits: countChar(i, "#") || mfd,
		} as Intl.NumberFormatOptions;

		return new Intl.NumberFormat("pt-BR", opts).format(val);
	}

	return ptbrNumber(val);
};

function strToNumber(s: string | number) {
	if (_.isNumber(s)) return s;

	const f = _.trim(s).replace(/[^\d,.-]/g, '').replace(/\./g, "").replace(",", ".");

	return f ? Number.parseFloat(f) : 0;
}

function numberToStr(n: string | number) {
	return _.isNumber(n) ? n.toString() : n;
}

const resolve = (value: Any, ...args: Any[]) =>
	_.isFunction(value) ? value(...args) : value;

const replaceAll = (str: string, oldStr: string, newStr: string) =>
	str ? str.replace(new RegExp(oldStr, "gi"), newStr) : "";

const strToBase = (str: string) => Buffer.from(str).toString("base64");
const baseToStr = (b64: string) => Buffer.from(b64, "base64").toString("utf8");
const baseToJson = (b64: string) => JSON.parse(baseToStr(b64));
const jsonToBase = (json: Any) => strToBase(JSON.stringify(json));
const blobToBuff = (blob: string | undefined) => {
	if (!blob) return null;

	const base64 = blob.toString().split(";base64,")[1];

	return Buffer.from(base64, "base64");
};
const buffToStream = (buffer: Any) => {
	const tmp = new Duplex();
	tmp.push(buffer);
	tmp.push(null);
	return tmp;
};

const summary = (array: Dictionary<number>[], attrs: string[]) => {
	const initial = _.fill(Array(_.size(attrs)), 0);
	return _.reduce(
		array,
		(sum, obj) => {
			_.forEach(attrs, (att, idx) => {
				sum[idx] = sum[idx] + (obj[att] || 0);
			});
			return sum;
		},
		initial,
	);
};

type SummaryGroupFn = (value: Any) => string;

const summaryGroup = (arr: Any[], grp: string, fn: SummaryGroupFn) => {
	const grouped = _.groupBy<Any[]>(arr, grp);
	return _.reduce<Dictionary<Any[]>, Dictionary<string>>(
		grouped,
		(obj, val, key) => {
			obj[key] = fn(val);
			return obj;
		},
		{},
	);
};

const summaryGroupMap = (arr: Any[], grp: string, fn: SummaryGroupFn) => {
	const reduced = summaryGroup(arr, grp, fn);
	return _.map(reduced, (val: Any[], key: string) => ({ [grp]: key, ...val }));
};

const zeros = (n: string | number, l: number) =>
	_.padStart(_.toString(n), l, "0");

const queue = async <T, R>(arr: T[], asyncFn: (item: T) => Promise<R>) => {
	const result: R[] = [];

	const chained = _.reduce(
		arr,
		(promise, item) =>
			promise
				.then(() => asyncFn(item))
				.then((res) => {
					if (res) result.push(res);
				}),
		Promise.resolve(),
	);

	await Promise.resolve(chained);

	return result;
};

const toggle = (arr: string[], item: string) => {
	if (arr.includes(item)) return arr.filter(i => i !== item);
	return [...arr, item];
}

const decodeSearchParams = <T>(params: URLSearchParams) => {
	const obj = Object.fromEntries(params);
	Object.keys(obj).forEach(key => {
		obj[key] = JSON.parse(obj[key]);
	});
	return obj as T;
}

export type TextFormatterFunc<V> = (value: V) => string;

export const TextFormatter = {
	money: fmtMoney as TextFormatterFunc<number | string>,
	date: fmtDate as TextFormatterFunc<Date | string>,
	phone: (number: string) => {
		const cleaned = _.toString(number).replace(/\D/g, '');
		const match = cleaned.match(/^(\d{2})(\d{2})(\d{4}|\d{5})(\d{4})$/);
		if (match) {
			return ['(', match[2], ')', match[3], '-', match[4]].join('')
		}
		return "";
	},
	pad: (len: number) => ((val: string | number) => zeros(val, len)) as TextFormatterFunc<string | number>,
	formatAs: (value: JsonValue, fmt: "money" | "date" | TextFormatterFunc<JsonValue>) => {
		if (fmt === "money") return fmtMoney(value as string | number);

		if (fmt === "date") return fmtDate(value as string | Date);

		return fmt(value);
	}
}

declare module "lodash" {
	interface LoDashStatic {
		addMonths: typeof addMonths;
		asArray: typeof asArray;
		assert: typeof assert;
		contains: typeof contains;
		dateDiff: typeof dateDiff;
		decodeSearchParams: typeof decodeSearchParams;
		fmtDate: typeof fmtDate;
		fmtMoney: typeof fmtMoney;
		hashObj: typeof hashObj;
		isPast: typeof isPast;
		notEmpty: typeof notEmpty;
		notNil: typeof notNil;
		numberToStr: typeof numberToStr;
		numbers: typeof numbers;
		objToStr: typeof objToStr;
		queue: typeof queue;
		resolve: typeof resolve;
		right: typeof right;
		sqlDate: typeof sqlDate;
		sqlDateTime: typeof sqlDateTime;
		sqlTime: typeof sqlTime;
		strToJson: typeof strToJson;
		strToNumber: typeof strToNumber;
		strToObj: typeof strToObj;
		strToObjs: typeof strToObjs;
		summary: typeof summary;
		time: typeof time;
		toggle: typeof toggle;
		tryDate: typeof tryDate;
		tryEach: typeof tryEach;
		zeros: typeof zeros;
	}
}

_.mixin({
	addMonths,
	asArray,
	assert,
	baseToJson,
	baseToStr,
	blobToBuff,
	buffToStream,
	contains,
	csv,
	dateDecode,
	dateDiff,
	dateISO,
	dateSplit,
	decodeSearchParams,
	fmtDate,
	fmtDateTime,
	fmtMoney,
	fmtNumber,
	fmtTime,
	hashObj,
	isFuture,
	isMonthEnd,
	isMonthStart,
	isPast,
	jsonToBase,
	monthEnd,
	monthStart,
	notEmpty,
	notNil,
	numberToStr,
	numbers,
	objToStr,
	queue,
	replaceAll,
	resolve,
	right,
	sqlDate,
	sqlDateTime,
	sqlTime,
	sqlToday,
	strToBase,
	strToJson,
	strToNumber,
	strToObj,
	strToObjs,
	summary,
	summaryGroup,
	summaryGroupMap,
	time,
	toggle,
	tryDate,
	tryEach,
	tryTime,
	zeros,
});

export default _;
