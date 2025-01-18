"use client";

import { Box, Group, LoadingOverlay } from "@mantine/core";

import { useSession } from "../../utils/session";
import { useIsMobile } from "../../hooks/useIsMobile";

import { SideBar, SideBarProps, SideBarProvider } from "../ui/SideBar";
import { Header, HeaderUser } from "../ui/Header";

import styles from "./AdminLayout.module.css";

export interface AdminLayoutProps extends React.PropsWithChildren {
  title: string;
  sidebar: Omit<SideBarProps, "withDrawer">;
}

export function AdminLayout({ sidebar, title, children }: AdminLayoutProps) {
  const { user, loading } = useSession();
  const isMobile = useIsMobile();
  return (
    <SideBarProvider>
      <Box h="100vh">
        <LoadingOverlay
          visible={loading}
          zIndex={1000}
          overlayProps={{ radius: "sm", blur: 2 }}
          loaderProps={{ color: "white", type: "bars" }}
        />
        <Header title={title} user={user as HeaderUser} />
        <Group className={styles.body}>
          <SideBar {...sidebar} withDrawer={isMobile} />
          <Box className="full" flex={1} p="xs">
            {children}
          </Box>
        </Group>
      </Box>
    </SideBarProvider>
  );
}
