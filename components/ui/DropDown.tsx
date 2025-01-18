"use client";

import { Group, Menu, MenuProps, UnstyledButton } from "@mantine/core";
import { useRouter } from "next/navigation";

import { Icon, IconName } from "./Icon";

import styles from "./DropDown.module.css";

export interface DropDownItem {
  icon: IconName;
  label: string;
  href?: string;
  disabled?: boolean;
  onClick?: () => void;
}

export interface DropDownProps extends React.PropsWithChildren<MenuProps> {
  items: DropDownItem[];
}

export function DropDown({ items, children, ...rest }: DropDownProps) {
  const router = useRouter();

  const itemClick = (index: number) => {
    const item = items[index];
    console.log(item);
    if (item.href) {
      router.push(item.href);
    } else if (item.onClick) {
      item.onClick();
    }
  };

  return (
    <Menu {...rest}>
      <Menu.Target>
        <UnstyledButton component={Group} className={styles.button}>
          {children}
        </UnstyledButton>
      </Menu.Target>
      {items.length > 0 && (
        <Menu.Dropdown>
          {items.map((item, idx) => (
            <Menu.Item
              key={idx}
              leftSection={<Icon name={item.icon} />}
              onClick={() => itemClick(idx)}>
              {item.label}
            </Menu.Item>
          ))}
        </Menu.Dropdown>
      )}
    </Menu>
  );
}
