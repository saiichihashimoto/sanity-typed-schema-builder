import { flow } from "lodash/fp";
import { z } from "zod";

import { createType } from "../types";

import type { Rule, SanityTypeDef } from "../types";
import type { Schema } from "@sanity/types";

export const number = <Output = number>({
  greaterThan,
  integer,
  lessThan,
  max,
  min,
  negative,
  positive,
  precision,
  validation,
  mock = (faker) =>
    faker.datatype.number({
      max,
      min,
      precision: 1 / 10 ** (precision ?? 0),
    }),
  zod: zodFn = (zod) => zod as unknown as z.ZodType<Output, any, number>,
  ...def
}: SanityTypeDef<
  Schema.NumberDefinition,
  z.ZodType<number, any, number>,
  Output
> & {
  greaterThan?: number;
  integer?: boolean;
  lessThan?: number;
  max?: number;
  min?: number;
  negative?: boolean;
  positive?: boolean;
  precision?: number;
} = {}) =>
  createType({
    mock,
    zod: flow(
      flow(
        (zod: z.ZodNumber) => (!min ? zod : zod.min(min)),
        (zod) => (!max ? zod : zod.max(max)),
        (zod) => (!greaterThan ? zod : zod.gt(greaterThan)),
        (zod) => (!lessThan ? zod : zod.lt(lessThan)),
        (zod) => (!integer ? zod : zod.int()),
        (zod) => (!positive ? zod : zod.nonnegative()),
        (zod) => (!negative ? zod : zod.negative())
      ),
      (zod) =>
        !precision
          ? zod
          : zod.transform(
              (value) => Math.round(value * 10 ** precision) / 10 ** precision
            ),
      zodFn
    )(z.number()),
    schema: () => ({
      ...def,
      type: "number",
      validation: flow(
        flow(
          (rule: Rule<number>) => (!min ? rule : rule.min(min)),
          (rule) => (!max ? rule : rule.max(max)),
          (rule) => (!greaterThan ? rule : rule.greaterThan(greaterThan)),
          (rule) => (!lessThan ? rule : rule.lessThan(lessThan)),
          (rule) => (!integer ? rule : rule.integer()),
          (rule) => (!positive ? rule : rule.positive()),
          (rule) => (!negative ? rule : rule.negative())
        ),
        (rule) => (!precision ? rule : rule.precision(precision)),
        (rule) => validation?.(rule) ?? rule
      ),
    }),
  });
