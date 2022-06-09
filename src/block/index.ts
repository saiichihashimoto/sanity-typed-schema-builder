import { z } from "zod";

import type { FieldOptionKeys } from "../fields";
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

export const block = (
  def: BlockDef & {
    mock?: (faker: Faker) => PortableTextBlock;
  } = {}
): BlockType => {
  const {
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
  } = def;
  // TODO Validate PortableTextBlock somehow
  const zod = z.any();

  return {
    zod,
    parse: zod.parse.bind(zod),
    mock,
    schema: () => ({
      ...def,
      type: "block",
    }),
  };
};
