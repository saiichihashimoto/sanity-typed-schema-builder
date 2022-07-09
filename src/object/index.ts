import { z } from "zod";

import {
  fieldsMock,
  fieldsSchema,
  fieldsZodObject,
  fieldsZodResolvedObject,
} from "../field";
import { createType } from "../types";

import type {
  FieldOptions,
  FieldsZodObject,
  FieldsZodResolvedObject,
  Preview,
} from "../field";
import type { SanityTypeDef } from "../types";
import type { Schema } from "@sanity/types";
import type { Merge } from "type-fest";

export const object = <
  Names extends string,
  Zods extends z.ZodTypeAny,
  ResolvedValues,
  Optionals extends boolean,
  FieldsArray extends readonly [
    FieldOptions<Names, Zods, ResolvedValues, Optionals>,
    ...Array<FieldOptions<Names, Zods, ResolvedValues, Optionals>>
  ],
  Zod extends z.ZodObject<FieldsZodObject<FieldsArray>>,
  ZodResolved extends z.ZodObject<FieldsZodResolvedObject<FieldsArray>>,
  ParsedValue = z.output<Zod>,
  ResolvedValue = z.output<ZodResolved>,
  // eslint-disable-next-line @typescript-eslint/ban-types -- All other values assume keys
  Select extends Record<string, string> = {}
>({
  fields,
  preview: previewDef,
  mock = fieldsMock(fields),
  zod: zodFn = (zod) =>
    zod as unknown as z.ZodType<ParsedValue, any, z.input<Zod>>,
  zodResolved = (zod) =>
    zod as unknown as z.ZodType<ResolvedValue, any, z.input<Zod>>,
  ...def
}: Merge<
  SanityTypeDef<
    Schema.ObjectDefinition,
    z.input<Zod>,
    ParsedValue,
    ResolvedValue,
    z.output<Zod>,
    z.output<ZodResolved>
  >,
  {
    fields: FieldsArray;
    preview?: Preview<z.input<Zod>, Select>;
  }
>) =>
  createType({
    mock,
    schema: () => ({
      ...def,
      ...fieldsSchema(fields, previewDef),
      type: "object",
    }),
    zod: zodFn(z.object(fieldsZodObject(fields)) as Zod),
    zodResolved: zodResolved(
      z.object(fieldsZodResolvedObject(fields)) as unknown as z.ZodType<
        z.output<ZodResolved>,
        any,
        z.input<Zod>
      >
    ),
  });
