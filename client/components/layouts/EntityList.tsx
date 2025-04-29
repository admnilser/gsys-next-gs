"use client";

import React from "react";

import { Group, Stack } from "@mantine/core";

import type { Entity } from "@next-gs/client";

import { EntityTable, type EntityTableProps } from "../ui/EntityTable";

import { SearchInput } from "../ui/inputs/Search";

import { Button } from "../ui/Buttons";

import type { FilterFormRef } from "./FilterForm";
import { FilterButton } from "./FilterButton";

export interface EntityListProps<E extends Entity>
	extends Omit<EntityTableProps<E>, "records"> {
	filterForm?: FilterFormRef;
}

export function EntityList<E extends Entity>({
	service,
	actions,
	filterForm,
	...props
}: EntityListProps<E>) {
	return (
		<Stack className="full">
			<Group justify="space-between">
				<SearchInput
					loading={service.pending}
					placeholder={`Pesquisar ${service.res.title.plural}...`}
					value={service.query?.where?._q}
					onSearch={async (_q) => {
						service.refresh({ where: { _q } });
						return;
					}}
				/>
				<Group gap="xs">
					<Button leftIcon="plus" onClick={() => service.select({})}>
						Inserir {service.res.title.simple}
					</Button>
					{filterForm && (
						<FilterButton<E> service={service} filterForm={filterForm} />
					)}
				</Group>
			</Group>

			<EntityTable<E>
				service={service}
				actions={[
					{
						icon: "pencil",
						hint: "Alterar",
						onClick: (id) => {
							service.select(service.recs[id]);
						},
					},
					{
						icon: "trash",
						hint: "Excluir",
						color: "red",
						onClick: (id) => {
							service.destroy([id]);
						},
					},
				]}
				{...props}
			/>
		</Stack>
	);
}
