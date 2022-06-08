import { faker } from "@faker-js/faker";
import { flow } from "lodash/fp";
import { z } from "zod";

import type { FieldOptionKeys } from "../fields";
import type { SanityType, TypeValidation } from "../types";
import type { Faker } from "@faker-js/faker";
import type { Schema } from "@sanity/types";

interface DatetimeType
  extends SanityType<
    Omit<TypeValidation<Schema.DatetimeDefinition, string>, FieldOptionKeys>,
    z.ZodType<Date, any, string>
  > {}

export const datetime = (
  def: Omit<
    TypeValidation<Schema.DatetimeDefinition, string>,
    FieldOptionKeys | "type"
  > & {
    max?: string;
    min?: string;
    mock?: (faker: Faker) => string;
  } = {}
): DatetimeType => {
  const {
    max,
    min,
    validation,
    mock = () =>
      faker.date
        .between(
          min ?? "2021-06-03T03:24:55.395Z",
          max ?? "2022-06-04T18:50:36.539Z"
        )
        .toISOString(),
  } = def;

  const zod = flow(
    (zod: z.ZodType<Date, any, string>) =>
      !min
        ? zod
        : zod.refine((date) => new Date(min) <= date, {
            message: `Greater than ${min}`,
          }),
    (zod: z.ZodType<Date, any, string>) =>
      !max
        ? zod
        : zod.refine((date) => date <= new Date(max), {
            message: `Less than ${max}`,
          })
  )(
    z
      .string()
      .transform((value) => new Date(value))
      .refine((date) => date.toString() !== "Invalid Date", {
        message: "Invalid Date",
      })
  );

  return {
    zod,
    parse: zod.parse.bind(zod),
    mock: () => mock(faker),
    schema: () => ({
      ...def,
      type: "datetime",
      validation: flow(
        // HACK min/max should allow strings only for datetime, but right now are typed as numbers
        (rule) => (!min ? rule : rule.min(min as unknown as number)),
        (rule) => (!max ? rule : rule.max(max as unknown as number)),
        (rule) => validation?.(rule) ?? rule
      ),
    }),
  };
};