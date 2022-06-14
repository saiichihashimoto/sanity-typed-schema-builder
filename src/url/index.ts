import { z } from "zod";

import { createType } from "../types";

import type { SanityTypeDef } from "../types";
import type { Schema } from "@sanity/types";

export const url = <Output = string>({
  mock = (faker) => faker.internet.url(),
  zod: zodFn = (zod) => zod as unknown as z.ZodType<Output, any, string>,
  ...def
}: SanityTypeDef<Schema.UrlDefinition, z.ZodString, Output> = {}) =>
  createType({
    mock,
    zod: zodFn(z.string().url()),
    schema: () => ({
      ...def,
      type: "url",
    }),
  });
