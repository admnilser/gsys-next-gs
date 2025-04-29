"use client";

import React from "react";

import { InputBase, type InputBaseProps } from "@mantine/core";

export type LabelInputProps = InputBaseProps & {
	value: string;
};

export function LabelInput({ value, ...props }: LabelInputProps) {
	return (
		<InputBase
			component="div"
			variant="filled"
			style={{ caretColor: "transparent" }}
			pointer
			{...props}
		>
			{value}
		</InputBase>
	);
}
