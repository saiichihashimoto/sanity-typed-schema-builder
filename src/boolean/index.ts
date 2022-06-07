import { faker } from "@faker-js/faker";
import { z } from "zod";

import type { FieldOptionKeys } from "../fields";
import type { SanityType } from "../types";
import type { Faker } from "@faker-js/faker";
import type { Schema } from "@sanity/types";

interface BooleanType
  extends SanityType<
    Omit<Schema.BooleanDefinition, FieldOptionKeys>,
    z.ZodBoolean
  > {}

export const boolean = (
  def: Omit<Schema.BooleanDefinition, FieldOptionKeys | "type"> & {
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
