import _ from "@next-gs/utils/funcs";

export const OPERATORS = {
	_lk: "LIKE",
	_like: "LIKE",
	_lte: "<=",
	_lt: "<",
	_gte: ">=",
	_gt: ">",
	_eq: "=",
	_in: "IN",
	_bta: "&",
	_bto: "|",
};

export function extract(str: string) {
	const res = { f: str, o: "=" };

	_.forEach(OPERATORS, (val, key) => {
		if (str.startsWith(key)) {
			res.f = str.substring(key.length);
			res.o = val;
			return false; // breaks loop
		}
	});

	return res;
}
