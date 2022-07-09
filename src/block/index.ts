import { z } from "zod";

import { createType } from "../types";

import type { SanityTypeDef } from "../types";
import type {
  PortableTextBlock,
  PortableTextMarkDefinition,
  TypedObject,
} from "@portabletext/types";
import type { Schema } from "@sanity/types";

type DefaultPortableTextBlock = PortableTextBlock<
  PortableTextMarkDefinition,
  TypedObject & Record<string, unknown>,
  string,
  string
>;

const zod: z.ZodType<DefaultPortableTextBlock, any, DefaultPortableTextBlock> =
  z.object({
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
  });

export const block = <
  ParsedValue = DefaultPortableTextBlock,
  ResolvedValue = DefaultPortableTextBlock
>({
  mock = (faker) => ({
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
  zod: zodFn = (zod) =>
    zod as unknown as z.ZodType<ParsedValue, any, DefaultPortableTextBlock>,
  zodResolved,
  ...def
}: SanityTypeDef<
  Schema.BlockDefinition,
  DefaultPortableTextBlock,
  ParsedValue,
  ResolvedValue
> = {}) =>
  createType({
    mock,
    schema: () => ({
      ...def,
      type: "block",
    }),
    zod: zodFn(zod),
    zodResolved: zodResolved?.(zod),
  });
