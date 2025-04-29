import "dayjs/locale/pt";

import type React from "react";

import {
	DateInput as ManDateInput,
	type DateInputProps as ManDateInputProps,
} from "@mantine/dates";

import { Icon } from "../Icon";

export interface DateInputProps extends ManDateInputProps {
	withIcon?: boolean;
}

export function DateInput({
	withIcon = true,
	valueFormat = "DD/MM/YY",
	...rest
}: DateInputProps) {
	return (
		<ManDateInput
			locale="pt"
			valueFormat={valueFormat}
			leftSection={withIcon ? <Icon name="calendar" /> : null}
			clearable
			{...rest}
		/>
	);
}
