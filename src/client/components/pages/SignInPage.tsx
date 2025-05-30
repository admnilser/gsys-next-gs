"use client";

import React from "react";

import { useSearchParams } from "next/navigation";

import { signIn } from "next-auth/react";

import { Anchor, Divider, Group, Stack, Text } from "@mantine/core";

import {
	Button,
	Form,
	FormBody,
	FormError,
	FormHead,
	FormSubmit,
	FormFieldText,
	FormFieldSecret,
	type FormValues,
} from "@next-gs/client";

import { CenterPage } from "./CenterPage";

export const LoginErrors: Record<string, string> = {
	CredentialsSignin: "Credenciais inválidas",
	Unauthorized: "Usuário não autenticado",
};

export interface SignInPageProps {
	callbackUrl: string;
}

export function SignInPage({ callbackUrl = "/" }: SignInPageProps) {
	const search = useSearchParams();

	const [error, setError] = React.useState<string | null>(search.get("error"));

	const signInProvider = (provider: string, params: object = {}) =>
		signIn(provider, {
			callbackUrl,
			redirect: true,
			...params,
		});

	const signInCredentials = async (values: FormValues) => {
		try {
			const { username, password } = values;
			await signInProvider("credentials", {
				username,
				password,
			});
		} catch {
			setError("CredentialsSignin");
		}
	};

	return (
		<CenterPage>
			<Form
				onSubmit={signInCredentials}
				values={{ username: "", password: "" }}
			>
				<FormHead icon="lock" title="Acesso ao Sistema" />
				<FormBody>
					<Stack gap="xs">
						<Button
							leftIcon="google"
							variant="subtle"
							onClick={() => signInProvider("google")}
							fullWidth
						>
							Entrar com Google
						</Button>
						<Button
							leftIcon="facebook"
							variant="subtle"
							onClick={() => signInProvider("facebook")}
							fullWidth
						>
							Entrar com Facebook
						</Button>
					</Stack>
					<Divider my="xs" label="OU" labelPosition="center" />
					<FormError
						error={error ? LoginErrors[error] || error : undefined}
						onClose={() => setError(null)}
					/>
					<FormFieldText
						name="username"
						label="Usuário"
						input={{ placeholder: "Nome do usuário" }}
					/>
					<FormFieldSecret
						name="password"
						label="Senha"
						input={{ placeholder: "Informe a senha de acesso" }}
					/>
					<Stack mt="lg" gap="xs">
						<FormSubmit fullWidth>Entrar com Credenciais</FormSubmit>

						<Text component={Group} fz="xs" align="center">
							<div>
								Novo por aqui?{" "}
								<Anchor href="/signup" fz="xs">
									Registre-se
								</Anchor>
							</div>
							<Anchor fz="xs">Esqueceu a senha?</Anchor>
						</Text>
					</Stack>
				</FormBody>
			</Form>
		</CenterPage>
	);
}
