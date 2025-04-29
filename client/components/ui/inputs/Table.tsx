import React from "react";

import { Table } from "@mantine/core";

import { fn, type JsonValue } from "@next-gs/client";

import { TextInput } from "./Text";

export type TableInputProps = {
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	defaultInput?: React.ComponentType<any>;
	colTitle?: string;
	colValue?: string;
	rows: {
		name: string;
		title: string;
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		input?: React.ComponentType<any>;
	}[];
	value: Record<string, JsonValue>;
	onChange: (value: Record<string, JsonValue>) => void;
};

export function TableInput({
	defaultInput = TextInput,
	colTitle = "Item",
	colValue = "Valor",
	rows,
	value,
	onChange,
}: TableInputProps) {
	const handleChange = (att: string, val: JsonValue) =>
		onChange?.({ ...(value || {}), [att]: val });

	return (
		<Table>
			<Table.Thead>
				<Table.Tr>
					<Table.Th w="1%">{colTitle}</Table.Th>
					<Table.Th w="1%">{colValue}</Table.Th>
				</Table.Tr>
			</Table.Thead>
			<Table.Tbody>
				{fn.map(rows, ({ name, title, input = defaultInput }) => (
					<Table.Tr key={name}>
						<Table.Td>{title}</Table.Td>
						<Table.Td>
							{React.createElement(input, {
								value: fn.get(value, [name]) as string,
								onChange: (val: string) => handleChange(name, val),
							})}
						</Table.Td>
					</Table.Tr>
				))}
			</Table.Tbody>
		</Table>
	);
}
