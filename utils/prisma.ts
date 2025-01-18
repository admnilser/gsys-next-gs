import { PrismaClient, PrismaPromise } from "./prisma/client";

const prisma = new PrismaClient();

export default prisma;

export type PrismaRepoWhere = Record<string, unknown>;

export interface PrismaRepository<I, T> {
  count: (args: { where?: PrismaRepoWhere }) => PrismaPromise<number>;
  findMany: (args: {
    take?: number;
    skip?: number;
    where?: PrismaRepoWhere;
    orderBy?: Record<string, "asc" | "desc">;
  }) => PrismaPromise<T[]>;
  findUnique: (args: { where: { id: I } }) => PrismaPromise<T>;
  create: (args: { data: Partial<T> }) => PrismaPromise<T>;
  update: (args: { where: { id: I }; data: Partial<T> }) => PrismaPromise<T>;
  delete: (args: { where: { id: I } }) => PrismaPromise<T>;
}

export function repository<I, T>(name: string) {
  return (prisma as unknown as Record<string, unknown>)[
    name
  ] as PrismaRepository<I, T>;
}
