import { z } from "zod";

import { createType } from "../types";

import type { SanityTypeDef } from "../types";
import type { Schema, Slug } from "@sanity/types";

export type SanitySlug = Slug;

export const slug = <ParsedValue = string>({
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
  ...def
}: SanityTypeDef<Schema.SlugDefinition, SanitySlug, ParsedValue> = {}) =>
  createType({
    mock,
    zod: zodFn(
      z.object({
        _type: z.literal("slug"),
        current: z.string(),
      })
    ),
    schema: () => ({
      ...def,
      type: "slug",
    }),
  });
