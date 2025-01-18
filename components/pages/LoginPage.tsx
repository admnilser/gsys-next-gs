"use client";

import { signIn } from "next-auth/react";

import {
  Anchor,
  Container,
  Divider,
  Group,
  Paper,
  Stack,
  Text,
} from "@mantine/core";

import {
  Form,
  FormBody,
  FormButton,
  FormError,
  FormField,
  FormHead,
  FormValues,
} from "../ui/Form";

import styles from "./LoginPage.module.css";
import { Button } from "../ui/Buttons";
import React from "react";
import { useSearchParams } from "next/navigation";

export const LoginErrors: Record<string, string> = {
  CredentialSignIn: "Credenciais inválidas",
  Unauthorized: "Usuário não autenticao",
};

export interface LoginPageProps {
  callbackUrl: string;
}

export function LoginPage({ callbackUrl = "/" }: LoginPageProps) {
  const search = useSearchParams();

  const [error, setError] = React.useState<string | null>(search.get("error"));

  const signInGoogle = () => signIn("google", { callbackUrl, redirect: true });

  const signInCredentials = async (values: FormValues) => {
    try {
      const { username, password } = values;
      await signIn("credentials", {
        username,
        password,
        callbackUrl,
        redirect: true,
      });
    } catch {
      setError("CredentialSignIn");
    }
  };

  return (
    <Container className={styles.container}>
      <Paper className={styles.paper}>
        <Form onSubmit={signInCredentials}>
          <FormHead icon="lock" title="Acesso ao Sistema" />
          <FormBody>
            <FormError
              error={error ? LoginErrors[error] || error : undefined}
              onClose={() => setError(null)}
            />
            <FormField
              type="text"
              name="username"
              label="Usuário"
              placeholder="Nome do usuário"
            />
            <FormField
              type="secret"
              name="password"
              label="Senha"
              placeholder="Informe a senha de acesso"
            />
            <Stack mt="lg">
              <FormButton fullWidth>Entrar</FormButton>
              <Divider my="xs" label="OU" labelPosition="center" />
              <Button
                leftIcon="google"
                variant="subtle"
                onClick={signInGoogle}
                fullWidth>
                Entrar com Google
              </Button>
              <Text component={Group} fz="xs" align="center">
                <div>
                  Novo por aqui?{" "}
                  <Anchor href="/register" fz="xs">
                    Registre-se
                  </Anchor>
                </div>
                <Anchor fz="xs">Esqueceu a senha?</Anchor>
              </Text>
            </Stack>
          </FormBody>
        </Form>
      </Paper>
    </Container>
  );
}
