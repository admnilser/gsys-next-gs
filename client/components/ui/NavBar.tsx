import { Group, UnstyledButton } from "@mantine/core";

import { Icon, type IconName } from "./Icon";

import styles from "./NavBar.module.css";

export type NavTabProps = { icon: IconName; value: string; text: string };

export interface NavBarProps {
	tabs: NavTabProps[];
	value: string | null;
	onChange: (tab: string) => void;
	onClose?: (tab: string) => void;
}

export function NavBar({ tabs, value, onChange, onClose }: NavBarProps) {
	return tabs.length > 0 ? (
		<Group className={styles.container}>
			{tabs.map((tab) => (
				<Group
					key={tab.value}
					className={styles.tab}
					data-active={tab.value === value}
				>
					<Group
						className={styles.tabText}
						onClick={() => onChange?.(tab.value)}
					>
						{tab.icon && <Icon name={tab.icon} size={16} stroke={3} />}
						{tab.text}
					</Group>
					<UnstyledButton
						className={styles.tabClose}
						onClick={() => onClose?.(tab.value)}
					>
						<Icon name="times" size={14} />
					</UnstyledButton>
				</Group>
			))}
		</Group>
	) : null;
}
