import { faker } from "@faker-js/faker";
import { z } from "zod";

import type { FieldOptionKeys } from "../fields";
import type { SanityType, TypeValidation } from "../types";
import type { Faker } from "@faker-js/faker";
import type { Schema } from "@sanity/types";

interface URLType
  extends SanityType<
    Omit<TypeValidation<Schema.UrlDefinition, string>, FieldOptionKeys>,
    z.ZodString
  > {}

export const url = (
  def: Omit<
    TypeValidation<Schema.UrlDefinition, string>,
    FieldOptionKeys | "type"
  > & {
    mock?: (faker: Faker) => string;
  } = {}
): URLType => {
  const { mock = (faker: Faker) => faker.internet.url() } = def;
  const zod = z.string().url();

  return {
    zod,
    parse: zod.parse.bind(zod),
    mock: () => mock(faker),
    schema: () => ({
      ...def,
      type: "url",
    }),
  };
};
