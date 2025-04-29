"use client";

import React from "react";

import { usePages } from "@next-gs/client/hooks/usePages";

export type AdminPageProps = React.PropsWithChildren & {
	id?: string;
};

export function AdminPage({ id, children }: AdminPageProps) {
	const { addPage } = usePages();

	React.useEffect(() => {
		if (id) addPage(id);
	}, [id]);

	return children;
}
