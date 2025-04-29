import type { Dictionary, JsonValue } from "./types";

import _ from "./funcs";

export type FetchQuery = Dictionary<JsonValue>;

export type FetchMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export type FetchParams<B> = {
	path: string;
	data?: B;
	query?: FetchQuery;
	method?: FetchMethod;
};

function queryToStr(query?: FetchQuery) {
	if (!query) return "";

	const obj = _.reduce<FetchQuery, Dictionary<string>>(
		query,
		(o, v, k) => {
			o[k] = JSON.stringify(v);
			return o;
		},
		{},
	);
	return `?${new URLSearchParams(obj).toString()}`;
}

export async function fetchJson<B, R>({
	path,
	data,
	query,
	method,
}: FetchParams<B>): Promise<R> {
	const resp = await fetch(`${path}${queryToStr(query)}`, {
		body: JSON.stringify(data),
		headers: {
			"Content-Type": "application/json",
		},
		method,
	});
	return await resp.json();
}

export type FetchJsonFunc = typeof fetchJson;

export type Fetch = {
	get: FetchJsonFunc;
	post: FetchJsonFunc;
	put: FetchJsonFunc;
	patch: FetchJsonFunc;
	del: FetchJsonFunc;
};

const createFetchMethod =
	(prefix: string, method: FetchMethod) =>
	<B, R>({ path, ...params }: FetchParams<B>) =>
		fetchJson<B, R>({ path: `${prefix}${path}`, ...params, method });

export function useFetch(prefix: string) {
	const get = createFetchMethod(prefix, "GET");
	const post = createFetchMethod(prefix, "POST");
	const put = createFetchMethod(prefix, "PUT");
	const patch = createFetchMethod(prefix, "PATCH");
	const del = createFetchMethod(prefix, "DELETE");
	return { get, post, put, patch, del };
}
