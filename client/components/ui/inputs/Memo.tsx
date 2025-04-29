import React from "react";

import { Textarea, type TextareaProps } from "@mantine/core";

export type MemoInputProps = Omit<TextareaProps, "onChange"> & {
	onChange?: (value: string) => void;
};

export function MemoInput({ value, onChange, ...rest }: MemoInputProps) {
	return (
		<Textarea
			value={value || ""}
			onChange={(e) => onChange?.(e.currentTarget.value || "")}
			{...rest}
		/>
	);
}
