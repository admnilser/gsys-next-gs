"use client";

import React from "react";

import { Badge, Image, Paper } from "@mantine/core";

import { IconButton } from "../Buttons";

import { Icon } from "../Icon";

import styles from "./FilePreview.module.css";

import {fn} from "@next-gs/client";

export type FileType = "img" | "file";

export type FileInfo = { title: string; name: string; src: string };

export type FilePreviewProps = {
	type?: FileType;
	file?: File | FileInfo | string;
	path?: string;
	onRemove?: () => void;
};

export function isFileInfo(file: unknown) {
	return (
		fn.isObject(file) && ("title" in file || "src" in file || "name" in file)
	);
}

export function FilePreview({ type, file, path, onRemove }: FilePreviewProps) {
	const [preview, setPreview] = React.useState<string | null>(null);

	React.useEffect(() => {
		if (file) {
			if (file instanceof File) {
				const reader = new FileReader();
				reader.onload = () => setPreview(reader.result as string);
				reader.readAsDataURL(file);
			} else if (fn.isObject(file)) {
				setPreview(file.src);
			} else {
				setPreview(`${path}${file}`);
			}
		}
	}, [file, path]);

	const { title: fileTitle, name: fileName } = (
		isFileInfo(file) ? file : {}
	) as FileInfo;

	const content =
		type === "img" ? (
			preview ? (
				<span>
					<Image
						src={preview}
						title={fileTitle}
						alt={fileTitle}
						h={150}
						width="auto"
					/>
					<IconButton
						className={styles.button}
						onClick={onRemove}
						aria-label="Excluir"
						icon="trash"
						size="sm"
						color="red"
						variant="filled"
					/>
				</span>
			) : null
		) : (
			<Badge component="a" color="blue" onClick={onRemove}>
				{fileName}
				<Icon name="trash" />
			</Badge>
		);

	return <Paper className={styles.preview}>{content}</Paper>;
}
