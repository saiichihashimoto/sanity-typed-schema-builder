import { flow } from "lodash/fp";
import { z } from "zod";

import { createType } from "../types";

import type { Rule, SanityTypeDef } from "../types";
import type { Schema } from "@sanity/types";

export const datetime = <ParsedValue = Date, ResolvedValue = Date>({
  max,
  min,
  validation,
  mock = (faker) =>
    faker.date
      .between(
        min ?? "2021-06-03T03:24:55.395Z",
        max ?? "2022-06-04T18:50:36.539Z"
      )
      .toISOString(),
  zod: zodFn = (zod) =>
    zod
      .transform((value) => new Date(value))
      .refine((date) => date.toString() !== "Invalid Date", {
        message: "Invalid Date",
      }) as unknown as z.ZodType<ParsedValue, any, string>,
  zodResolved,
  ...def
}: SanityTypeDef<
  Schema.DatetimeDefinition,
  string,
  ParsedValue,
  ResolvedValue
> & {
  max?: string;
  min?: string;
} = {}) => {
  const zod = flow(
    (zod: z.ZodType<string, any, string>) =>
      !min
        ? zod
        : zod.refine((date) => new Date(min) <= new Date(date), {
            message: `Greater than ${min}`,
          }),
    (zod) =>
      !max
        ? zod
        : zod.refine((date) => new Date(date) <= new Date(max), {
            message: `Less than ${max}`,
          })
  )(z.string());

  return createType({
    mock,
    schema: () => ({
      ...def,
      type: "datetime",
      validation: flow(
        (rule: Rule<string>) =>
          !min ? rule : rule.min(min as unknown as number),
        (rule) => (!max ? rule : rule.max(max as unknown as number)),
        (rule) => validation?.(rule) ?? rule
      ),
    }),
    zod: zodFn(zod),
    zodResolved: zodResolved?.(zod),
  });
};
