"use client";

import { useDisclosure } from "@mantine/hooks";

import type { Entity, ResourceService } from "@next-gs/client";

import { Button } from "../ui/Buttons";
import type { FormValues } from "../ui/inputs/Form";

import type { FilterFormRef } from "./FilterForm";

export interface FilterButtonProps<E extends Entity> {
	service: ResourceService<E>;
	filterForm: FilterFormRef;
}

export function FilterButton<E extends Entity>({
	service,
	filterForm: FilterForm,
}: FilterButtonProps<E>) {
	const [opened, { open, close }] = useDisclosure();

	return (
		<>
			<Button leftIcon="filter" onClick={open}>
				Filtrar
			</Button>
			<FilterForm
				title={`Pesquisar ${service.res.title.plural}`}
				opened={opened}
				values={service?.query?.where as FormValues}
				onSubmit={async (where) => {
					await service.refresh({ where });
					close();
				}}
				onClose={close}
			/>
		</>
	);
}
