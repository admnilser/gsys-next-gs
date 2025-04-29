"use client";

import { useSelector, useDispatch } from "react-redux";

import { useRouter } from "next/navigation";

import type { StoreState, StoreDispatch } from "@next-gs/utils/store";

import { useParams } from "@next-gs/client/hooks/useParams";

import { addPage, remPage } from "@next-gs/utils/store/ui";

export function usePages() {
	const router = useRouter();

	const page = useParams().page as string;

	const dispatch = useDispatch<StoreDispatch>();

	const pages = useSelector((state: StoreState) => state.ui.pages) as string[];

	const navPage = (pg: string) => {
		router.push(pg);
	};

	return {
		page,
		pages,
		addPage: (pg: string) => dispatch(addPage(pg)),
		remPage: (pg: string) => {
			dispatch(remPage(pg));
			if (pg === page) navPage("dashboard");
		},
		navPage,
	};
};
