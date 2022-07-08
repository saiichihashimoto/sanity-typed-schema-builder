import { z } from "zod";

import { createType } from "../types";

import type { SanityTypeDef } from "../types";
import type { Schema } from "@sanity/types";

export const boolean = <ParsedValue = boolean>({
  mock = (faker) => faker.datatype.boolean(),
  zod: zodFn = (zod) => zod as unknown as z.ZodType<ParsedValue, any, boolean>,
  ...def
}: SanityTypeDef<Schema.BooleanDefinition, boolean, ParsedValue> = {}) =>
  createType({
    mock,
    zod: zodFn(z.boolean()),
    schema: () => ({
      ...def,
      type: "boolean",
    }),
  });
