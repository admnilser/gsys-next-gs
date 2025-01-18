import React from "react";

import {
  FormBody,
  Form,
  FormHead,
  FormProps,
  FormFoot,
  FormButton,
  FormScene,
} from "../ui/Form";

export interface FilterFormProps extends React.PropsWithChildren<FormProps> {
  title: string;
  opened: boolean;
  onClose: () => void;
}

export function FilterForm({
  title,
  opened,
  children,
  onSubmit,
  onClose,
  ...rest
}: FilterFormProps) {
  return (
    <FormScene type="modal" opened={opened} onClose={onClose}>
      <Form onSubmit={onSubmit} {...rest}>
        <FormHead icon="filter" title={title} />
        <FormBody>{children}</FormBody>
        <FormFoot>
          <FormButton type="submit" leftIcon="filter">
            Filtrar
          </FormButton>
          <FormButton
            variant="subtle"
            leftIcon="ban"
            color="red"
            onClick={onClose}>
            Cancelar
          </FormButton>
        </FormFoot>
      </Form>
    </FormScene>
  );
}
