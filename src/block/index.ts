import { z } from "zod";

import { createType } from "../types";

import type { FieldOptionKeys } from "../field";
import type { SanityType, TypeValidation } from "../types";
import type { Faker } from "@faker-js/faker";
import type { PortableTextBlock } from "@portabletext/types";
import type { Schema } from "@sanity/types";

interface BlockType
  extends SanityType<
    Omit<
      TypeValidation<Schema.BlockDefinition, PortableTextBlock>,
      FieldOptionKeys
    >,
    z.ZodType<PortableTextBlock>
  > {}

type BlockDef = Omit<
  TypeValidation<Schema.BlockDefinition, PortableTextBlock>,
  FieldOptionKeys | "type"
>;

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
}: BlockDef & {
  mock?: (faker: Faker) => PortableTextBlock;
} = {}): BlockType =>
  createType({
    mock,
    // TODO Validate PortableTextBlock somehow
    zod: z.any(),
    schema: () => ({
      ...def,
      type: "block",
    }),
  });
