import { z } from "zod";

import { createType } from "../types";

import type { FieldOptionKeys } from "../field";
import type { TypeValidation } from "../types";
import type { Faker } from "@faker-js/faker";
import type {
  PortableTextBlock,
  PortableTextMarkDefinition,
  TypedObject,
} from "@portabletext/types";
import type { Schema } from "@sanity/types";

export const block = ({
  mock = (
    faker
  ): PortableTextBlock<
    PortableTextMarkDefinition,
    TypedObject & Record<string, unknown>,
    string,
    string
  > => ({
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
  TypeValidation<
    Schema.BlockDefinition,
    PortableTextBlock<
      PortableTextMarkDefinition,
      TypedObject & Record<string, unknown>,
      string,
      string
    >
  >,
  FieldOptionKeys | "type"
> & {
  mock?: (
    faker: Faker,
    path: string
  ) => PortableTextBlock<
    PortableTextMarkDefinition,
    TypedObject & Record<string, unknown>,
    string,
    string
  >;
} = {}) =>
  createType({
    mock,
    zod: z.object({
      _key: z.optional(z.string()),
      _type: z.string(),
      level: z.optional(z.number()),
      listItem: z.optional(z.string()),
      style: z.optional(z.string()),
      children: z.array(
        z
          .object({
            _type: z.string(),
            _key: z.optional(z.string()),
          })
          .catchall(z.unknown())
      ),
      markDefs: z.optional(
        z.array(
          z
            .object({
              _type: z.string(),
              _key: z.string(),
            })
            .catchall(z.unknown())
        )
      ),
    }),
    schema: () => ({
      ...def,
      type: "block",
    }),
  });
