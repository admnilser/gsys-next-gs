import React from "react";

import {
	fn,
	useFormContext,
	type UseFormReturn,
	type FormValues,
} from "@next-gs/client";

import { TextInput, type TextInputProps } from "./Text";

import { IconButton } from "../Buttons";

const isZipCode = (s: string) => s && fn.numbers(s).length === 8;

export interface ZipInfo {
	logradouro: string;
	bairro: string;
	localidade: string;
	uf: string;
	ibge: string;
}

export interface ZipCodeInputProps extends TextInputProps {
	value: string;
	onMerge: (form: UseFormReturn<FormValues>, zip: ZipInfo) => void;
}

export interface ZipCodeInputState {
	searching: boolean;
	error?: string;
}

export const ZipCodeInput = ({
	value,
	onMerge,
	...rest
}: ZipCodeInputProps) => {
	const form = useFormContext();

	const [{ searching, error }, setState] = React.useState<ZipCodeInputState>({
		searching: false,
		error: undefined,
	});

	const handleSearch = () => {
		setState({ searching: true });

		/*zipCode(value)
			.then((zip) => {
				if (onMerge) form.merge(() => onBatch(form, zip));
				setState({});
			})
			.catch((error) => setState({ error: error.toString() }));*/
	};

	return (
		<TextInput
			value={value}
			mask="cep"
			rightSection={
				isZipCode(value) ? (
					<IconButton
						icon="search"
						onClick={handleSearch}
						color={error ? "red" : "blue"}
						radius="xl"
						loading={searching}
					/>
				) : null
			}
			{...rest}
		/>
	);
};
