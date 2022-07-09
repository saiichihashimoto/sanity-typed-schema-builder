import { flow } from "lodash/fp";
import { z } from "zod";

import { createType } from "../types";

import type { Rule, SanityTypeDef } from "../types";
import type { Schema } from "@sanity/types";

export const text = <ParsedValue = string, ResolvedValue = string>({
  length,
  max,
  min,
  mock = (faker) => faker.lorem.paragraphs(),
  regex,
  validation,
  zod: zodFn = (zod) => zod as unknown as z.ZodType<ParsedValue, any, string>,
  zodResolved,
  ...def
}: SanityTypeDef<Schema.TextDefinition, string, ParsedValue, ResolvedValue> & {
  length?: number;
  max?: number;
  min?: number;
  regex?: RegExp;
} = {}) => {
  const zod = flow(
    (zod: z.ZodString) => (!min ? zod : zod.min(min)),
    (zod) => (!max ? zod : zod.max(max)),
    (zod) => (!length ? zod : zod.length(length)),
    (zod) => (!regex ? zod : zod.regex(regex))
  )(z.string());

  return createType({
    mock,
    schema: () => ({
      ...def,
      type: "text",
      validation: flow(
        (rule: Rule<string>) => (!min ? rule : rule.min(min)),
        (rule) => (!max ? rule : rule.max(max)),
        (rule) => (!length ? rule : rule.length(length)),
        (rule) => (!regex ? rule : rule.regex(regex)),
        (rule) => validation?.(rule) ?? rule
      ),
    }),
    zod: zodFn(zod),
    zodResolved: zodResolved?.(zod),
  });
};
