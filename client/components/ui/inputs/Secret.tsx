"use client";

import { PasswordInput } from "@mantine/core";

import { TextInput, type TextInputProps } from "./Text";

export function SecretInput(props: TextInputProps) {
	return <TextInput component={PasswordInput} {...props} />;
}
