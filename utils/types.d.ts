import { DefaultSession, ISODateString } from "next-auth";

declare module "next-auth" {
  interface Session {
    user?: {
      id: string;
      role: string;
      teamId?: string;
      memberId?: string;
      organizationId?: string;
      abilities: Record<ModelName, AppAbility>;
    } & DefaultSession["user"];
    expires: ISODateString;
  }
}
