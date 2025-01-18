"use client";

import {
  InputBase,
  TextInput as MantineTextInput,
  PasswordInput,
  PasswordInputProps,
} from "@mantine/core";

import React from "react";

import { IMaskInput } from "react-imask";

export type MaskExpr = string | "phone" | "cep" | "cpf" | "cpnj";

export interface TextInputProps {
  mask?: MaskExpr;
}

const CustomMasks: Record<string, MaskExpr> = {
  phone: "(99) 99999-9999",
  cep: "99999-999",
  cpf: "999.999.999-99",
  cpnj: "99.999.999/9999-99",
};

export function TextInput({ mask, ...props }: TextInputProps) {
  const iMask = mask ? CustomMasks[mask] || mask : undefined;

  return iMask ? (
    <InputBase mask={iMask} component={IMaskInput} {...props} />
  ) : (
    <MantineTextInput {...props} />
  );
}

export type SecretInputProps = PasswordInputProps;

export function SecretInput(props: SecretInputProps) {
  return <PasswordInput {...props} />;
}
