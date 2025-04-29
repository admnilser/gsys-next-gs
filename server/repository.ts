import { Connector } from "../utils/knex";

import type { UserCredentials, User } from "./auth";

import type { JsonValue } from "@next-gs/client";

import type {
	IModel,
	IRepository,
	ModelReference,
	RepoConfig,
	StorableUser,
} from "./types";

export class Repository<U extends User = User> extends Connector implements IRepository {

	public user: U | undefined;
	public shop: number | undefined;

	config(config: RepoConfig<U>) {
		this.createModel = config.createModel.bind(this);
		this.generateId = config.generateId.bind(this);
		this.initialize = config.initialize.bind(this);
		this.evaluate = config.evaluate.bind(this);
		this.storeBlob = config.storeBlob.bind(this);
		this.checkUser = config.checkUser.bind(this);
		this.storeUser = config.storeUser.bind(this);
	}

	createModel!: (ref: ModelReference) => IModel;
	generateId!: (gen: string) => Promise<number>;
	initialize!: (name: string) => Promise<void>;
	evaluate!: (expr: string, def: JsonValue) => JsonValue;
	storeBlob!: (blob: string) => JsonValue;
	checkUser!: (arg: string | UserCredentials) => Promise<U | null>;
	storeUser!: (user: StorableUser) => Promise<U | null>;
}

export type RepositoryFactory<U extends User> = (
	name: string,
	user?: U,
	shop?: number,
) => Promise<Repository<U>>;

export type RepositoryBuilder<U extends User> = (
	repo: Repository<U>,
) => RepoConfig<U>;

export let createRepository: RepositoryFactory<User>;

export function configRepository<U extends User>(
	builder: RepositoryBuilder<U>,
) {
	createRepository = (async (name: string, user?: U, shop?: number) => {
		const repo = new Repository<U>();
		repo.user = user;
		repo.shop = user?.shop || shop || 0;
		repo.config(builder(repo));
		await repo.initialize(name);
		return repo;
	}) as RepositoryFactory<User>;
}
