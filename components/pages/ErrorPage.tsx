"use client";

import { useRouter } from "next/navigation";

import { Group, Button, Title, Text, Stack } from "@mantine/core";

import { CenterPage } from "./CenterPage";

export interface ErrorPageProps {
  code: string;
  message: string;
}

export function ErrorPage({ code, message }: ErrorPageProps) {
  const router = useRouter();

  return (
    <CenterPage>
      <Stack p="sm" gap="xs" align="center">
        <Title order={1} size="4rem" c="red">
          {code}
        </Title>
        <Text size="lg" fw={500} mt="md">
          {message}
        </Text>
        <Group mt="lg">
          <Button
            variant="filled"
            color="blue"
            onClick={() => router.refresh()}>
            Tentar Novamente
          </Button>
          <Button variant="light" color="gray" onClick={() => router.push("/")}>
            Página Inicial
          </Button>
        </Group>
      </Stack>
    </CenterPage>
  );
}

export function Error404Page() {
  return <ErrorPage code="404" message="Página não encontrada" />;
}

export function Error500Page() {
  return <ErrorPage code="500" message="Erro interno do servidor" />;
}
