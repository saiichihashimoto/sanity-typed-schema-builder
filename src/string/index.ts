import { flow, map } from "lodash/fp";
import { z } from "zod";

import { listMock, listValueToValue } from "../list";
import { createType, zodUnion } from "../types";

import type { WithTypedOptionsList } from "../list";
import type { Rule, SanityTypeDef } from "../types";
import type { Schema } from "@sanity/types";

export const string = <TypedValue extends string, ParsedValue = TypedValue>({
  length,
  max,
  min,
  options,
  regex,
  validation,
  options: { list } = {},
  mock = !list
    ? (faker) => faker.random.word() as TypedValue
    : listMock<TypedValue>(list),
  zod: zodFn = (zod) =>
    zod as unknown as z.ZodType<ParsedValue, any, TypedValue>,
  ...def
}: SanityTypeDef<
  WithTypedOptionsList<TypedValue, Schema.StringDefinition>,
  TypedValue,
  ParsedValue
> & {
  length?: number;
  max?: number;
  min?: number;
  regex?: RegExp;
} = {}) =>
  createType({
    mock,
    zod: zodFn(
      !list
        ? flow(
            (zod: z.ZodString) => (!min ? zod : zod.min(min)),
            (zod) => (!max ? zod : zod.max(max)),
            (zod) => (!length ? zod : zod.length(length)),
            (zod) => (!regex ? zod : zod.regex(regex)),
            (zod) => zod as unknown as z.ZodType<TypedValue, any, TypedValue>
          )(z.string())
        : flow(
            (value: typeof list) => value,
            map(flow(listValueToValue, z.literal)),
            zodUnion
          )(list)
    ),
    schema: () => ({
      ...def,
      options,
      type: "string",
      validation: flow(
        (rule: Rule<TypedValue>) => (!min ? rule : rule.min(min)),
        (rule) => (!max ? rule : rule.max(max)),
        (rule) => (!length ? rule : rule.length(length)),
        (rule) => (!regex ? rule : rule.regex(regex)),
        (rule) => validation?.(rule) ?? rule
      ),
    }),
  });
