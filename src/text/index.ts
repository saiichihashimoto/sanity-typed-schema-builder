import { flow } from "lodash/fp";
import { z } from "zod";

import { createType } from "../types";

import type { FieldOptionKeys } from "../fields";
import type { SanityType, TypeValidation } from "../types";
import type { Faker } from "@faker-js/faker";
import type { Schema } from "@sanity/types";

export const text = ({
  length,
  max,
  min,
  mock = (faker: Faker) => faker.lorem.paragraphs(),
  regex,
  validation,
  ...def
}: Omit<
  TypeValidation<Schema.TextDefinition, string>,
  FieldOptionKeys | "type"
> & {
  length?: number;
  max?: number;
  min?: number;
  mock?: (faker: Faker) => string;
  regex?: RegExp;
} = {}): SanityType<
  Omit<TypeValidation<Schema.TextDefinition, string>, FieldOptionKeys>,
  z.ZodString
> =>
  createType({
    mock,
    zod: flow(
      (zod: z.ZodString) => (!min ? zod : zod.min(min)),
      (zod) => (!max ? zod : zod.max(max)),
      (zod) => (!length ? zod : zod.length(length)),
      (zod) => (!regex ? zod : zod.regex(regex))
    )(z.string()),
    schema: () => ({
      ...def,
      type: "text",
      validation: flow(
        (rule) => (!min ? rule : rule.min(min)),
        (rule) => (!max ? rule : rule.max(max)),
        (rule) => (!length ? rule : rule.length(length)),
        (rule) => (!regex ? rule : rule.regex(regex)),
        (rule) => validation?.(rule) ?? rule
      ),
    }),
  });
