import type React from "react";

import { List, Checkbox } from "@mantine/core";

import fn from "@next-gs/utils/funcs";

export interface CheckListInputProps {
	options: string[];
	value: string[];
	onChange: (value: string[]) => void;
}

export function CheckListInput({
	options,
	value,
	onChange,
}: CheckListInputProps) {
	const handleItemClick: React.ChangeEventHandler<HTMLInputElement> = (e) => {
		const itemValue = e.currentTarget.getAttribute("data-value") || "";
		onChange?.(fn.toggle(value, itemValue));
	};

	return (
		<List>
			{fn.map(options, (opt, idx) => (
				<List.Item key={idx}>
					<Checkbox
						value={opt}
						checked={fn.includes(value, opt)}
						onChange={handleItemClick}
						data-value={opt}
					/>
				</List.Item>
			))}
		</List>
	);
}
