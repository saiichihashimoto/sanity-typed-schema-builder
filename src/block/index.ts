import { z } from "zod";

import { createType } from "../types";

import type { FieldOptionKeys } from "../field";
import type { SanityType, TypeValidation } from "../types";
import type { Faker } from "@faker-js/faker";
import type { PortableTextBlock } from "@portabletext/types";
import type { Schema } from "@sanity/types";

export const block = ({
  mock = (faker): PortableTextBlock => ({
    style: "normal",
    _type: "block",
    markDefs: [],
    children: [
      {
        _type: "span",
        text: faker.lorem.paragraph(),
        marks: [],
      },
    ],
  }),
  ...def
}: Omit<
  TypeValidation<Schema.BlockDefinition, PortableTextBlock>,
  FieldOptionKeys | "type"
> & {
  mock?: (faker: Faker) => PortableTextBlock;
} = {}): SanityType<
  Omit<
    TypeValidation<Schema.BlockDefinition, PortableTextBlock>,
    FieldOptionKeys
  >,
  z.ZodType<PortableTextBlock>
> =>
  createType({
    mock,
    // TODO Validate PortableTextBlock somehow
    zod: z.any(),
    schema: () => ({
      ...def,
      type: "block",
    }),
  });
