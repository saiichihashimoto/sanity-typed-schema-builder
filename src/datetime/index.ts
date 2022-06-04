import { flow } from "lodash/fp";
import { z } from "zod";

import type { SanityType } from "../types";

interface BooleanType
  extends SanityType<DatetimeFieldDef, z.ZodType<Date, any, string>> {}

export const datetime = (
  def: Omit<DatetimeFieldDef, "description" | "type"> & {
    max?: string;
    min?: string;
  } = {}
): BooleanType => {
  const { max, min, validation } = def;

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
    schema: () => ({
      ...def,
      type: "datetime",
      validation: flow(
        (rule) => (!min ? rule : rule.min(min)),
        (rule) => (!max ? rule : rule.max(max)),
        (rule) => validation?.(rule) ?? rule
      ),
    }),
  };
};
