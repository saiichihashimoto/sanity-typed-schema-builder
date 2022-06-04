import { faker } from "@faker-js/faker";
import { z } from "zod";

import type { SanityType } from "../types";
import type { Faker } from "@faker-js/faker";

interface BooleanType extends SanityType<BooleanFieldDef, z.ZodBoolean> {}

export const boolean = (
  def: Omit<BooleanFieldDef, "description" | "type"> & {
    mock?: (faker: Faker) => boolean;
  } = {}
): BooleanType => {
  const { mock = () => faker.datatype.boolean() } = def;

  const zod = z.boolean();

  return {
    zod,
    parse: zod.parse.bind(zod),
    mock: () => mock(faker),
    schema: () => ({
      ...def,
      type: "boolean",
    }),
  };
};
