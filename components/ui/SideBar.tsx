import React from "react";

import {
  Divider,
  Drawer,
  Group,
  ScrollArea,
  Text,
  UnstyledButton,
} from "@mantine/core";

import { useDisclosure } from "@mantine/hooks";

import { Icon, IconName } from "./Icon";

import styles from "./SideBar.module.css";

export type SideBarState = {
  opened: boolean;
  show: () => void;
  hide: () => void;
  toggle: () => void;
};

const SideBarContext = React.createContext<SideBarState>({} as SideBarState);

export interface SideBarLinkProps {
  href?: string;
  icon: IconName;
  label: string;
  active?: boolean;
  items?: SideBarLinkProps[];
  withLabel?: boolean;
  onClick?: () => void;
}

export function SideBarLink({
  icon,
  label,
  items,
  active,
  withLabel,
}: SideBarLinkProps) {
  return (
    <UnstyledButton className={styles.linkButton} data-active={active}>
      <Text
        component={Group}
        className={styles.linkInner}
        data-with-label={withLabel}>
        <Icon name={icon} size={18} />
        <span>{label}</span>
        {items && <Icon name="chevronRight" size={16} />}
      </Text>
    </UnstyledButton>
  );
}

export interface SideBarProps {
  active?: string;
  withDrawer: boolean;
  headLinks: SideBarLinkProps[];
  footLinks: SideBarLinkProps[];
}

export function SideBar({
  withDrawer,
  active,
  headLinks,
  footLinks,
}: SideBarProps) {
  const { opened, hide } = useSideBar();

  const expanded = opened || withDrawer;

  const renderLinks = (links: SideBarLinkProps[]) => {
    return (
      links &&
      links.map((link, idx) => (
        <SideBarLink
          key={idx}
          {...link}
          withLabel={expanded}
          active={link.href === active}
        />
      ))
    );
  };

  const sideBar = (
    <nav className={styles.nav} data-opened={expanded}>
      <ScrollArea scrollbars="y" className={styles.scroll}>
        {renderLinks(headLinks)}
      </ScrollArea>
      <div>{renderLinks(footLinks)}</div>
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

export function SideBarProvider({ children }: React.PropsWithChildren) {
  const [opened, { open: show, close: hide, toggle: toggle }] = useDisclosure();

  return (
    <SideBarContext.Provider value={{ opened, show, hide, toggle }}>
      {children}
    </SideBarContext.Provider>
  );
}

export function useSideBar() {
  return React.useContext(SideBarContext);
}
