"use client";

import React from "react";

import { Group, Text } from "@mantine/core";

import { useShallowEffect } from "@mantine/hooks";

import {
	DataTable,
	useDataTableColumns,
	type DataTableProps,
	type DataTableColumn,
	type DataTableSortStatus,
} from "mantine-datatable";

import type {
	Entity,
	ResourceService,
	QuerySortBy,
	EntityID,
	JsonValue,
} from "@next-gs/client";

import fn, {
	TextFormatter,
	type TextFormatterFunc,
} from "@next-gs/utils/funcs";

import { Icon, type IconName } from "./Icon";

import { IconButton, type IconButtonProps } from "./Buttons";

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type EntityTableRenderFormat = TextFormatterFunc<any>;

export type EntityTableColumn<E extends Entity> = DataTableColumn<E> & {
	icon?: IconName;
	format?: EntityTableRenderFormat;
};

export type EntityTableAction = Omit<IconButtonProps, "onClick"> & {
	onClick: (id?: EntityID) => void;
};

export interface EntityTableProps<E extends Entity>
	extends Omit<DataTableProps, "records" | "columns"> {
	service: ResourceService<E>;
	columns: EntityTableColumn<E>[];
	actions?: EntityTableAction[];
}

export function EntityTable<E extends Entity>({
	service,
	columns,
	actions,
	...props
}: EntityTableProps<E>) {
	const storeKey = `${service.res.name}-data-table-store`;

	const [sortStatus, setSortStatus] = React.useState<DataTableSortStatus>(
		{} as DataTableSortStatus,
	);

	const cols = React.useMemo(() => {
		const result = (columns?.map(
			({ accessor, icon, title, format, render, ...col }) => ({
				...col,
				accessor,
				render:
					render ||
					(format ? (e: E) => TextFormatter.formatAs(e[accessor], format) : undefined),
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
			}),
		) || []) as DataTableColumn<E>[];

		if (actions) {
			result.push({
				accessor: "actions",
				title: "Ações",
				width: "0%",
				render: (entity: E) => (
					<Group gap="xs" wrap="nowrap">
						{actions.map(({ onClick, ...action }, idx) => (
							<IconButton
								key={idx}
								size="xs"
								{...action}
								onClick={() => onClick?.(entity.id)}
							/>
						))}
					</Group>
				),
			});
		}

		return result;
	}, [columns, actions]);

	const { effectiveColumns } = useDataTableColumns({
		key: storeKey,
		columns: cols,
	});

	const handleSortStatusChange = ({
		columnAccessor,
		direction,
	}: DataTableSortStatus) => {
		service.refresh({
			sort: { [columnAccessor]: direction } as QuerySortBy<E>,
		});
	};

	const sortBy = service?.query?.sort;

	useShallowEffect(() => {
		if (sortBy) {
			const col = Object.keys(sortBy)[0];
			if (col) {
				setSortStatus({
					columnAccessor: col,
					direction: fn.get(sortBy, [col], "asc"),
				});
			}
		}
	}, [sortBy]);

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
			records={service.data}
			storeColumnsKey={storeKey}
			columns={effectiveColumns}
			sortStatus={sortStatus}
			loadingText="Carregando..."
			noRecordsText={`Nenhum(a) ${service.res.title.simple} encontrado(a)!`}
			fz="xs"
			borderRadius="sm"
			minHeight={200}
			onSortStatusChange={handleSortStatusChange}
			withTableBorder
			withColumnBorders
			striped
			highlightOnHover
			{...props}
			{...paginationProps}
		/>
	);
}
