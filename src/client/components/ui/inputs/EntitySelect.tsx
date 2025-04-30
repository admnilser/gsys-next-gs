"use client";

import React from "react";

import {
	fn,
	type UseLookupProps,
	type Entity,
	type EntityID,
	type QuerySortBy,
	useLookup,
	useDelay,
} from "@next-gs/client";

import { Button } from "../Buttons";

import { Reference } from "../Reference";

import { LabelInput } from "./Label";

import {
	SelectInput,
	type SelectInputProps,
	type SelectOption,
} from "./Select";

export type EntitySelectInputProps<E extends Entity> = Omit<
	UseLookupProps<E, SelectOption>,
	"converter"
> &
	Omit<SelectInputProps<E>, "items" | "filter"> & {
		keyAttr: keyof E;
		txtAttr: keyof E;
		disableInsert?: boolean;
		readOnly?: boolean;
		onInsert?: (value: string) => void;
		onSelect?: (value: E) => E;
	};

export const EntitySelectInput = <E extends Entity>({
	resource,
	keyAttr = "id",
	txtAttr,
	autoFetch,
	readOnly = false,
	value,
	onChange,
	onInsert,
	onSelect,
	...rest
}: EntitySelectInputProps<E>) => {
	if (readOnly)
		return (
			<Reference
				{...{
					resource,
					txtAttr,
					value: value as EntityID,
					render: ({ text }) => <LabelInput value={text} />,
				}}
			/>
		);

	const itemRef = React.useRef<SelectOption | null>(null);

	const [search, setSearch] = React.useState("");

	const { items, fetchData, ...selectProps } = useLookup<E, SelectOption>({
		autoFetch,
		resource,
		sortBy: { [txtAttr]: "asc" } as QuerySortBy<E>,
		converter: (item) => ({
			value: `${item[keyAttr]}`,
			label: txtAttr
				? fn.isFunction(txtAttr)
					? txtAttr(item)
					: item[txtAttr]
				: "",
			data: item,
		}),
		...rest,
	});

	const lazySearch = useDelay((_q?: string) => {
		if (fn.size(_q) > 2) fetchData({ _q });
	}, 300);

	React.useEffect(() => {
		if (autoFetch || fn.isNil(value)) {
			itemRef.current = null;
			return;
		}

		const item = fn.find(items, ["value", value]);

		itemRef.current = item ?? { value: fn.toString(value), label: "" };

		if (!item) fetchData({ [keyAttr]: value });
	}, [value]);

	React.useEffect(() => {
		if (!autoFetch && search !== itemRef.current?.label) {
			lazySearch(search);
		}
	}, [autoFetch, search]);

	return (
		<SelectInput
			items={items}
			value={value}
			onChange={(val, opt) => {
				itemRef.current = opt;
				onChange?.(val, opt);
			}}
			onSearchChange={setSearch}
			nothingFoundMessage={
				onInsert ? (
					<Button
						variant="subtle"
						leftIcon="plus"
						onClick={() => onInsert(search)}
						fullWidth
					>
						{`Adicionar "${search}"`}
					</Button>
				) : (
					"Nenhum registro encontrado"
				)
			}
			withCheckIcon={false}
			searchable
			{...selectProps}
		/>
	);
};
