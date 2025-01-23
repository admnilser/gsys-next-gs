import { User } from "next-auth";

import { ModelName, ModelRules } from "./prisma";

export interface ResourceParseResult<T> {
  parsed?: Partial<T>;
  errors?: Record<keyof T, string>;
}

export interface ResourceTitle {
  singular: string;
  plural: string;
}

export interface Resource<T> {
  name: ModelName;
  title: ResourceTitle;
  nameField: string;
  termFields?: string[];
  parse: (data: Partial<T>) => ResourceParseResult<T>;
  rules: (user: User | undefined) => ModelRules | null;
}
