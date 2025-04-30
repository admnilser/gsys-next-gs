"use client";

import type { EnumType, EnumItem, EnumValue } from "@next-gs/utils/enums";

import { SelectInput, type SelectInputProps } from "./Select";

export type EnumSelectInputProps<V extends EnumValue> = Omit<
	SelectInputProps<EnumItem<V>, V>,
	"items" | "parse" | "format"
> & {
	enumType: EnumType<V>;
};

export function EnumSelectInput<V extends EnumValue>({
	enumType,
	...props
}: EnumSelectInputProps<V>) {
	return (
		<SelectInput
			items={enumType.items}
			parse={(item) => ({ value: `${item.value}`, label: item.text })}
			{...props}
		/>
	);
}
