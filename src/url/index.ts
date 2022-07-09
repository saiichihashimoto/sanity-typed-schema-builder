import { z } from "zod";

import { createType } from "../types";

import type { SanityTypeDef } from "../types";
import type { Schema } from "@sanity/types";

const zod = z.string().url();

export const url = <ParsedValue = string, ResolvedValue = string>({
  mock = (faker) => faker.internet.url(),
  zod: zodFn = (zod) => zod as unknown as z.ZodType<ParsedValue, any, string>,
  zodResolved,
  ...def
}: SanityTypeDef<
  Schema.UrlDefinition,
  string,
  ParsedValue,
  ResolvedValue
> = {}) =>
  createType({
    mock,
    schema: () => ({
      ...def,
      type: "url",
    }),
    zod: zodFn(zod),
    zodResolved: zodResolved?.(zod),
  });
