import React from "react";

import { Checkbox, type CheckboxProps } from "@mantine/core";

import { DataTypes } from "@next-gs/utils/funcs";

export interface CheckInputProps
	extends Omit<CheckboxProps, "value" | "onChange"> {
	value: boolean;
	onChange: (value: boolean) => void;
	valueOn?: boolean;
	valueOff?: boolean;
}

export function CheckInput({
	value,
	onChange,
	valueOn = DataTypes.True,
	valueOff = DataTypes.False,
	...rest
}: CheckInputProps) {
	const isChecked = value === valueOn;

	const handleToggle = () => {
		onChange && onChange(isChecked ? valueOff : valueOn);
	};

	return (
		<Checkbox toggle checked={isChecked} onChange={handleToggle} {...rest} />
	);
}

export default CheckInput;
