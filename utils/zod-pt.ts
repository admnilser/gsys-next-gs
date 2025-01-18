import i18next from "i18next";

import { z } from "zod";

import { zodI18nMap } from "zod-i18n-map";

import translation from "zod-i18n-map/locales/pt/zod.json";

i18next.init({
  lng: "pt",
  resources: {
    pt: { zod: translation },
  },
});

z.setErrorMap(zodI18nMap);

type Zod = typeof z;

export function createZodParser(creator: (z: Zod) => z.ZodRawShape) {
  const schema = z.object(creator(z));
  const parser = (obj: unknown) => {
    const { success, data: parsed, error } = schema.safeParse(obj);
    if (success) {
      return { success, parsed };
    } else {
      const errors: Record<string, string> = {};
      error.issues.forEach((issue) => {
        errors[issue.path[0]] = issue.message;
      });
      return { success, errors };
    }
  };
  parser.schema = schema;
  return parser;
}
