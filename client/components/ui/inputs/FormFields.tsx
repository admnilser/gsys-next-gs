"use client";

import type React from "react";

import type { Entity, EnumValue } from "@next-gs/client";

import { CheckInput, type CheckInputProps } from "./Check";
import { CheckListInput, type CheckListInputProps } from "./CheckList";
import { DateInput, type DateInputProps } from "./Date";
import { DetailInput, type DetailInputProps } from "./Detail";
import { EntitySelectInput, type EntitySelectInputProps } from "./EntitySelect";
import { EnumSelectInput, type EnumSelectInputProps } from "./EnumSelect";
import { FileInput, type FileInputProps } from "./File";
import { LabelInput, type LabelInputProps } from "./Label";
import { MemoInput, type MemoInputProps } from "./Memo";
import { NumberInput, MoneyInput, type NumberInputProps } from "./Numeric";
import { SecretInput } from "./Secret";
import { SelectInput, type SelectInputProps } from "./Select";
import { SpinInput, type SpinInputProps } from "./Spin";
import { TableInput, type TableInputProps } from "./Table";
import { TextInput, type TextInputProps } from "./Text";
import { ZipCodeInput, type ZipCodeInputProps } from "./ZipCode";

import {
	FormField,
	type FormFieldProps,
	type FormFieldInputProps,
} from "./Form";

export type FormFieldEntitySelectProps<E extends Entity> = FormFieldProps<
	EntitySelectInputProps<E>
>;

export type FormFieldEntitySelectInputProps<E extends Entity> =
	EntitySelectInputProps<E>;

export type FormFieldEnumProps = FormFieldProps<
	EnumSelectInputProps<EnumValue>
>;

export type FormFieldTextProps = FormFieldProps<TextInputProps>;

export type FormFieldDetailProps<DI extends {}> = FormFieldProps<
	DetailInputProps<DI>
>;

export function createField<P>(component: React.ComponentType<P>) {
	return ({ input, ...props }: FormFieldProps<P>) => (
		<FormField
			input={{ ...input, component } as FormFieldInputProps<P>}
			{...props}
		/>
	);
}

export function createSelectField<T, V>() {
	return createField<SelectInputProps<T, V>>(SelectInput<T, V>);
}

export function createEntitySelectField<E extends Entity>() {
	return createField<EntitySelectInputProps<E>>(EntitySelectInput<E>);
}

export const FormFieldText = createField<TextInputProps>(TextInput);

export const FormFieldSecret = createField<TextInputProps>(SecretInput);

export const FormFieldFile = createField<FileInputProps>(FileInput);

export const FormFieldMoney = createField<NumberInputProps>(MoneyInput);

export const FormFieldNumber = createField<NumberInputProps>(NumberInput);

export const FormFieldMemo = createField<MemoInputProps>(MemoInput);

export const FormFieldLabel = createField<LabelInputProps>(LabelInput);

export const FormFieldDate = createField<DateInputProps>(DateInput);

export const FormFieldDetail = createField<DetailInputProps>(DetailInput);

export const FormFieldCombo = createField<SelectInputProps>(SelectInput);

export const FormFieldCheck = createField<CheckInputProps>(CheckInput);

export const FormFieldCheckList =
	createField<CheckListInputProps>(CheckListInput);

export const FormFieldEnum =
	createField<EnumSelectInputProps<EnumValue>>(EnumSelectInput);

export const FormFieldZipCode = createField<ZipCodeInputProps>(ZipCodeInput);

export const FormFieldTable = createField<TableInputProps>(TableInput);

export const FormFieldSpin = createField<SpinInputProps>(SpinInput);
