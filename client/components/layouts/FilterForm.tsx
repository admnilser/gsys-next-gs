import type React from "react";

import {
	Form,
	FormBody,
	FormHead,
	FormFoot,
	FormButton,
	FormScene,
	type FormValues,
	type UseFormProps,
} from "@next-gs/client";

export interface FilterFormProps
	extends React.PropsWithChildren<UseFormProps<FormValues>> {
	title: string;
	opened: boolean;
	onClose: () => void;
}

export type FilterFormRef = React.ComponentType<FilterFormProps>;

export function FilterForm({
	title,
	opened,
	children,
	onSubmit,
	onClose,
	...rest
}: FilterFormProps) {
	return (
		<FormScene type="modal" opened={opened} onClose={onClose}>
			<Form onSubmit={onSubmit} {...rest}>
				<FormHead icon="filter" title={title} />
				<FormBody>{children}</FormBody>
				<FormFoot>
					<FormButton type="submit" leftIcon="filter">
						Filtrar
					</FormButton>
					<FormButton
						variant="subtle"
						leftIcon="ban"
						color="red"
						onClick={onClose}
					>
						Cancelar
					</FormButton>
				</FormFoot>
			</Form>
		</FormScene>
	);
}
