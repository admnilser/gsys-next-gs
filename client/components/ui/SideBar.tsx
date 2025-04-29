"use client";

import React from "react";

import {
	Divider,
	Drawer,
	Group,
	ScrollArea,
	Stack,
	Text,
	UnstyledButton,
	Tooltip,
} from "@mantine/core";

import { useDisclosure } from "@mantine/hooks";

import _ from "@next-gs/utils/funcs";

import { Icon, type IconName } from "./Icon";

import styles from "./SideBar.module.css";

export type SideBarItems = (SideBarLinkProps | string | null)[];

export type SideBarLinkProps = {
	id: string;
	label?: string;
	icon?: IconName;
	onClick?: () => void;
	disabled?: boolean;
	items?: SideBarItems;
};

export type SideBarItemProps = Pick<SideBarLinkProps, "icon" | "label"> & {
	active: boolean;
	withLabel: boolean;
	rightAdornment?: React.ReactNode;
};

export type SideBarProps = {
	withDrawer?: boolean;
	activeLink?: string;
	headLinks: SideBarItems;
	footLinks: SideBarItems;
};

export type SideBarState = SideBarProps & {
	opened: boolean;
	expanded: boolean;
	show: () => void;
	hide: () => void;
	toggle: () => void;
};

const SideBarContext = React.createContext<SideBarState>({} as SideBarState);

const renderMenu = (items: SideBarItems, level: 0 | 1) => {
	const { expanded, activeLink } = useSideBar();

	const menuItems = items?.map((link, idx) => {
		const key = `${level}-${idx}`;

		if (typeof link === "string") {
			return (
				<Divider
					key={key}
					label={link !== "-" && expanded ? link : undefined}
					labelPosition="center"
				/>
			);
		}

		if (_.isObject(link)) {
			return (
				<SideBarLink
					key={key}
					{...link}
					withLabel={expanded}
					active={link.id === activeLink}
				/>
			);
		}

		return null;
	});

	return (
		<Stack gap={0} className={styles.menu} data-level={level}>
			{menuItems}
		</Stack>
	);
};

export function SideBarItem({
	icon,
	label,
	withLabel,
	rightAdornment,
}: SideBarItemProps) {
	return (
		<Text
			component={Group}
			className={styles.itemInner}
			data-with-label={withLabel}
		>
			{icon && <Icon name={icon} size={18} />}
			<span>{label}</span>
			{withLabel && rightAdornment}
		</Text>
	);
}

export function SideBarLink({
	id,
	icon,
	label,
	withLabel,
	active,
	items,
	onClick,
}: SideBarItemProps &
	Pick<SideBarLinkProps, "id" | "onClick" | "items"> & {
		onClick?: (id: string) => void;
	}) {
	const [opened, setOpened] = React.useState(false);

	const handleClick = onClick
		? () => onClick(id)
		: items
			? () => setOpened(!opened)
			: undefined;

	const button = (
		<UnstyledButton
			className={styles.linkButton}
			onClick={handleClick}
			data-opened={opened}
			data-active={active}
		>
			<SideBarItem
				icon={icon}
				label={label}
				withLabel={withLabel}
				rightAdornment={
					items && (
						<Icon
							name="chevronRight"
							size={16}
							style={{
								transform: opened ? "rotate(90deg)" : undefined,
							}}
						/>
					)
				}
				active={active}
			/>
		</UnstyledButton>
	);

	return [
		!withLabel && label ? (
			<Tooltip key="0" label={label} position="right" arrowSize={6} withArrow>
				{button}
			</Tooltip>
		) : (
			button
		),
		items && opened && renderMenu(items, 1),
	];
}

export function SideBar() {
	const { withDrawer, headLinks, footLinks, expanded, opened, hide } =
		useSideBar();

	const sideBar = (
		<nav className={styles.nav} data-opened={expanded}>
			<ScrollArea scrollbars="y" className={styles.scroll}>
				{renderMenu(headLinks, 0)}
			</ScrollArea>
			{renderMenu(footLinks, 0)}
		</nav>
	);

	return withDrawer ? (
		<Drawer.Root opened={opened} position="left" size="auto" onClose={hide}>
			<Drawer.Overlay />
			<Drawer.Content>
				<Drawer.Header>
					<Drawer.Title fw={700}>GZap</Drawer.Title>
					<Drawer.CloseButton />
				</Drawer.Header>
				<Divider mb="sm" />
				<Drawer.Body p={0}>{sideBar}</Drawer.Body>
			</Drawer.Content>
		</Drawer.Root>
	) : (
		sideBar
	);
}

export type SideBarProviderProps = React.PropsWithChildren & SideBarProps;

export function SideBarProvider({
	activeLink,
	withDrawer = false,
	children,
	...rest
}: SideBarProviderProps) {
	const [opened, { open: show, close: hide, toggle }] = useDisclosure();

	const expanded = opened || withDrawer;

	return (
		<SideBarContext.Provider
			value={{
				...rest,
				expanded,
				withDrawer,
				activeLink,
				opened,
				show,
				hide,
				toggle,
			}}
		>
			{children}
		</SideBarContext.Provider>
	);
}

export function useSideBar() {
	return React.useContext(SideBarContext);
}
