"use client";
import React from "react";

import { Stack, Box, Group, LoadingOverlay } from "@mantine/core";

import { useAdmin, useAuth, useMobile, usePages } from "@next-gs/client/hooks";

import { SideBar, SideBarProvider, type SideBarProps } from "../ui/SideBar";
import { NavBar, type NavTabProps } from "../ui/NavBar";
import { Header, type HeaderUser } from "../ui/Header";

export interface AdminLayoutProps extends React.PropsWithChildren {
	title: string;
	sidebar: SideBarProps;
}

export function useAdminPages() {
	const { page, pages: pageIds, remPage, navPage } = usePages();

	const { getResource } = useAdmin();

	const pages = React.useMemo(() => {
		return pageIds
			.map<NavTabProps | undefined>((p) => {
				const res = getResource(p);
				return res
					? {
							value: p,
							text: res.title.plural,
							icon: res.icon,
						}
					: undefined;
			})
			.filter((t) => t !== undefined);
	}, [pageIds]);

	return {
		page,
		pages,
		navPage,
		remPage,
		Page: page ? getResource(page)?.page : null,
	};
}

export function AdminLayout({ sidebar, title }: AdminLayoutProps) {
	const { user, loading } = useAuth();

	const { page, pages, navPage, remPage, Page } = useAdminPages();

	const isMobile = useMobile();

	return (
		<SideBarProvider withDrawer={isMobile} activeLink="" {...sidebar}>
			<Box h="100vh">
				<LoadingOverlay
					visible={loading}
					zIndex={1000}
					overlayProps={{ radius: "sm", blur: 2 }}
					loaderProps={{ color: "white", type: "bars" }}
				/>
				<Header title={title} user={user as HeaderUser} />
				<Group gap={0} h="100vh" pt="var(--app-header-height)" wrap="nowrap">
					<SideBar />
					<Stack className="full" flex={1} gap={0}>
						<NavBar
							tabs={pages}
							value={page}
							onChange={navPage}
							onClose={remPage}
						/>
						<Box className="full" p="md" pl={0}>
							{Page && <Page />}
						</Box>
					</Stack>
				</Group>
			</Box>
		</SideBarProvider>
	);
}
