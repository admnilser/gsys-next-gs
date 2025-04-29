"use client";

import React from "react";

import {
	Loader,
	Select,
	type ComboboxData,
	type ComboboxItem,
	type SelectProps,
} from "@mantine/core";

import fn from "@next-gs/utils/funcs";

export type SelectOption = ComboboxItem;

export type SelectItem = SelectOption | string;

export type SelectValue = string;

export type OmitSelectInputProps = Omit<
	SelectProps,
	"items" | "value" | "onChange"
>;

export type SelectInputProps<
	T = SelectItem,
	V = SelectValue,
> = OmitSelectInputProps & {
	items: T[];
	value?: V;
	loading?: boolean;
	onChange?:
		| ((val: V | undefined) => void)
		| ((val: V | undefined, opt: SelectOption) => void);
	parse?: (opt: T) => SelectItem;
	format?: (opt: SelectOption) => V;
};

export function SelectInput<T, V>({
	loading,
	items,
	value,
	parse,
	format,
	onChange,
	...props
}: SelectInputProps<T, V>) {
	const data = React.useMemo(() => {
		return items.map((item) => {
			if (parse) return parse(item);
			return item;
		}) as ComboboxData;
	}, [items, parse]);

	const handleChange = (val: string | null, opt: SelectOption) => {
		const value = opt ? (format ? format(opt) : (val as V)) : undefined;
		onChange?.(value, opt);
	};

	return (
		<Select
			data={data}
			value={fn.toString(value)}
			onChange={handleChange}
			rightSection={loading ? <Loader size="xs" /> : undefined}
			{...props}
		/>
	);
}
