"use client";

import React from "react";

import type { __BaseInputProps } from "@mantine/core";

import type { Awaitable, JsonValue } from "@next-gs/client";

export type ValidatorFunc = (
	value: JsonValue,
	others?: FormValues,
) => string | undefined;

export interface FormFieldOptions {
	name: string;
	required?: boolean;
	readonly?: boolean;
	touched?: boolean;
	error?: string;
	initial?: JsonValue;
	validate?: ValidatorFunc;
}

export type FormFields<FV extends FormValues> = Record<
	keyof FV,
	FormFieldOptions
>;

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type FormInputConverter<P = any, R = any> = (value: P) => R;

export interface FormInputOptions extends FormFieldOptions {
	label?: string;
	initial?: JsonValue;
	disabled?: boolean;
	parse?: FormInputConverter;
	format?: FormInputConverter;
}

export interface FormInputState extends FormInputOptions {
	value: JsonValue;
	onChange: (value: JsonValue) => void;
	onBlur: () => void;
	onFocus: () => void;
}

export type FormValues = Record<string, JsonValue>;

export type FormErrors<FV extends FormValues> = Record<keyof FV, string>;

export type FormSubmitResult<FV extends FormValues> =
	Awaitable<FormErrors<FV> | void>;

export interface FormState<FV extends FormValues> {
	values: FV;
	submitting: boolean;
	valid: boolean;
}

export const FormContext = React.createContext({});

export type FormProviderProps<FV extends FormValues> =
	React.PropsWithChildren & { form: FormState<FV> };

export function FormProvider<FV extends FormValues>({
	form,
	children,
}: FormProviderProps<FV>) {
	return <FormContext.Provider value={form}>{children}</FormContext.Provider>;
}
