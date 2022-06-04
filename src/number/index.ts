import { flow } from "lodash/fp";
import { z } from "zod";

import type { SanityType } from "../types";

interface NumberType extends SanityType<NumberFieldDef, z.ZodNumber> {}

type NumberDef = Omit<NumberFieldDef, "description" | "type"> & {
  greaterThan?: number;
  integer?: boolean;
  lessThan?: number;
  max?: number;
  min?: number;
  negative?: boolean;
  positive?: boolean;
  precision?: number;
};

export const number = (def: NumberDef = {}): NumberType => {
  const {
    greaterThan,
    integer,
    lessThan,
    max,
    min,
    negative,
    positive,
    precision,
    validation,
  } = def;

  const zod = flow(
    flow(
      (zod: z.ZodNumber) => (!min ? zod : zod.min(min)),
      (zod) => (!max ? zod : zod.max(max)),
      (zod) => (!greaterThan ? zod : zod.gt(greaterThan)),
      (zod) => (!lessThan ? zod : zod.lt(lessThan)),
      (zod) => (!integer ? zod : zod.int()),
      (zod) => (!positive ? zod : zod.nonnegative()),
      (zod) => (!negative ? zod : zod.negative())
    ),
    (zod) => (!precision ? zod : zod.multipleOf(1 / 10 ** precision))
  )(z.number());

  return {
    zod,
    parse: zod.parse.bind(zod),
    schema: () => ({
      ...def,
      type: "number",
      validation: flow(
        flow(
          (rule) => (!min ? rule : rule.min(min)),
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
  };
};
