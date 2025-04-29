"use client";

import React from "react";

import { useShallowEffect } from "@mantine/hooks";

import { InputBase, type InputBaseProps } from "@mantine/core";

import CurrencyInput, {
	type CurrencyInputProps,
} from "react-currency-input-field";

import fn from "@next-gs/utils/funcs";

export type NumberInputValue = string | number;

export type NumberInputProps = InputBaseProps &
	Omit<CurrencyInputProps, "value" | "onChange"> & {
		align?: "left" | "center" | "right";
		value: NumberInputValue;
		onChange: (value: number) => void;
	};

export function NumberInput({
	align = "right",
	disabled,
	decimalsLimit = 2,
	allowDecimals = true,
	allowNegativeValue = false,
	value,
	onChange,
	...rest
}: NumberInputProps) {
	const [state, setState] = React.useState({ str: "", flt: 0 });

	React.useEffect(() => {
		const flt = fn.strToNumber(value);
		setState({ str: flt !== state.flt ? fn.numberToStr(flt) : state.str, flt });
	}, [value]);

	useShallowEffect(() => {
		onChange?.(state.flt);
	}, [state.flt]);

	return (
		<InputBase
			component={CurrencyInput}
			decimalSeparator=","
			groupSeparator="."
			decimalsLimit={decimalsLimit}
			allowDecimals={allowDecimals}
			allowNegativeValue={allowNegativeValue}
			disabled={disabled || !onChange}
			styles={{ input: { textAlign: align } }}
			value={state.str}
			onValueChange={(_a, _b, _c) =>
				setState({ str: _c?.value || "", flt: _c?.float || 0 })
			}
			{...rest}
		/>
	);
}

export function MoneyInput(props: NumberInputProps) {
	return <NumberInput decimalsLimit={2} allowDecimals={true} {...props} />;
}
