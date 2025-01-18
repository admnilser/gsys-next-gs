import React from "react";

import { Group, Stack, Paper, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

import { Entity, EntityQueryWhere, EntityService } from "../../model/entity";

import { SearchInput } from "../ui/SearchInput";
import { IconButton } from "../ui/Buttons";
import { List, ListProps } from "../ui/List";

import { FilterFormProps } from "./FilterForm";
import { EntityPager } from "./EntityPager";

export interface EntityListProps<E extends Entity>
  extends Omit<ListProps<E>, "items"> {
  service: EntityService<E>;
  filterForm?: React.ComponentType<FilterFormProps>;
}

export function EntityList<E extends Entity>({
  service,
  filterForm: FilterForm,
  ...props
}: EntityListProps<E>) {
  const [filterOpened, { open: showFilter, close: hideFilter }] =
    useDisclosure();

  const findMany = async (where: EntityQueryWhere<E> = {}) => {
    await service.findMany({ where });
  };

  React.useEffect(() => {
    findMany();
  }, []);

  return (
    <Paper className="full" component={Stack}>
      <Group justify="space-between">
        <Text fz="md" fw={600}>
          {service.res.title.plural}
        </Text>
        <Group gap="xs">
          <IconButton icon="plus" onClick={() => service.select({})} />
          {FilterForm && (
            <>
              <IconButton
                icon="filter"
                onClick={showFilter}
                badge={{ color: "blue", value: "3" }}
              />
              <FilterForm
                title={`Pesquisar ${service.res.title.plural}`}
                opened={filterOpened}
                values={service?.query?.where?._filter}
                onSubmit={async (_filter) => {
                  await service.findMany({
                    where: { _filter } as EntityQueryWhere<E>,
                  });
                  hideFilter();
                  return;
                }}
                onClose={hideFilter}
              />
            </>
          )}
        </Group>
      </Group>

      <SearchInput
        loading={service.pending}
        placeholder={`Pesquisar ${service.res.title.plural}...`}
        onSearch={(_term) => findMany({ _term })}
      />

      <List
        items={service.data}
        onItemClick={(item) => service.select(item)}
        {...props}
      />

      <EntityPager service={service} mt="md" />
    </Paper>
  );
}
