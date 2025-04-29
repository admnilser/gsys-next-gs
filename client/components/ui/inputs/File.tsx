"use client";

import type React from "react";

import { InputBase, Notification } from "@mantine/core";

import { shallowEqual } from "react-redux";

import { type DropzoneOptions, useDropzone } from "react-dropzone";

import { FilePreview, type FileType } from "./FilePreview";

import fn from "@next-gs/utils/funcs";
import { Icon } from "../Icon";

import styles from "./File.module.css";

export type FileInputProps = React.PropsWithChildren & {
	fileType?: FileType;
	filePath?: string;
	multiple?: boolean;
	options?: DropzoneOptions & {
		inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
		onRemove?: (file: string) => void;
	};
	value?: string;
	onChange?: (value: string[] | null) => void;
	onBlur?: () => void;
};

export function FileInput({
	children,
	fileType,
	filePath,
	multiple,
	options: { inputProps: inputOptions, onRemove, onDrop, ...dropOptions } = {},
	value,
	onChange,
	onBlur,
	...rest
}: FileInputProps) {
	const { id, required, onFocus, ...inputProps } = inputOptions || {};

	const files = fn.asArray(value as string);

	const handleRemove = (file: string) => {
		onChange?.(multiple ? files.filter((f) => !shallowEqual(f, file)) : null);
		onRemove?.(file);
	};

	const { getRootProps, getInputProps } = useDropzone({
		...dropOptions,
		multiple,
		onDrop: (accepted, rejected, event) => {
			const updated = multiple ? [...files, ...accepted] : [...accepted];

			onChange?.((multiple ? updated : updated[0]) as string[]);

			onDrop?.(accepted, rejected, event);
		},
	});

	return (
		<InputBase component="div" classNames={{ input: styles.input }} {...rest}>
			{(fn.isEmpty(files) || multiple) && (
				<Notification
					icon={<Icon name="file" />}
					color="teal"
					withCloseButton={false}
					variant="unstyled"
					data-testid="dropzone"
					{...getRootProps()}
				>
					<input
						id={id}
						{...getInputProps({
							...inputProps,
							...inputOptions,
						})}
					/>
					Arraste um arquivo para este local ou clique para selecionar um
					arquivo.
				</Notification>
			)}

			{files && (
				<div className={styles.preview}>
					{files.map((file, index) => (
						<FilePreview
							key={index}
							file={file}
							type={fileType}
							path={filePath}
							onRemove={() => handleRemove(file)}
						/>
					))}
				</div>
			)}
		</InputBase>
	);
}
