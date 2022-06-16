import { flow } from "lodash/fp";
import { z } from "zod";

import { listMock, listToListValues } from "../list";
import { createType, zodUnion } from "../types";

import type { WithTypedOptionsList } from "../list";
import type { Rule, SanityTypeDef } from "../types";
import type { Schema } from "@sanity/types";

export const number = <Input extends number, Output = Input>({
  greaterThan,
  integer,
  lessThan,
  max,
  min,
  options,
  negative,
  positive,
  precision,
  validation,
  options: { list = undefined } = {},
  mock = listMock(
    list,
    (faker) =>
      faker.datatype.number({
        max,
        min,
        precision: 1 / 10 ** (precision ?? 0),
      }) as Input
  ),
  zod: zodFn = (zod) => zod as unknown as z.ZodType<Output, any, Input>,
  ...def
}: SanityTypeDef<
  WithTypedOptionsList<Input, Schema.NumberDefinition>,
  z.ZodType<Input, any, Input>,
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
    zod: zodFn(
      !list?.length
        ? flow(
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
                    (value) =>
                      Math.round(value * 10 ** precision) / 10 ** precision
                  ),
            (zod) => zod as unknown as z.ZodType<Input, any, Input>
          )(z.number())
        : zodUnion(
            listToListValues<Input>(list).map((value) => z.literal(value))
          )
    ),
    schema: () => ({
      ...def,
      options,
      type: "number",
      validation: flow(
        flow(
          (rule: Rule<Input>) => (!min ? rule : rule.min(min)),
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
