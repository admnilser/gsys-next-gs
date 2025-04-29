"use client";

import {
	AdminProvider,
	type AdminResources,
} from "@next-gs/client/context/admin";

import { RootLayout, type RootLayoutProps } from "./RootLayout";

export type RepoLayoutProps = RootLayoutProps & {
	resources: AdminResources;
};

export function RepoLayout({ resources, children, ...props }: RepoLayoutProps) {
	return (
		<RootLayout {...props}>
			<AdminProvider resources={resources}>{children}</AdminProvider>
		</RootLayout>
	);
}
