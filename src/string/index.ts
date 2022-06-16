import { flow } from "lodash/fp";
import { z } from "zod";

import { listMock, listToListValues } from "../list";
import { createType, zodUnion } from "../types";

import type { WithTypedOptionsList } from "../list";
import type { Rule, SanityTypeDef } from "../types";
import type { Schema } from "@sanity/types";

export const string = <Input extends string, Output = Input>({
  length,
  max,
  min,
  options,
  regex,
  validation,
  options: { list = undefined } = {},
  mock = listMock(list, (faker) => faker.random.word() as Input),
  zod: zodFn = (zod) => zod as unknown as z.ZodType<Output, any, Input>,
  ...def
}: SanityTypeDef<
  WithTypedOptionsList<Input, Schema.StringDefinition>,
  z.ZodType<Input, any, Input>,
  Output
> & {
  length?: number;
  max?: number;
  min?: number;
  regex?: RegExp;
} = {}) =>
  createType({
    mock,
    zod: zodFn(
      !list?.length
        ? flow(
            (zod: z.ZodString) => (!min ? zod : zod.min(min)),
            (zod) => (!max ? zod : zod.max(max)),
            (zod) => (!length ? zod : zod.length(length)),
            (zod) => (!regex ? zod : zod.regex(regex)),
            (zod) => zod as unknown as z.ZodType<Input, any, Input>
          )(z.string())
        : zodUnion(
            listToListValues<Input>(list).map((value) => z.literal(value))
          )
    ),
    schema: () => ({
      ...def,
      options,
      type: "string",
      validation: flow(
        (rule: Rule<Input>) => (!min ? rule : rule.min(min)),
        (rule) => (!max ? rule : rule.max(max)),
        (rule) => (!length ? rule : rule.length(length)),
        (rule) => (!regex ? rule : rule.regex(regex)),
        (rule) => validation?.(rule) ?? rule
      ),
    }),
  });
