import React from "react";

import { signOut, useSession } from "next-auth/react";

import { redirect, RedirectType } from "next/navigation";

import fn, { type Any } from "@next-gs/utils/funcs";

import type { AuthUser } from "@next-gs/client";

import { useAdmin } from "./useAdmin";
import { useParams } from "./useParams";

const checkUserRole = (user: AuthUser, role: string, action = "A") => {
	const data = user && role ? user.roles[role.toUpperCase()] : null;
	return data ? (action ? data.includes(action) : data) : false;
};

export function useAuth<U extends AuthUser>() {
	const { repo } = useParams();

	const loginUrl = React.useCallback(
		(error?: string) => `/${repo}/admin/signin?error=${error}`,
		[repo],
	);

	const { status, data } = useSession({
		required: true,
		onUnauthenticated: () => {
			redirect(loginUrl("Unauthorized"), RedirectType.replace);
		},
	});

	const user = data?.user as U;

	const { storage } = useAdmin();

	return React.useMemo(() => {
		const loading = status === "loading";
		const logged = status === "authenticated";

		const fmtKey = (key: string) => `usr${user?.id}_${key}`;

		return {
			user,
			loading,
			logged,
			hasRole: (role: string, action = "A") => {
				return checkUserRole(user, role, action);
			},
			logout: () => {
				signOut({ callbackUrl: loginUrl(), redirect: true });
			},
			getPref: (key: string, def: object) =>
				logged ? storage.get<object>(fmtKey(key), def) : def,
			setPref: <V extends Any>(key: string, val: V) => {
				if (logged)
					fn.notNil(val)
						? storage.set<V>(fmtKey(key), val)
						: storage.remItem(fmtKey(key));
			},
		};
	}, [user, status, loginUrl, storage]);
}
