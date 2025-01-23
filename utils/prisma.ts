/* eslint-disable @typescript-eslint/no-explicit-any */

import { Prisma, PrismaClient, PrismaPromise } from "./prisma/client";

export type ModelName = Prisma.ModelName;

export type ModelAction =
  | "read"
  | "create"
  | "update"
  | "delete"
  | "all"
  | "manage";

export type ModelRules = Partial<Record<ModelAction, boolean | unknown>>;

export interface PrismaRepository<I, T> {
  count: (args: { where?: Prisma.RoleWhereInput }) => PrismaPromise<number>;
  findMany: (args: {
    take?: number;
    skip?: number;
    where?: Prisma.RoleWhereInput;
    orderBy?: Record<string, "asc" | "desc">;
  }) => PrismaPromise<T[]>;
  findUnique: (args: { where: { id: I } }) => PrismaPromise<T>;
  create: (args: { data: Partial<T> }) => PrismaPromise<T>;
  update: (args: { where: { id: I }; data: Partial<T> }) => PrismaPromise<T>;
  delete: (args: { where: { id: I } }) => PrismaPromise<T>;
}

export function repository<I, T>(name: ModelName) {
  return (prisma as any)[name.toLowerCase()] as PrismaRepository<I, T>;
}

export { Prisma };

const prisma = new PrismaClient({
  log: [
    {
      emit: "event",
      level: "query",
    },
    {
      emit: "stdout",
      level: "error",
    },
    {
      emit: "stdout",
      level: "info",
    },
    {
      emit: "stdout",
      level: "warn",
    },
  ],
});

export default prisma;
