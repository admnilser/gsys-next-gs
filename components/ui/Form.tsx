"use client";

import {
  Alert,
  AlertProps,
  BoxProps,
  Drawer,
  Group,
  GroupProps,
  Modal,
  LoadingOverlay,
  Text,
  Divider,
  Stack,
} from "@mantine/core";

import { createFormContext, FormErrors } from "@mantine/form";

import { fetchJson } from "../../utils/fetch";

import { Button, ButtonProps } from "./Buttons";

import { Icon, IconName } from "./Icon";

import { SecretInput, TextInput, TextInputProps } from "./Inputs";

import { ImageInput } from "./ImageInput";

export type FormValues = Record<string, string | number | null | undefined>;

const [FormProvider, useFormContext, useForm] = createFormContext<FormValues>();

export interface FormProps extends React.PropsWithChildren {
  values?: FormValues;
  action?: string;
  onSubmit?: (values: FormValues) => Promise<FormErrors | void>;
  onSubmited?: (values: FormValues) => void;
  onValidate?: (values: FormValues) => FormErrors;
}

export function Form({
  action,
  values,
  children,
  onSubmit,
  onSubmited,
  onValidate,
}: FormProps) {
  const form = useForm({
    mode: "uncontrolled",
    initialValues: values || {},
    validate: onValidate,
  });

  const handleSubmit = async (values: FormValues) => {
    let errors: FormErrors | undefined | void;

    if (onSubmit) {
      errors = await onSubmit(values);
    } else if (action) {
      const resp = await fetchJson<FormValues, { errors: FormErrors }>({
        path: action,
        method: "POST",
        data: values,
      });
      errors = resp.errors;
    }

    if (errors) form.setErrors(errors);
    else if (onSubmited) onSubmited(values);
  };

  return (
    <FormProvider form={form}>
      <form onSubmit={form.onSubmit(handleSubmit)}>{children}</form>
    </FormProvider>
  );
}

export interface FormHeadProps extends React.PropsWithChildren<GroupProps> {
  icon?: IconName;
  title?: string;
}

export function FormHead({ icon, title, children }: FormHeadProps) {
  return (
    <Text component={Group} className="bb" p="sm" fw={500}>
      {children || (
        <>
          {icon && <Icon name={icon} />}
          {title}
        </>
      )}
    </Text>
  );
}

export type FormBodyProps = React.PropsWithChildren<BoxProps>;

export function FormBody({ children }: FormBodyProps) {
  const { submitting } = useFormContext();
  return (
    <Stack p="xs" gap="xs">
      <LoadingOverlay visible={submitting} />
      {children}
    </Stack>
  );
}

export type FormFootProps = React.PropsWithChildren<GroupProps>;

export function FormFoot({ children, ...props }: FormFootProps) {
  return (
    <>
      <Divider my="sm" />
      <Group p="xs" {...props}>
        {children}
      </Group>
    </>
  );
}

export function FormButton(props: ButtonProps) {
  return <Button {...props} />;
}

export function FormSubmit({ children, ...props }: ButtonProps) {
  return (
    <FormButton type="submit" {...props}>
      {children || "Salvar"}
    </FormButton>
  );
}

export type FormFieldType = "text" | "secret" | "check" | "combo" | "image";

export type FormFieldProps = TextInputProps & {
  type: FormFieldType;
  name: string;
  label?: string;
  placeholder?: string;
};

export const FormFieldInputs: Record<FormFieldType, any> = {
  text: TextInput,
  secret: SecretInput,
  check: TextInput,
  combo: TextInput,
  image: ImageInput,
};

export function FormField({ type, name, ...rest }: FormFieldProps) {
  const form = useFormContext();
  const InputComponent = FormFieldInputs[type] as React.FC<any>;
  return <InputComponent {...rest} {...form.getInputProps(name)} />;
}

export interface FormErrorProps extends AlertProps {
  error?: string | null;
}

export function FormError({ error, ...rest }: FormErrorProps) {
  return error ? (
    <Alert
      variant="light"
      color="red"
      title="Erro"
      icon={<Icon name="ban" />}
      withCloseButton
      {...rest}>
      {error}
    </Alert>
  ) : null;
}

export type FormSceneType = "drawer" | "modal";

export interface FormSceneProps extends React.PropsWithChildren {
  type?: FormSceneType;
  opened: boolean;
  onClose: () => void;
}

export function FormScene({ type, opened, onClose, children }: FormSceneProps) {
  const mounted = Boolean(opened && children);

  if (type === "drawer") {
    return (
      <Drawer
        opened={mounted}
        onClose={onClose}
        withCloseButton={false}
        position="right">
        {children}
      </Drawer>
    );
  }

  if (type === "modal") {
    return (
      <Modal opened={mounted} onClose={onClose} withCloseButton={false}>
        {children}
      </Modal>
    );
  }

  return children;
}
