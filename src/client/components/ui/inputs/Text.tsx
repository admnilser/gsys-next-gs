"use client";

import type React from "react";

import { IMaskInput } from "react-imask";

import { InputBase, type InputBaseProps } from "@mantine/core";

import { fn } from "@next-gs/client";

import { Icon, type IconName } from "../Icon";

export type MaskExpr = string | "phone" | "cep" | "cpf" | "cpnj";

const CustomMasks: Record<string, MaskExpr> = {
	phone: "(99) 99999-9999",
	cep: "99999-999",
	cpf: "999.999.999-99",
	cpnj: "99.999.999/9999-99",
};

export type TextInputProps = InputBaseProps & {
	value?: string;
	onChange?: (value: string) => void;
	mask?: MaskExpr;
	align?: "left" | "right" | "center";
	leftIcon?: IconName;
	rightIcon?: IconName;
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	component?: any;
	uppercase?: boolean;
	lowercase?: boolean;
	transform?: (str: string) => string;
	placeholder?: string;
};

export function TextInput({
	mask,
	component,
	leftIcon,
	rightIcon,
	value,
	onChange,
	uppercase,
	lowercase,
	transform,
	...props
}: TextInputProps) {
	const imask = mask ? CustomMasks[mask] || mask : undefined;
	return (
		<InputBase
			mask={imask}
			component={imask ? IMaskInput : component || "input"}
			leftSection={leftIcon ? <Icon name={leftIcon} /> : undefined}
			rightSection={rightIcon ? <Icon name={rightIcon} /> : undefined}
			value={fn.toString(value)}
			onChange={
				((e) => {
					let value = e.currentTarget.value;
					if (uppercase) {
						value = fn.toUpper(value);
					} else if (lowercase) {
						value = fn.toLower(value);
					}
					onChange?.(transform ? transform(value) : value);
				}) as React.ChangeEventHandler<HTMLInputElement>
			}
			{...props}
		/>
	);
}
