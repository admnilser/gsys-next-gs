"use client";

import { Avatar, Burger, Button, Group, Text } from "@mantine/core";

import { User } from "next-auth";

import { useSideBar } from "./SideBar";
import { DropDown } from "./DropDown";

import styles from "./Header.module.css";
import { Icon } from "./Icon";
import { signOut } from "next-auth/react";

export type HeaderUser = User | null;

export interface HeaderProps {
  title: string;
  user: HeaderUser;
}

export function UserMenu({ user }: { user: HeaderUser }) {
  return user ? (
    <DropDown
      position="bottom-end"
      items={[
        { label: "Meu Perfil", icon: "profile", href: "/profile" },
        { label: "Sair", icon: "logout", onClick: () => signOut() },
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

export function Header({ title, user }: HeaderProps) {
  const { opened, toggle } = useSideBar();

  return (
    <header className={styles.header}>
      <Group className={styles.inner}>
        <Burger size="sm" opened={opened} onClick={toggle} />
        <Text fw={600} fz="md">
          {title}
        </Text>
        <UserMenu user={user} />
      </Group>
    </header>
  );
}
