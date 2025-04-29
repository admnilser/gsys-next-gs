"use client";

import React from "react";

import { SessionProvider } from "next-auth/react";

import { Provider } from "react-redux";

import { PersistGate } from "redux-persist/integration/react";

import {
	fn,
	persistor,
	store,
	useFetch,
	useParams,
	type AdminActions,
	type AdminPageProps,
	type Dictionary,
	type Entity,
	type EntityID,
	type IconName,
	type Query,
	type RepoActionResult,
	type RepoDestroyParams,
	type RepoDestroyResult,
	type RepoFindManyResult,
	type RepoFindOneResult,
	type RepoPersistParams,
	type RepoPersistResult,
	type Resource,
	type ResourceRef,
	type Fetch,
} from "@next-gs/client";

const parseAdminResponse = <R extends RepoActionResult>(resp: R) => {
	if (resp.error) {
		throw new Error(resp.error.message);
	}
	return resp;
};

const createAdminService = (api: Fetch): AdminActions => ({
	getList: <E extends Entity, R>(res: string, qry: Query<E>) =>
		api
			.get<never, RepoFindManyResult<E>>({
				path: `/admin/${res}`,
				query: { _q: qry },
			})
			.then(parseAdminResponse),

	getOne: <E extends Entity>(res: string, _id: EntityID) =>
		api
			.get<never, RepoFindOneResult<E>>({
				path: `/admin/${res}/${_id}`,
			})
			.then(parseAdminResponse),

	getMany: <E extends Entity>(res: string, _inid: EntityID[]) =>
		api
			.get<never, RepoFindManyResult<E>>({
				path: `/admin/${res}`,
				query: { _inid },
			})
			.then(parseAdminResponse),

	persist: <E extends Entity>(res: string, data: RepoPersistParams<E>) =>
		api.post<typeof data, RepoPersistResult<E>>({
			path: `/admin/${res}`,
			data,
		}),

	destroy: <E extends Entity>(res: string, _id: RepoDestroyParams) =>
		api
			.del<never, RepoDestroyResult<E>>({
				path: `admin/${res}`,
				query: { _id },
			})
			.then(parseAdminResponse),

	execute: <B, R extends RepoActionResult>(
		res: string,
		method: string,
		args: string[],
	) =>
		api
			.post<{ args: typeof args }, R>({
				path: `admin/${res}/call/${method}`,
				data: { args },
			})
			.then(parseAdminResponse),
});

export class AdminStorage {
	constructor(private repo: string) {}

	get<R>(key: string, def: R): R {
		return null as R;
	}
	set<V>(key: string, value: V) {}

	remItem(key: string) {}
}

export class AdminConfig {
	private data: Dictionary<string> = {};

	constructor(private api: Fetch) {}

	get = (key: string) => this.data[key];

	set = (key: string, value: string) => {
		//api.setConfig(key, value).then(() => this);
		this.data[key] = value;
	};

	reload = async () => {
		return this.data;
	};
}

export type AdminResource<E extends Entity> = Resource<E> & {
	icon: IconName;
	page: React.ComponentType<AdminPageProps>;
};

export type AdminResources<K extends string = string> = Record<
	K,
	AdminResource<Entity>
>;

export type AdminContextState = {
	repo: string;
	actions: AdminActions;
	config: AdminConfig;
	storage: AdminStorage;
	loading: boolean;
	getResource: <E extends Entity>(ref: ResourceRef<E>) => AdminResource<E>;
};

export const AdminContext = React.createContext<AdminContextState | null>(null);

export type AdminProviderProps = React.PropsWithChildren & {
	resources: AdminResources;
};

export function AdminProvider({ resources, children }: AdminProviderProps) {
	const { repo } = useParams();

	if (!repo) {
		throw new Error(
			"Repository not found.\nYou need to define a data repository's name to use model service",
		);
	}

	const [loading, setLoading] = React.useState(true);

	const api = useFetch(`/api/${repo}`);

	const [actions, storage, config] = React.useMemo(() => {
		return [
			createAdminService(api),
			new AdminStorage(repo),
			new AdminConfig(api),
		] as const;
	}, [repo]);

	const getResource = <E extends Entity>(ref: ResourceRef<E>) => {
		return (fn.isString(ref) ? resources[ref] : ref) as AdminResource<E>;
	};

	React.useEffect(() => {
		config.reload().then((data) => {
			setLoading(false);
		});
	}, []);

	return (
		<SessionProvider basePath={`/api/${repo}/auth`}>
			<Provider store={store}>
				<PersistGate loading={null} persistor={persistor}>
					<AdminContext.Provider
						value={{
							repo,
							actions,
							config,
							storage,
							loading,
							getResource,
						}}
					>
						{children}
					</AdminContext.Provider>
				</PersistGate>
			</Provider>
		</SessionProvider>
	);
}
