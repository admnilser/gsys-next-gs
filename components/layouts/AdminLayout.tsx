"use client";

import { Box, Group, LoadingOverlay, Paper } from "@mantine/core";

import { SideBar, SideBarProps, SideBarProvider } from "../ui/SideBar";

import styles from "./AdminLayout.module.css";

export interface AdminLayoutProps extends React.PropsWithChildren {
  title: string;
  sidebar: SideBarProps;
}
import { Header } from "../ui/Header";

export function AdminLayout({ sidebar, title, children }: AdminLayoutProps) {
  return (
    <SideBarProvider>
      <Box h="100vh">
        <LoadingOverlay
          visible={false}
          zIndex={1000}
          overlayProps={{ radius: "sm", blur: 2 }}
          loaderProps={{ color: "white", type: "bars" }}
        />
        <Header title={title} />
        <Group className={styles.body}>
          <SideBar {...sidebar} withDrawer={true} />
          <Box className="full" flex={1} p="xs">
            {children}
          </Box>
        </Group>
      </Box>
    </SideBarProvider>
  );
}
