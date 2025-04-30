import React from "react";

import { Table, Title } from "@mantine/core";

import type {
	FormInputOptions,
	FormValues,
} from "@next-gs/client/context/form";

import { useFormInputs } from "@next-gs/client/hooks/useFormInputs";

import type { FormChangeHandler } from "@next-gs/client/hooks/useForm";

import fn, { type TextFormatterFunc } from "@next-gs/utils/funcs";

import { IconButton } from "../Buttons";

export type DetailTableColInput = Omit<FormInputOptions, "name" | "label"> & {
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	control: any;
};

export interface DetailTableColumn<DI> {
	name: string;
	title: string;
	width?: number | string;
	align?: "center" | "right" | "left";
	input?: DetailTableColInput | false;
	foot?: boolean;
	render?: (item: DI, rowIndex: number) => React.ReactNode;
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	format?: TextFormatterFunc<any>;
}

export interface DetailTableRowProps {
	canModify: boolean;
	canDelete: boolean;
}

export interface DetailInputProps<DI extends FormValues = FormValues> {
	columns: DetailTableColumn<DI>[];
	fluid?: boolean;
	initialState?: DI;
	showTitles?: boolean;
	value: DI[];
	rowProps?: (item: DI, rowIndex: number) => DetailTableRowProps;
	onSubmit?: (item: DI, rowIndex?: number) => void;
	onDelete?: (value: DI[], rowIndex: number) => DI[];
	onChange: (value: DI[]) => DI[];
	onInputChange?: (values: DI, field?: string) => DI | void;
}

export interface DetailTableRow {
	index: number;
}

export const DetailInput = <DI extends FormValues = FormValues>({
	columns,
	fluid,
	initialState,
	showTitles = true,
	value = [],
	rowProps,
	onSubmit,
	onDelete,
	onChange,
	onInputChange,
	...tableProps
}: DetailInputProps<DI>) => {
	const inputs = useFormInputs<DI>({
		values: initialState || ({} as DI),
		onChange: onInputChange,
	});

	const renderCellInput = ({ input, name }: DetailTableColumn<DI>) => {
		if (fn.isBoolean(input) && input === false) {
			return null;
		}

		const { control, ...inputProps } = (input || {}) as DetailTableColInput;

		return inputs.render(control, { name, ...inputProps });
	};

	const renderCellText = (
		item: DI,
		{ name, format, render }: DetailTableColumn<DI>,
		rowIndex: number,
	) => {
		if (render) return render(item, rowIndex);

		const val = fn.get(item, name, "");

		return val ? (format ? format(val) : fn.toString(val)) : undefined;
	};

	const handleChange = (newItems: DI[]) =>
		Promise.resolve(onChange?.(newItems));

	const handleInsert = () => {
		const { rowIndex, ...rest } = inputs.values;

		const replace = rowIndex !== undefined;

		const newItem = onSubmit ? onSubmit(rest as DI, rowIndex as number) : rest;

		const newValue = replace
			? value.map((item, idx) => (rowIndex === idx ? newItem : item))
			: [...[newItem], ...value];

		if (replace) inputs.reset();

		return handleChange(newValue as DI[]);
	};

	const handleRemove = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.stopPropagation();

		const row = Number.parseInt(e.currentTarget.id);

		const newItems = value
			? onDelete
				? onDelete(value, row)
				: value.filter((item, idx) => idx !== row)
			: [];

		handleChange(newItems);
	};

	const handleRowClick = (row: number) =>
		inputs.reset({ ...value[row], rowIndex: row });

	const renderDataRow = (item: DI, rowIndex: number) => {
		const {
			canModify = true,
			canDelete = true,
			...rest
		} = rowProps?.(item, rowIndex) || {};

		return (
			<Table.Tr
				key={rowIndex}
				bg={
					rowIndex === item.rowIndex
						? "var(--mantine-color-blue-light)"
						: undefined
				}
				onClick={canModify ? () => handleRowClick(rowIndex) : undefined}
				{...rest}
			>
				{fn.map(columns, (col, colIndex) => (
					<Table.Td key={colIndex} ta={col.align} w={col.width}>
						{renderCellText(item, col, rowIndex)}
					</Table.Td>
				))}
				<Table.Td>
					{onDelete && (
						<IconButton
							data-row={rowIndex}
							size="mini"
							hint="Remover"
							icon="trash"
							color="red"
							onClick={handleRemove}
							disabled={!canDelete}
						/>
					)}
				</Table.Td>
			</Table.Tr>
		);
	};

	const editing = inputs.values.rowIndex !== undefined;

	const footCount = columns.reduce((acc, col) => (col.foot ? acc + 1 : acc), 0);

	React.useEffect(() => inputs.reset(), [value?.length]);

	return (
		<Table fz="xs" {...tableProps}>
			<Table.Thead>
				{showTitles && (
					<Table.Tr>
						{fn.map(columns, (col, idx) => (
							<Table.Th key={idx} w={col.width}>
								{col.title || col.name}
							</Table.Th>
						))}
						<Table.Th content="Ações" w="1%" />
					</Table.Tr>
				)}
				<Table.Tr>
					{fn.map(columns, (col, idx) => (
						<Table.Th key={idx} w={col.width}>
							{renderCellInput(col)}
						</Table.Th>
					))}
					<Table.Th w="1%">
						<IconButton
							size="mini"
							hint={editing ? "Editar" : "Adicionar"}
							icon={editing ? "pencil" : "plus"}
							onClick={handleInsert}
							disabled={inputs.invalid}
						/>
					</Table.Th>
				</Table.Tr>
			</Table.Thead>
			<Table.Tbody>{fn.isArray(value) && value.map(renderDataRow)}</Table.Tbody>
			{footCount > 0 && (
				<Table.Tfoot>
					<Table.Tr>
						{fn.map(columns, (col, idx) => (
							<Table.Th key={idx} ta={col.align}>
								<Title size="h4">{col.foot}</Title>
							</Table.Th>
						))}
					</Table.Tr>
				</Table.Tfoot>
			)}
		</Table>
	);
};
