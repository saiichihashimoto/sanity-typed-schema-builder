import { z } from "zod";

import {
  fieldsMock,
  fieldsSchema,
  fieldsZodObject,
  fieldsZodResolvedObject,
} from "../field";
import { referenceZod } from "../reference";
import { createType } from "../types";

import type {
  FieldOptions,
  FieldsZodObject,
  FieldsZodResolvedObject,
} from "../field";
import type { SanityReference } from "../reference";
import type { SanityTypeDef, TupleOfLength } from "../types";
import type { Schema } from "@sanity/types";
import type { Merge } from "type-fest";

export interface SanityFile {
  _type: "file";
  asset: SanityReference;
}

const extraZodFields = {
  _type: z.literal("file"),
  asset: referenceZod(false),
};

export const file = <
  Names extends string,
  Zods extends z.ZodTypeAny,
  ResolvedValues,
  Optionals extends boolean,
  Zod extends z.ZodObject<
    Merge<
      // eslint-disable-next-line no-use-before-define -- Zod can't be optional, but FieldsArray has to be
      FieldsZodObject<FieldsArray>,
      typeof extraZodFields
    >
  >,
  ZodResolved extends z.ZodObject<
    // eslint-disable-next-line no-use-before-define -- ZodResolved can't be optional, but FieldsArray has to be
    Merge<FieldsZodResolvedObject<FieldsArray>, typeof extraZodFields>
  >,
  FieldsArray extends TupleOfLength<
    FieldOptions<Names, Zods, ResolvedValues, Optionals>,
    1
  > = [never, ...never],
  ParsedValue = z.output<Zod>,
  ResolvedValue = z.output<ZodResolved>
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
  zodResolved = (zod) =>
    zod as unknown as z.ZodType<ResolvedValue, any, z.input<Zod>>,
  ...def
}: Merge<
  SanityTypeDef<
    Schema.FileDefinition,
    z.input<Zod>,
    ParsedValue,
    ResolvedValue,
    z.output<Zod>,
    z.output<ZodResolved>
  >,
  {
    fields?: FieldsArray;
  }
> = {}) =>
  createType({
    mock,
    schema: () => ({
      ...def,
      ...(fields && fieldsSchema(fields)),
      type: "file",
    }),
    zod: zodFn(
      z.object({
        ...(fields && fieldsZodObject(fields)),
        ...extraZodFields,
      }) as unknown as Zod
    ),
    zodResolved: zodResolved(
      z.object({
        ...(fields && fieldsZodResolvedObject(fields)),
        ...extraZodFields,
      }) as unknown as z.ZodType<z.output<ZodResolved>, any, z.input<Zod>>
    ),
  });
