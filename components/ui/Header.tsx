"use client";

import { Avatar, Burger, Button, Group, Text } from "@mantine/core";

import { User } from "next-auth";

import { useSession } from "../../utils/session";

import { useSideBar } from "./SideBar";
import { DropDown } from "./DropDown";

import styles from "./Header.module.css";
import { Icon } from "./Icon";

export interface HeaderProps {
  title: string;
}

export function UserMenu() {
  const { user } = {
    user: {
      id: "1",
      name: "nilson",
      email: "nilson@gmail.com",
    } as User,
  };

  return user ? (
    <DropDown
      position="bottom-end"
      items={[
        { label: "Meu Perfil", icon: "profile", onClick: () => {} },
        { label: "Sair", icon: "logout", onClick: () => {} },
      ]}>
      {user.image && <Avatar src={user.image} size="sm" radius="lg" />}
      <Text size="sm">{user.name}</Text>
      <Icon name="chevronDown" size={16} />
    </DropDown>
  ) : (
    <Button component="a" href="/login" size="xs">
      Entrar
    </Button>
  );
}

export function Header({ title }: HeaderProps) {
  const { opened, toggle } = useSideBar();

  return (
    <header className={styles.header}>
      <Group className={styles.headerInner}>
        <Burger size="sm" opened={opened} onClick={toggle} />
        <Text fw={600} fz="md">
          {title}
        </Text>
        <UserMenu />
      </Group>
    </header>
  );
}
