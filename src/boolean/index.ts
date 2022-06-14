import { z } from "zod";

import { createType } from "../types";

import type { SanityTypeDef } from "../types";
import type { Schema } from "@sanity/types";

export const boolean = <Output = boolean>({
  mock = (faker) => faker.datatype.boolean(),
  zod: zodFn = (zod) => zod as unknown as z.ZodType<Output, any, boolean>,
  ...def
}: SanityTypeDef<Schema.BooleanDefinition, z.ZodBoolean, Output> = {}) =>
  createType({
    mock,
    zod: zodFn(z.boolean()),
    schema: () => ({
      ...def,
      type: "boolean",
    }),
  });
