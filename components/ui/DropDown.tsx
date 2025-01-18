import { Group, Menu, MenuProps, UnstyledButton } from "@mantine/core";

import { Icon, IconName } from "./Icon";

import styles from "./DropDown.module.css";

export interface DropDownItem {
  icon: IconName;
  label: string;
  onClick: () => void;
}

export interface DropDownProps extends React.PropsWithChildren<MenuProps> {
  items: DropDownItem[];
}

export function DropDown({ items, children, ...rest }: DropDownProps) {
  return (
    <Menu {...rest}>
      <Menu.Target>
        <UnstyledButton component={Group} className={styles.button}>
          {children}
        </UnstyledButton>
      </Menu.Target>
      {items.length > 0 && (
        <Menu.Dropdown>
          {items.map((item) => (
            <Menu.Item
              key={item.label}
              leftSection={<Icon name={item.icon} />}
              onClick={item.onClick}>
              {item.label}
            </Menu.Item>
          ))}
        </Menu.Dropdown>
      )}
    </Menu>
  );
}
