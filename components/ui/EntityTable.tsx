"use client";

import React from "react";

import { Group, Text } from "@mantine/core";
import { useShallowEffect } from "@mantine/hooks";

import {
  DataTable,
  DataTableProps,
  DataTableColumn,
  DataTableSortStatus,
  useDataTableColumns,
} from "mantine-datatable";

import { Icon, IconName } from "./Icon";

import { Entity, EntityQueryOrderBy, EntityService } from "../../model/entity";

import _ from "../../utils/lodash";

export type EntityTableColumn<E extends Entity> = DataTableColumn<E> & {
  icon?: IconName;
};

export interface EntityTableProps<E extends Entity>
  extends Omit<DataTableProps, "records" | "columns"> {
  service: EntityService<E>;
  columns: EntityTableColumn<E>[];
}

export function EntityTable<E extends Entity>({
  service,
  columns,
  ...props
}: EntityTableProps<E>) {
  const key = service.res.name + "-data-table-store";

  const [sortStatus, setSortStatus] = React.useState<DataTableSortStatus>({});

  const { effectiveColumns } = useDataTableColumns({
    key,
    columns: (columns?.map(({ icon, title, ...col }) => ({
      ...col,
      dragabble: true,
      title: icon ? (
        <Group gap={4} mt={-1}>
          <Icon name={icon} size={16} />
          <Text inherit mt={1}>
            {title}
          </Text>
        </Group>
      ) : (
        title
      ),
    })) || []) as DataTableColumn[],
  });

  const handleSortStatusChange = ({
    columnAccessor,
    direction,
  }: DataTableSortStatus) => {
    service.findMany({
      orderBy: { [columnAccessor]: direction } as EntityQueryOrderBy<E>,
    });
  };

  const orderBy = service?.query?.orderBy;

  useShallowEffect(() => {
    if (orderBy) {
      const col = Object.keys(orderBy)[0];
      if (col) {
        setSortStatus({
          columnAccessor: col,
          direction: _.get(orderBy, [col], "asc"),
        });
      }
    }
  }, [orderBy]);

  const paginationProps =
    service.total > 0
      ? {
          totalRecords: service.total,
          recordsPerPage: service.pager.pageSize,
          recordsPerPageOptions: [10, 20, 50, 100],
          page: service.pager.page,
          onRecordsPerPageChange: (pageSize: number) =>
            service.navigate({ pageSize }),
          onPageChange: (page: number) => service.navigate({ page }),
        }
      : {};

  return (
    <DataTable
      borderRadius="sm"
      minHeight={200}
      withTableBorder
      withColumnBorders
      striped
      highlightOnHover
      loadingText="Carregando..."
      noRecordsText={`Nenhum(a) ${service.res.title.singular} encontrado(a)!`}
      groups={undefined}
      records={service.data}
      storeColumnsKey={key}
      columns={effectiveColumns}
      sortStatus={sortStatus}
      onSortStatusChange={handleSortStatusChange}
      {...props}
      {...paginationProps}
    />
  );
}
