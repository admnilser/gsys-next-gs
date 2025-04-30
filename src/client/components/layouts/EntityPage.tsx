import type React from "react";

import {
	FormScene,
	useStoreResource,
	type Entity,
	type EntityID,
	type ResourceRef,
	type FormSceneType,
	type FormErrors,
} from "@next-gs/client";

import type { EntityFormProps } from "./EntityForm";
import type { EntityListProps } from "./EntityList";

export type EntityPageListProps<E extends Entity> = Omit<
	EntityListProps<E>,
	"columns"
>;

export type EntityPageFormProps<E extends Entity> = EntityFormProps<E>;

export interface EntityPageProps<E extends Entity> {
	resource: ResourceRef<E>;
	selected?: EntityID;
	list: React.ComponentType<EntityPageListProps<E>>;
	form?: React.ComponentType<EntityPageFormProps<E>>;
	formScene?: FormSceneType;
}

export function EntityPage<E extends Entity>({
	resource,
	list: List,
	form: Form,
	formScene = "modal",
}: EntityPageProps<E>) {
	const service = useStoreResource(resource);

	const clearAdminItem = () => {
		service.select(undefined);
	};

	const handleSubmit = async (values) => {
		const { error, errors } = await service.persist(values);
		if (!error) clearAdminItem();
		return errors as FormErrors<E>;
	};

	const form =
		service.item && Form ? (
			<Form
				values={service.item}
				entityName={service.res.title.simple}
				onSubmit={handleSubmit}
				onCancel={clearAdminItem}
			/>
		) : null;

	return (
		<>
			{(!form || formScene !== "normal") && <List service={service} />}

			<FormScene
				type={formScene}
				opened={form !== null}
				onClose={clearAdminItem}
			>
				{form}
			</FormScene>
		</>
	);
}
