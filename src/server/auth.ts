"use server";

import { type NextRequest, NextResponse } from "next/server";

import NextAuth, { type ISODateString } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";

import { hashPassword } from "@next-gs/utils/crypto";
import { createZodParser } from "@next-gs/utils/zod-pt";

import type { AuthUser } from "@next-gs/client";

import { createRepository } from "./repository";

export type User = AuthUser & {
	shop: number;
	pswd?: string;
};

declare module "next-auth" {
	interface Session {
		user?: User;
		expires: ISODateString;
	}
}

const validateSignUp = createZodParser((z) => ({
	name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
	email: z.string().email("Email inválido"),
	pswd: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
	confirmPswd: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
}));

validateSignUp.schema.refine((data) => data.pswd === data.confirmPswd, {
	path: ["confirmPswd"],
	message: "As senhas não correspondem",
});

export interface SignUpData {
	name: string;
	email: string;
	pswd: string;
	confirmPswd: string;
}

export interface UserCredentials {
	username: string;
	password: string;
}

interface RouteHandlerContext {
	params: Promise<{ nextauth: string[]; repo: string }>;
}

async function AuthHandler(req: NextRequest, ctx: RouteHandlerContext) {
	const { repo } = await ctx.params;

	const signInUrl = `/${repo}/signin`;

	return NextAuth(req, ctx, {
		providers: [
			GoogleProvider({
				clientId: process.env.GOOGLE_CLIENT_ID as string,
				clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
			}),
			FacebookProvider({
				clientId: process.env.FACEBOOK_CLIENT_ID as string,
				clientSecret: process.env.FACEBOOK_CLIENT_SECRET as string,
			}),
			CredentialsProvider({
				credentials: {
					username: { label: "Usuário", type: "text" },
					password: { label: "Senha", type: "password" },
				},
				authorize: async (params) => {
					const { username, password } = params as UserCredentials;
					try {
						const repository = await createRepository(repo);
						return await repository.checkUser({ username, password });
					} catch (error) {
						console.error(error);
						return null;
					}
				},
			}),
		],
		callbacks: {
			async signIn({ user: { name, email, image } }) {
				try {
					if (!name || !email || !repo) return false;

					const repository = await createRepository(repo);

					await repository.storeUser({ name, email, image });

					return true;
				} catch (error) {
					console.error(error);
					return `/${repo}/admin`;
				}
			},
			async session({ session }) {
				try {
					if (session.user?.email) {
						const repository = await createRepository(repo);

						const user = (await repository.checkUser(
							session.user.email,
						)) as User;
						if (user) session.user = user;
					}
				} catch (error) {
					console.error(error);
				}

				return session;
			},
		},
		pages: {
			signIn: signInUrl,
			signOut: `${repo}/signout`,
			error: `${repo}/error`,
			newUser: `${repo}/signup`,
		},
	});
}

const SignUpHandler = async (
	req: NextRequest,
	{ params }: { params: Promise<{ repo: string }> },
) => {
	const { repo } = await params;

	const { name, email, pswd, confirmPswd } = (await req.json()) as SignUpData;

	const { errors } = validateSignUp({ name, email, pswd, confirmPswd });

	if (errors) return NextResponse.json({ errors });

	const repository = await createRepository(repo);

	const found = await repository.checkUser(email);

	if (found) {
		return NextResponse.json({ errors: { email: "Email já cadastrado" } });
	}

	const hashedPswd = await hashPassword(pswd);

	const user = await repository.storeUser({
		name,
		email,
		pswd: hashedPswd,
	});

	return NextResponse.json({ user });
};

export { AuthHandler, SignUpHandler };
