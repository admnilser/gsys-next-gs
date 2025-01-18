import _, { LoDashStatic } from "lodash";

const strContains = (text: string, term: string) =>
  _.lowerCase(text).includes(_.lowerCase(term));

const notNil = (value: any) => !_.isNil(value);

_.mixin({
  strContains,
  notNil,
});

type MixedLodashStatic = LoDashStatic & {
  strContains: typeof strContains;
  notNil: typeof notNil;
};

export default _ as MixedLodashStatic;
