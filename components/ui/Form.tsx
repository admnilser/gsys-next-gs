"use client";

import {
  Alert,
  AlertProps,
  Box,
  BoxProps,
  Drawer,
  Group,
  GroupProps,
  Modal,
  LoadingOverlay,
  Text,
  Divider,
} from "@mantine/core";

import { createFormContext, FormErrors } from "@mantine/form";

import { Button, ButtonProps } from "./Buttons";

import { Icon, IconName } from "./Icon";

import { SecretInput, TextInput, TextInputProps } from "./Inputs";

import { ImageInput } from "./ImageInput";

export type FormValues = Record<string, string | number | null | undefined>;

const [FormProvider, useFormContext, useForm] = createFormContext<FormValues>();

export interface FormProps {
  values?: FormValues;
  children?: React.ReactNode;
  onSubmit: (values: FormValues) => Promise<FormErrors | void>;
  onValidate?: (values: FormValues) => FormErrors;
}

export function Form({ values, children, onSubmit, onValidate }: FormProps) {
  const form = useForm({
    mode: "uncontrolled",
    initialValues: values || {},
    validate: onValidate,
  });

  const handleSubmit = async (values: FormValues) => {
    if (onSubmit) {
      const errors = await onSubmit(values);
      if (errors) form.setErrors(errors);
    }
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
    <Box p="sm">
      <LoadingOverlay visible={submitting} />
      {children}
    </Box>
  );
}

export type FormFootProps = React.PropsWithChildren<GroupProps>;

export function FormFoot({ children, ...props }: FormFootProps) {
  return (
    <>
      <Divider my="sm" />
      <Group {...props}>{children}</Group>
    </>
  );
}

export function FormButton(props: ButtonProps) {
  return <Button {...props} />;
}

export function FormSubmit(props: ButtonProps) {
  return <FormButton {...props} type="submit" />;
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
