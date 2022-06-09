import { z } from "zod";

import { createType } from "../types";

import type { FieldOptionKeys } from "../fields";
import type { SanityType, TypeValidation } from "../types";
import type { Faker } from "@faker-js/faker";
import type { Schema } from "@sanity/types";

interface SanitySlug {
  _type: "slug";
  current: string;
}

export const slug = ({
  mock = (faker: Faker) => ({
    _type: "slug",
    current: faker.lorem.slug(),
  }),
  ...def
}: Omit<
  TypeValidation<Schema.SlugDefinition, SanitySlug>,
  FieldOptionKeys | "type"
> & {
  mock?: (faker: Faker) => SanitySlug;
} = {}): SanityType<
  Omit<TypeValidation<Schema.SlugDefinition, SanitySlug>, FieldOptionKeys>,
  z.ZodType<string, any, SanitySlug>
> =>
  createType({
    mock,
    zod: z
      .object({
        _type: z.literal("slug"),
        current: z.string(),
      })
      .transform(({ current }) => current),
    schema: () => ({
      ...def,
      type: "slug",
    }),
  });
