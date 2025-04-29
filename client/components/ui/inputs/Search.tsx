"use client";

import React from "react";

import {
	Input,
	CloseButton,
	Loader,
	type InputProps,
	type PolymorphicComponentProps,
} from "@mantine/core";

import { useTimeout } from "@mantine/hooks";

export type SearchInputProps<C = "input"> = PolymorphicComponentProps<
	C,
	InputProps
> & {
	loading?: boolean;
	delay?: number;
	value?: string;
	onSearch: (value: string) => Promise<void>;
};

export function SearchInput({
	loading,
	delay = 350,
	value,
	onSearch,
	...props
}: SearchInputProps) {
	const [search, setSearch] = React.useState<string>(value || "");

	const searchText = (text: string) => onSearch(text);

	const { start, clear } = useTimeout(([text]) => searchText(text), delay);

	function handleChange(value: string, imediate?: boolean) {
		setSearch(value);
		if (delay && !imediate) {
			clear();
			start(value);
		} else {
			searchText(value);
		}
	}

	return (
		<Input
			value={search}
			onChange={(event) => handleChange(event.currentTarget.value)}
			leftSection={loading ? <Loader size="xs" /> : undefined}
			rightSectionPointerEvents="all"
			rightSection={
				<CloseButton
					aria-label="Limpar"
					onClick={() => handleChange("", true)}
					style={{ display: search ? undefined : "none" }}
				/>
			}
			{...props}
		/>
	);
}
