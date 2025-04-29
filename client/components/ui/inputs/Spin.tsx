import React from "react";

import { IconButton, type IconButtonProps } from "../Buttons";

import { NumberInput, type NumberInputProps } from "./Numeric";

import fn from "@next-gs/utils/funcs";

function SpinButton(props: IconButtonProps) {
	return <IconButton variant="subtle" size="xs" {...props} />;
}

export type SpinInputProps = NumberInputProps & {
	step?: number;
	min?: number;
	max?: number;
};

export function SpinInput({
	step = 1,
	min = -1,
	max = -1,
	value = 0,
	onChange,
	...rest
}: SpinInputProps) {
	const handleChange = (val: number) => {
		if (onChange) {
			if (min > -1 && val < min) onChange(min);
			else if (max > -1 && val > max) onChange(max);
			else onChange(val);
		}
	};

	const handleStep = (delta: number) =>
		handleChange((fn.isNumber(value) ? value : Number.parseInt(value)) + delta);

	return (
		<NumberInput
			rightSection={
				<SpinButton icon="chevronUp" onClick={() => handleStep(+step)} />
			}
			leftSection={
				<SpinButton icon="chevronDown" onClick={() => handleStep(-step)} />
			}
			value={value}
			onChange={handleChange}
			align="center"
			{...rest}
		/>
	);
}
