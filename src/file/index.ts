import { z } from "zod";

import { fieldsMock, fieldsSchema, fieldsZodObject } from "../field";
import { createType } from "../types";

import type { FieldOptions, FieldsZodObject } from "../field";
import type { SanityTypeDef } from "../types";
import type { Schema } from "@sanity/types";
import type { Merge } from "type-fest";

export const file = <
  Names extends string,
  Zods extends z.ZodTypeAny,
  Optionals extends boolean,
  Zod extends z.ZodObject<
    Merge<
      // eslint-disable-next-line no-use-before-define -- Zod can't be optional, but FieldsArray has to be
      FieldsZodObject<FieldsArray>,
      {
        _type: z.ZodLiteral<"file">;
        asset: z.ZodObject<{
          _ref: z.ZodString;
          _type: z.ZodLiteral<"reference">;
        }>;
      }
    >
  >,
  FieldsArray extends [
    FieldOptions<Names, Zods, Optionals>,
    ...Array<FieldOptions<Names, Zods, Optionals>>
  ] = [never, ...never],
  ParsedValue = z.output<Zod>
>({
  fields,
  mock = (faker, path) =>
    ({
      ...(fields && fieldsMock(fields)(faker, path)),
      _type: "file",
      asset: {
        _type: "reference",
        _ref: faker.datatype.uuid(),
      },
    } as unknown as z.input<Zod>),
  zod: zodFn = (zod) =>
    zod as unknown as z.ZodType<ParsedValue, any, z.input<Zod>>,
  ...def
}: Merge<
  SanityTypeDef<
    Schema.FileDefinition,
    z.input<Zod>,
    ParsedValue,
    z.output<Zod>
  >,
  {
    fields?: FieldsArray;
  }
> = {}) =>
  createType({
    mock,
    zod: zodFn(
      z.object({
        ...(fields && fieldsZodObject(fields)),
        _type: z.literal("file"),
        asset: z.object({
          _ref: z.string(),
          _type: z.literal("reference"),
        }),
      }) as unknown as Zod
    ),
    schema: () => ({
      ...def,
      ...(fields && fieldsSchema(fields)),
      type: "file",
    }),
  });
