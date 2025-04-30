"use client";

import { useRouter } from "next/navigation";

import { Anchor, Stack } from "@mantine/core";

import {
	Form,
	FormBody,
	FormFoot,
	FormHead,
	FormSubmit,
	FormFieldText,
	FormFieldSecret,
} from "@next-gs/client";

import { CenterPage } from "./CenterPage";

export function SignUpPage() {
	const router = useRouter();
	return (
		<CenterPage>
			<Form
				action="/api/signup"
				values={{ name: "", email: "", pswd: "", confirmPswd: "" }}
				onSubmited={() => router.push("/login")}
			>
				<FormHead title="Registrar Usuário" />
				<FormBody>
					<FormFieldText
						name="name"
						label="Nome"
						input={{ leftIcon: "user" }}
					/>
					<FormFieldText
						name="email"
						label="Email"
						input={{ leftIcon: "mail" }}
					/>
					<FormFieldSecret
						name="pswd"
						label="Senha"
						input={{ leftIcon: "key" }}
					/>
					<FormFieldSecret
						name="confirmPswd"
						label="Confirmar Senha"
						input={{ leftIcon: "key" }}
					/>
				</FormBody>
				<FormFoot>
					<Stack>
						<FormSubmit fullWidth>Cadastrar</FormSubmit>
						<Anchor href="/login" size="sm">
							Já possui uma conta? Faça login
						</Anchor>
					</Stack>
				</FormFoot>
			</Form>
		</CenterPage>
	);
}
