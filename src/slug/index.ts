import { faker } from "@faker-js/faker";
import { z } from "zod";

import type { SanityType } from "../types";
import type { Faker } from "@faker-js/faker";

interface SanitySlug {
  _type: "slug";
  current: string;
}

interface SlugType
  extends SanityType<
    SlugFieldDef<string>,
    z.ZodType<string, any, SanitySlug>
  > {}

export const slug = (
  def: Omit<SlugFieldDef<string>, "description" | "type"> & {
    mock?: (faker: Faker) => SanitySlug;
  } = {}
): SlugType => {
  const {
    mock = (faker: Faker) => ({
      _type: "slug",
      current: faker.lorem.slug(),
    }),
  } = def;
  const zod = z
    .object({
      _type: z.literal("slug"),
      current: z.string(),
    })
    .transform(({ current }) => current);

  return {
    zod,
    parse: zod.parse.bind(zod),
    mock: () => mock(faker),
    schema: () => ({
      ...def,
      type: "slug",
    }),
  };
};
