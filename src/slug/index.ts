import { z } from "zod";

import { createType } from "../types";

import type { SanityTypeDef } from "../types";
import type { Schema } from "@sanity/types";

interface SanitySlug {
  _type: "slug";
  current: string;
}

export const slug = <Output = string>({
  mock = (faker) => ({
    _type: "slug",
    current: faker.lorem.slug(),
  }),
  zod: zodFn = (zod) =>
    zod.transform(({ current }) => current) as unknown as z.ZodType<
      Output,
      any,
      SanitySlug
    >,
  ...def
}: SanityTypeDef<
  Schema.SlugDefinition,
  z.ZodType<SanitySlug, any, SanitySlug>,
  Output
> = {}) =>
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
