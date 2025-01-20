import React from "react";

import { Entity, EntityID } from "../../model/entity";

import { Resource } from "../../model/resource";
import { useEntityService } from "../../model/service";

import { FormScene, FormSceneType, FormValues } from "../ui/Form";

import notify from "../../utils/notifiy";

import { EntityFormProps } from "./EntityForm";
import { EntityListProps } from "./EntityList";

export type EntityPageListProps<E extends Entity> = Omit<
  EntityListProps<E>,
  "columns"
>;

export type EntityPageFormProps<E extends Entity> = EntityFormProps<E>;

export interface EntityPageProps<E extends Entity> {
  resource: Resource<E>;
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
  const service = useEntityService<E>(resource);

  const clearServiceItem = () => {
    service.select(undefined);
  };

  const handleSubmit = async (values: FormValues) => {
    const result = await service.persist(values as Partial<E>);
    if (result.error) {
      notify.error(result.error.message);
    } else {
      clearServiceItem();
      notify.info(`${service.res.title.singular} salvo com sucesso!`);
    }
    return result.errors;
  };

  const form =
    service.item && Form ? (
      <Form
        service={service}
        onSubmit={handleSubmit}
        onCancel={clearServiceItem}
      />
    ) : null;

  return (
    <>
      <List service={service} />

      <FormScene
        type={formScene}
        opened={form !== null}
        onClose={clearServiceItem}>
        {form}
      </FormScene>
    </>
  );
}
