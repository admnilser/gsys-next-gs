"use client";

import {
  Form,
  FormField,
  FormBody,
  FormFoot,
  FormHead,
  FormSubmit,
} from "../ui/Form";

import { CenterPage } from "./CenterPage";

export function SignUpPage() {
  return (
    <CenterPage>
      <Form action="/api/signup">
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
          <FormSubmit fullWidth>Cadastrar</FormSubmit>
        </FormFoot>
      </Form>
    </CenterPage>
  );
}
