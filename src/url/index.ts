import { faker } from "@faker-js/faker";
import { z } from "zod";

import type { FieldOptionKeys } from "../fields";
import type { SanityType } from "../types";
import type { Faker } from "@faker-js/faker";
import type { Schema } from "@sanity/types";

interface URLType
  extends SanityType<
    Omit<Schema.UrlDefinition, FieldOptionKeys>,
    z.ZodString
  > {}

export const url = (
  def: Omit<Schema.UrlDefinition, FieldOptionKeys | "type"> & {
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
