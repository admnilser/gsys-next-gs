import { Group } from "@mantine/core";
import { Entity, EntityService } from "../../model/entity";

import { IconButton } from "../ui/Buttons";

import { DropDown, DropDownItem } from "../ui/DropDown";

import {
  Form,
  FormBody,
  FormButton,
  FormFoot,
  FormHead,
  FormProps,
  FormSubmit,
  FormValues,
} from "../ui/Form";

export interface EntityFormProps<E extends Entity> extends FormProps {
  service: EntityService<E>;
  actions?: DropDownItem[];
  onCancel: () => void;
}

export function EntityForm<E extends Entity>({
  service,
  children,
  onCancel,
  actions,
  ...props
}: EntityFormProps<E>) {
  const values = (service.item || {}) as FormValues;

  const id = values.id;

  const create = id === undefined;

  return (
    <Form values={values} {...props}>
      <FormHead
        icon={create ? "star" : "pencil"}
        title={`${create ? "Novo" : "Editar"} ${service.res.title.singular}`}
      />
      <FormBody>
        <input type="hidden" name="id" value={id || ""} />
        {children}
      </FormBody>
      <FormFoot justify="space-between">
        <Group>
          <FormSubmit leftIcon="save">Salvar</FormSubmit>
          <FormButton
            variant="subtle"
            leftIcon="ban"
            color="red"
            onClick={onCancel}>
            Cancelar
          </FormButton>
        </Group>
        {actions && (
          <DropDown items={actions}>
            <IconButton icon="more" size="sm" />
          </DropDown>
        )}
      </FormFoot>
    </Form>
  );
}
