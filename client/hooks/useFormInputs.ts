"use client"

import React from "react";

import { useForm, type UseFormProps } from "./useForm";

import { TextInput } from "../components/ui/inputs/Text";

import type { FormInputOptions, FormValues } from "@next-gs/client/context/form";

export const useFormInputs = <FV extends FormValues>(
  props: UseFormProps<FV>,
) => {
  const { registerInput, ...state } = useForm<FV>(props);
  return {
    ...state,
    invalid: !state.valid,
    render: (
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      component: any,
      props: FormInputOptions,
    ) => {
      const { value, ...inputProps } = registerInput(props);

      const Component = component || TextInput;

      return React.createElement(Component, {
        ...inputProps,
        value,
      });
    },
  };
};
