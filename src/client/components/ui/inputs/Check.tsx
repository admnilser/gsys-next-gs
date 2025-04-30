import { Switch, type SwitchProps } from "@mantine/core";

import { DataTypes } from "@next-gs/utils/funcs";

export type CheckInputValue = typeof DataTypes.True;

export interface CheckInputProps
	extends Omit<SwitchProps, "value" | "onChange"> {
	value: CheckInputValue;
	onChange: (value: CheckInputValue) => void;
	valueOn?: CheckInputValue;
	valueOff?: CheckInputValue;
}

export function CheckInput({
	value,
	onChange,
	valueOn = DataTypes.True,
	valueOff = DataTypes.False,
	...rest
}: CheckInputProps) {
	const isChecked = value === valueOn;

	const handleToggle = () => onChange?.(isChecked ? valueOff : valueOn);

	return <Switch checked={isChecked} onChange={handleToggle} {...rest} />;
}

export default CheckInput;
