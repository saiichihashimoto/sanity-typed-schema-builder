import { faker } from "@faker-js/faker";
import { flow } from "lodash/fp";
import { z } from "zod";

import type { SanityType } from "../types";
import type { Faker } from "@faker-js/faker";

interface StringType extends SanityType<StringFieldDef, z.ZodString> {}

type StringDef = Omit<StringFieldDef, "description" | "type"> & {
  length?: number;
  max?: number;
  min?: number;
  mock?: (faker: Faker) => string;
  regex?: RegExp;
};

export const string = (def: StringDef = {}): StringType => {
  const {
    length,
    max,
    min,
    mock = (faker: Faker) => faker.random.word(),
    regex,
    validation,
  } = def;

  const zod = flow(
    (zod: z.ZodString) => (!min ? zod : zod.min(min)),
    (zod) => (!max ? zod : zod.max(max)),
    (zod) => (!length ? zod : zod.length(length)),
    (zod) => (!regex ? zod : zod.regex(regex))
  )(z.string());

  return {
    zod,
    parse: zod.parse.bind(zod),
    mock: () => mock(faker),
    schema: () => ({
      ...def,
      type: "string",
      validation: flow(
        (rule) => (!min ? rule : rule.min(min)),
        (rule) => (!max ? rule : rule.max(max)),
        (rule) => (!length ? rule : rule.length(length)),
        (rule) => (!regex ? rule : rule.regex(regex)),
        (rule) => validation?.(rule) ?? rule
      ),
    }),
  };
};
