import { z } from "zod";

import { createType } from "../types";

import type { FieldOptionKeys } from "../field";
import type { TypeValidation } from "../types";
import type { Faker } from "@faker-js/faker";
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
}: Omit<
  TypeValidation<Schema.SlugDefinition, SanitySlug>,
  FieldOptionKeys | "type"
> & {
  mock?: (faker: Faker, path: string) => SanitySlug;
  zod?: (
    zod: z.ZodType<SanitySlug, any, SanitySlug>
  ) => z.ZodType<Output, any, SanitySlug>;
} = {}) =>
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
