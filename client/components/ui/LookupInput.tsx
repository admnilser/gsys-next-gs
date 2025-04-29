import React from "react";

import { ComboboxItem, Loader, Select } from "@mantine/core";
import { useTimeout } from "@mantine/hooks";

import { Entity, EntityID, Resource } from "@next-gs/client";

import { useAdmin } from "@next-gs/client/hooks/useAdmin";

import _ from "@next-gs/utils/funcs";

export interface LookupProps<E extends Entity> {
	resource: Resource;
	value?: EntityID | null;
	onChange?: (value: EntityID | null, entity: E | null) => void;
}

export function useLookup<E extends Entity>({
	resource,
	value: initialValue,
	onChange,
}: LookupProps<E>) {
	const admin = useAdmin(resource);

	const [value, setValue] = React.useState<E | null>(null);

	const [search, setSearch] = React.useState<string>("");

	const [items, setItems] = React.useState<ComboboxItem[]>([]);

	const getEntityName = (e: E) => _.get(e, [admin.res.nameField], "") as string;

	const findByTerm = (_term: string) => {
		if (_term) {
			admin.findMany({ where: { _term } }).then(({ data }) => {
				setItems(
					data.map((e) => ({
						value: String(e.id),
						label: getEntityName(e),
					})),
				);
			});
		} else {
			setItems([]);
		}
	};

	const { start: startSearch, clear: clearSearch } = useTimeout(([text]) => {
		findByTerm(text);
	}, 300);

	React.useEffect(() => {
		if (search && (!value || search !== getEntityName(value))) {
			clearSearch();
			startSearch(search);
		}
	}, [search]);

	React.useEffect(() => {
		if (initialValue)
			admin.findOne(initialValue).then(({ object }) => {
				if (object) setValue(object);
			});
	}, [initialValue]);

	return {
		items,
		loading: admin.pending,
		value: value ? String(value.id) : null,
		handleChange: (val: string | null) => {
			const entity = val ? admin.ids[val] || null : null;
			if (onChange) onChange(val, entity);
			else setValue(entity);
		},
		search,
		handleSearch: setSearch,
	};
}

export interface LookupInputProps<E extends Entity> extends LookupProps<E> {
	allowDeselect?: boolean;
}

export function LookupInput<E extends Entity>({
	resource,
	allowDeselect,
	...props
}: LookupInputProps<E>) {
	const { items, loading, value, handleChange, search, handleSearch } =
		useLookup({ resource, ...props });

	return (
		<Select
			{...props}
			rightSection={loading ? <Loader size="xs" /> : undefined}
			data={items}
			nothingFoundMessage={`Nenhum(a) ${resource.title.simple} encontrado(a)`}
			value={value}
			onChange={handleChange}
			searchValue={search}
			onSearchChange={handleSearch}
			searchable
			clearable={allowDeselect}
			allowDeselect={allowDeselect}
		/>
	);
}
