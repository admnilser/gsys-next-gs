import { Group } from "@mantine/core";

import type { Entity, UseFormProps } from "@next-gs/client";

import { IconButton } from "../ui/Buttons";

import { DropDown, type DropDownItem } from "../ui/DropDown";

import {
	Form,
	FormBody,
	FormButton,
	FormFoot,
	FormHead,
	FormSubmit,
} from "../ui/inputs/Form";

export type EntityFormProps<E extends Entity> = UseFormProps<E> &
	React.PropsWithChildren & {
		entityName: string;
		actions?: DropDownItem[];
		onCancel: () => void;
	};

export function EntityForm<E extends Entity>({
	values,
	entityName,
	children,
	actions,
	onCancel,
	...props
}: EntityFormProps<E>) {
	const entity = values || {};

	const id = entity.id;

	const create = id === undefined;

	return (
		<Form<E> values={entity} {...props}>
			<FormHead
				icon={create ? "star" : "pencil"}
				title={`${create ? "Criar" : "Editar"} ${entityName}`}
			/>
			<FormBody>
				<input type="hidden" name="id" value={id || ""} />
				{children}
			</FormBody>
			<FormFoot justify="space-between">
				<Group>
					<FormSubmit leftIcon="save">Salvar</FormSubmit>
					<FormButton
						variant="subtle"
						leftIcon="ban"
						color="red"
						onClick={onCancel}
					>
						Cancelar
					</FormButton>
				</Group>
				{actions && (
					<DropDown items={actions}>
						<IconButton icon="more" size="sm" />
					</DropDown>
				)}
			</FormFoot>
		</Form>
	);
}
