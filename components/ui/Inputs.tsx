"use client";

import {
  __BaseInputProps,
  InputBase,
  TextInput as ManTextInput,
  TextInputProps as ManTextInputProps,
  PasswordInput,
} from "@mantine/core";

import React from "react";

import { IMaskInput } from "react-imask";

import { Icon, IconName } from "./Icon";

export type MaskExpr = string | "phone" | "cep" | "cpf" | "cpnj";

export interface TextInputProps extends Omit<ManTextInputProps, "value"> {
  mask?: MaskExpr;
  component?: React.ComponentType<__BaseInputProps>;
  leftIcon?: IconName;
  rightIcon?: IconName;
}

const CustomMasks: Record<string, MaskExpr> = {
  phone: "(99) 99999-9999",
  cep: "99999-999",
  cpf: "999.999.999-99",
  cpnj: "99.999.999/9999-99",
};

export function TextInput({
  mask,
  component: Component = ManTextInput,
  leftIcon,
  rightIcon,
  ...props
}: TextInputProps) {
  const iMask = mask ? CustomMasks[mask] || mask : undefined;

  props.leftSection = leftIcon ? <Icon name={leftIcon} /> : undefined;
  props.rightSection = rightIcon ? <Icon name={rightIcon} /> : undefined;

  return iMask ? (
    <InputBase mask={iMask} component={IMaskInput} {...props} />
  ) : (
    <Component {...props} />
  );
}

export function SecretInput(props: TextInputProps) {
  return <TextInput component={PasswordInput} {...props} />;
}
