"use client";

import { useRouter } from "next/navigation";

import {
	Form,
	FormField,
	FormBody,
	FormFoot,
	FormHead,
	FormSubmit,
} from "../ui/inputs/Form";

import { CenterPage } from "./CenterPage";
import { Anchor, Stack } from "@mantine/core";

export function SignUpPage() {
	const router = useRouter();
	return (
		<CenterPage>
			<Form action="/api/signup" onSubmited={() => router.push("/login")}>
				<FormHead title="Registrar Usuário" />
				<FormBody>
					<FormField type="text" name="name" label="Nome" leftIcon="user" />
					<FormField type="text" name="email" label="Email" leftIcon="mail" />
					<FormField type="secret" name="pswd" label="Senha" leftIcon="key" />
					<FormField
						type="secret"
						name="confirmPswd"
						label="Confirmar Senha"
						leftIcon="key"
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
