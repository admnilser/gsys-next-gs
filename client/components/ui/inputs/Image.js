"use client";

import React from "react";

import { Image, type ImageProps, Input, InputWrapper } from "@mantine/core";

import styles from "./Image.module.css";

export interface ImageInputProps extends ImageProps {
	alt?: string;
	value?: string;
	onChange?: (value: string) => void;
	label?: string;
	description?: React.ReactNode;
	error?: string;
}

export function ImageInput({
	alt = "imagem",
	label,
	description,
	error,
	value,
	onChange,
	...props
}: ImageInputProps) {
	const inputRef = React.useRef<HTMLInputElement>(null);

	const [file, setFile] = React.useState<File | null>(null);

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				if (onChange) onChange(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleClick = () => {
		inputRef.current?.click();
	};

	return (
		<div>
			<InputWrapper className={styles.input} {...{ label, description, error }}>
				<Image
					{...props}
					className={styles.image}
					src={value ? `/admin/img/${value}` : ""}
					fallbackSrc={` https://placehold.co/600x400/png?text=${alt}`}
					fit="contain"
					onClick={handleClick}
					alt={alt}
				/>
				<Input
					ref={inputRef}
					type="file"
					accept="image/*"
					onChange={handleFileChange}
				/>
			</InputWrapper>
		</div>
	);
}
