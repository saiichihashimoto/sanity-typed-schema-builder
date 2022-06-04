import { faker } from "@faker-js/faker";
import { z } from "zod";

import type { SanityType } from "../types";
import type { Faker } from "@faker-js/faker";

interface URLType extends SanityType<URLFieldDef, z.ZodString> {}

export const url = (
  def: Omit<URLFieldDef, "description" | "type"> & {
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
