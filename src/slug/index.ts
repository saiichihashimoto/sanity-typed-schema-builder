import { z } from "zod";

import { createType } from "../types";

import type { SanityTypeDef } from "../types";
import type { Schema, Slug } from "@sanity/types";

export type SanitySlug = Slug;

const zod: z.ZodType<SanitySlug, any, SanitySlug> = z.object({
  _type: z.literal("slug"),
  current: z.string(),
});

export const slug = <ParsedValue = string, ResolvedValue = string>({
  mock = (faker) => ({
    _type: "slug",
    current: faker.lorem.slug(),
  }),
  zod: zodFn = (zod) =>
    zod.transform(({ current }) => current) as unknown as z.ZodType<
      ParsedValue,
      any,
      SanitySlug
    >,
  zodResolved,
  ...def
}: SanityTypeDef<
  Schema.SlugDefinition,
  SanitySlug,
  ParsedValue,
  ResolvedValue
> = {}) =>
  createType({
    mock,
    schema: () => ({
      ...def,
      type: "slug",
    }),
    zod: zodFn(zod),
    zodResolved: zodResolved?.(zod),
  });
