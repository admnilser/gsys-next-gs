import { type NextRequest, NextResponse } from "next/server";

import { getServerSession } from "next-auth";

import type { Dictionary, Entity, QueryWhere } from "@next-gs/utils/types";

import fn from "@next-gs/utils/funcs";

import { createRepository, type Repository } from "./repository";

import type { Model } from "./model";

export type RequestQuery = Dictionary<string>;
export type RequestBody = object;

export type GetRequestQuery = RequestQuery & {
	_q?: QueryWhere;
	_f?: boolean;
};

export type PostRequestBody = Entity | Entity[];

export interface ModelHandlerParams {
	repo: string;
	res: string;
	id?: string;
}

function modelHandler<Q extends RequestQuery, B extends RequestBody>(
	callback: (props: {
		repo: Repository;
		model: Model;
		params: ModelHandlerParams;
		query: Q;
		body?: B;
	}) => Promise<object | void>,
) {
	return async (
		req: NextRequest,
		{ params }: { params: Promise<{ repo: string, res: string[] }> },
	) => {
		try {
			const p = await params;

			const [res, id] = p.res;

			const session = await getServerSession();

			if (!session) {
				return NextResponse.redirect(`/${p.repo}/admin/signin`);
			}

			const repo = await createRepository(p.repo, session.user, 0);

			const json = await callback({
				repo,
				model: repo.createModel(res) as Model,
				params: { repo: p.repo, res, id },
				query: fn.decodeSearchParams<Q>(req.nextUrl.searchParams),
				body: req.body as B,
			});

			return NextResponse.json(json || {});
		} catch (error) {
			console.error(error);
			return NextResponse.json({ error }, { status: 500 });
		}
	};
}

export function AdminHandlers() {
	const GET = modelHandler<GetRequestQuery, never>(
		async ({ model, params, query }) => {
			const { id } = params;
			const { _f, _q } = query;

			if (fn.notNil(id)) {
				const object = await model.findOne(id, _f);
				return object ? { object } : undefined;
			}

			return await model.findMany({ ...(_q || {}), full: _f });
		},
	);

	const POST = modelHandler<never, PostRequestBody>(async ({ model, body }) => {
		if (body) {
			return Array.isArray(body)
				? await model.updateMany(body)
				: await model.updateOne(body);
		}
		throw new Error("Empty request body");
	});

	const DELETE = modelHandler<RequestQuery, never>(async ({ model, query }) => {
		const { _id } = query;

		if (Array.isArray(_id)) return await model.removeMany(_id);

		if (_id) return await model.removeOne(_id);

		throw new Error("Resource not found");
	});

	return { GET, POST, DELETE };
}
