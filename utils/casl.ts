"use server";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { getServerSession } from "next-auth";

import {
  accessibleBy,
  createPrismaAbility,
  Model,
  PrismaQuery,
  Subjects,
} from "@casl/prisma";

import { PureAbility, AbilityBuilder, subject } from "@casl/ability";

import { ModelName, Prisma } from "./prisma";

import _ from "./lodash";

import { Resource } from "./resource";

export type PrismaModel = Model<Record<string, any>, string>;

export type AppAbility = PureAbility<
  [string, Subjects<Record<ModelName, PrismaModel>>],
  PrismaQuery
> & {
  accessible: Prisma.RoleWhereInput;
};

export async function getUserAbility<T>(res: Resource<T>) {
  let ability: AppAbility;

  const session = await getServerSession();
  const user = session?.user;

  ability = user?.abilities?.[res.name];

  if (!ability) {
    const rules = res.rules(user);

    const builder = new AbilityBuilder<AppAbility>(createPrismaAbility);

    if (rules) {
      _.forEach(rules, (conditions, action) => {
        if (conditions === true) {
          builder.can(action, res.name);
        } else if (conditions === false) {
          builder.cannot(action, res.name);
        } else if (conditions) {
          builder.can(action, res.name, conditions);
        }
      });
    } else {
      builder.cannot("all", res.name);
    }

    ability = builder.build();
    ability.accessible = accessibleBy(ability)[res.name];

    if (user) {
      if (!user.abilities) user.abilities = {};

      user.abilities[res.name] = ability;
    }
  }

  return ability;
}

export { subject };
