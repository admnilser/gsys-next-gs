import React from "react";

import { ComboboxItem, Loader, Select } from "@mantine/core";
import { useTimeout } from "@mantine/hooks";

import { Resource } from "../../model/resource";

import { Entity, EntityID } from "../../model/entity";

import { useEntityService } from "../../model/service";

import _ from "../../utils/lodash";

export interface LookupProps<E extends Entity> {
  resource: Resource<E>;
  value?: EntityID | null;
  onChange?: (value: EntityID | null, entity: E | null) => void;
}

export function useLookup<E extends Entity>({
  resource,
  value: initialValue,
  onChange,
}: LookupProps<E>) {
  const service = useEntityService<E>(resource);

  const [value, setValue] = React.useState<E | null>(null);

  const [search, setSearch] = React.useState<string>("");

  const [items, setItems] = React.useState<ComboboxItem[]>([]);

  const getEntityName = (e: E) => _.get(e, [service.res.nameField], "");

  const findByTerm = (_term: string) => {
    if (_term) {
      service.findMany({ where: { _term } }).then(({ data }) => {
        setItems(
          data.map((e) => ({
            value: String(e.id),
            label: getEntityName(e),
          }))
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
      service.findOne(initialValue).then(({ object }) => {
        if (object) setValue(object);
      });
  }, [initialValue]);

  return {
    items,
    loading: service.pending,
    value: value ? String(value.id) : null,
    handleChange: (val: string | null) => {
      const entity = val ? service.ids[val] || null : null;
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
      nothingFoundMessage={`Nenhum(a) ${resource.title.singular} encontrado(a)`}
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
