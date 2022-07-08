import { z } from "zod";

import { fieldsMock, fieldsSchema, fieldsZodObject } from "../field";
import { createType } from "../types";

import type { FieldOptions, FieldsZodObject, Preview } from "../field";
import type { SanityTypeDef } from "../types";
import type { Schema } from "@sanity/types";
import type { Merge } from "type-fest";

export const object = <
  Names extends string,
  Zods extends z.ZodTypeAny,
  Optionals extends boolean,
  FieldsArray extends readonly [
    FieldOptions<Names, Zods, Optionals>,
    ...Array<FieldOptions<Names, Zods, Optionals>>
  ],
  Zod extends z.ZodObject<FieldsZodObject<FieldsArray>>,
  ParsedValue = z.output<Zod>,
  // eslint-disable-next-line @typescript-eslint/ban-types -- All other values assume keys
  Select extends Record<string, string> = {}
>({
  fields,
  preview: previewDef,
  mock = fieldsMock(fields),
  zod: zodFn = (zod) =>
    zod as unknown as z.ZodType<ParsedValue, any, z.input<Zod>>,
  ...def
}: Merge<
  SanityTypeDef<
    Schema.ObjectDefinition,
    z.input<Zod>,
    ParsedValue,
    z.output<Zod>
  >,
  {
    fields: FieldsArray;
    preview?: Preview<z.input<Zod>, Select>;
  }
>) =>
  createType({
    mock,
    zod: zodFn(z.object(fieldsZodObject(fields))),
    schema: () => ({
      ...def,
      ...fieldsSchema(fields, previewDef),
      type: "object",
    }),
  });
