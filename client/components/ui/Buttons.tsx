import React from "react";

import {
	ActionIcon,
	Badge,
	Button as ManButton,
	Popover,
	Text,
	type ActionIconProps,
	type BadgeProps,
	type ButtonProps as ManButtonProps,
	type PolymorphicComponentProps,
	type PopoverProps,
} from "@mantine/core";

import { modals } from "@mantine/modals";

import { useDisclosure } from "@mantine/hooks";

import { Icon, type IconName } from "./Icon";

import styles from "./Buttons.module.css";

export type ButtonClickHandler =
	| ((e: React.MouseEvent<HTMLButtonElement>) => void)
	| (() => void);

export type ButtonProps<C = "button"> = PolymorphicComponentProps<
	C,
	ManButtonProps
> & {
	leftIcon?: IconName;
	rightIcon?: IconName;
	onClick?: ButtonClickHandler;
};

export function Button({ leftIcon, rightIcon, ...props }: ButtonProps) {
	return (
		<ManButton
			leftSection={leftIcon && <Icon name={leftIcon} />}
			rightSection={rightIcon && <Icon name={rightIcon} />}
			{...props}
		/>
	);
}

export type ButtonBadgeProps = BadgeProps & {
	value: string;
};

export function ButtonBadge({
	color,
	value,
	children,
	...props
}: ButtonBadgeProps) {
	return (
		<div className={styles.badge}>
			<Badge size="xs" color={color || "blue"} circle {...props}>
				{value}
			</Badge>
			{children}
		</div>
	);
}

export type ButtonHintProps = PopoverProps & {
	text: string;
};

export function ButtonHint({ children, text }: ButtonHintProps) {
	const button = React.Children.only(
		children,
	) as React.ReactElement<ButtonProps>;

	const [opened, { close, open }] = useDisclosure(false);

	return (
		<Popover position="bottom" shadow="xs" opened={opened} withArrow>
			<Popover.Target>
				{button &&
					React.cloneElement(button, {
						onMouseEnter: open,
						onMouseLeave: close,
					})}
			</Popover.Target>
			<Popover.Dropdown>
				<Text size="xs">{text}</Text>
			</Popover.Dropdown>
		</Popover>
	);
}

export interface IconButtonProps extends ActionIconProps {
	icon: IconName;
	hint?: string;
	badge?: ButtonBadgeProps;
	onClick?: ButtonClickHandler;
}

export function IconButton({
	variant = "subtle",
	color = "gray",
	hint,
	icon,
	badge,
	onClick,
	...props
}: IconButtonProps) {
	let iconButton = (
		<ActionIcon {...props} {...{ variant, color }} onClick={onClick}>
			<Icon name={icon} />
		</ActionIcon>
	);

	if (badge) {
		iconButton = <ButtonBadge {...badge}>{iconButton}</ButtonBadge>;
	}

	if (hint) {
		iconButton = <ButtonHint text={hint}>{iconButton}</ButtonHint>;
	}

	return iconButton;
}

export type DeleteButtonProps = ButtonProps & {
	prompt?: string;
};

export function DeleteButton({ prompt, onClick, ...rest }: DeleteButtonProps) {
	const openModal = () =>
		modals.openConfirmModal({
			title: "Atenção",
			children: (
				<Text size="md">
					{prompt || "Confirma exclusão do(s) registro(s) selecionado(s)?"}
				</Text>
			),
			labels: { confirm: "Excluir", cancel: "Abortar" },
			confirmProps: { color: "red" },
			onConfirm: onClick as () => void,
		});

	return <Button leftIcon="trash" color="red" onClick={openModal} {...rest} />;
}
