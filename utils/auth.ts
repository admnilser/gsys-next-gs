"use server";

import NextAuth, { DefaultSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";

import prisma from "./prisma";

import { checkPassword, hashPassword } from "./crypt";

import { NextResponse } from "next/server";
import { createZodParser } from "./zod-pt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
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

export interface Credentials {
  username: string;
  password: string;
}

export async function createAuthHandler() {
  const handler = NextAuth({
    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      }),
      FacebookProvider({
        clientId: process.env.FACEBOOK_CLIENT_ID!,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
      }),
      CredentialsProvider({
        credentials: {
          username: { label: "Usuário", type: "text" },
          password: { label: "Senha", type: "password" },
        },
        authorize: async (credentials) => {
          const { username, password } = credentials as Credentials;

          const user = await prisma.user.findUnique({
            where: { name: username },
          });

          if (!user) return null;

          const isChecked = await checkPassword(password, user.pswd);

          if (!isChecked) return null;

          const { id, name, email, image } = user;

          return { id, name, email, image };
        },
      }),
    ],
    callbacks: {
      async signIn({ user: { name, email, image } }) {
        if (!name || !email) return false;

        const now = new Date();

        await prisma.user.upsert({
          where: { email },
          create: {
            name,
            email,
            image,
            pswd: "",
            lastLogin: now,
            createdAt: now,
          },
          update: {
            lastLogin: now,
          },
        });

        return true;
      },
      async session({ session }) {
        if (!session.user?.email) return session;

        const user = await prisma.user.findUnique({
          where: { email: session.user.email },
        });

        if (user) {
          session.user.id = user.id;
        }

        return session;
      },
    },
    pages: {
      signIn: "/login",
      signOut: "/logout",
    },
  });

  return {
    GET: handler,
    POST: handler,
  };
}

export async function createSignUpHandler() {
  const POST = async (req: Request) => {
    const { name, email, pswd, confirmPswd } = (await req.json()) as SignUpData;

    const { errors } = validateSignUp({ name, email, pswd, confirmPswd });

    if (errors) return NextResponse.json({ errors });

    const found = await prisma.user.findUnique({
      where: { email: email },
    });

    if (found) {
      return NextResponse.json({ errors: { email: "Email já cadastrado" } });
    }

    const hashedPswd = await hashPassword(pswd);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        pswd: hashedPswd,
      },
    });

    return NextResponse.json({ user });
  };

  return { POST };
}
