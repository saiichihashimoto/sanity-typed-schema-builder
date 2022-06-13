import { z } from "zod";

import { preview } from "../field";
import { createType } from "../types";

import type { FieldsType, InferFieldsZod, Preview } from "../field";
import type { SanityType, TypeValidation } from "../types";
import type { Faker } from "@faker-js/faker";
import type { Schema } from "@sanity/types";

type ZodDocument<
  DocumentNames extends string,
  Fields extends FieldsType<any, any>
> = InferFieldsZod<Fields> extends z.ZodObject<infer T, any, any, any, any>
  ? z.ZodObject<
      z.extendShape<
        T,
        {
          _createdAt: z.ZodType<Date, any, string>;
          _id: z.ZodString;
          _rev: z.ZodString;
          _type: z.ZodLiteral<DocumentNames>;
          _updatedAt: z.ZodType<Date, any, string>;
        }
      >
    >
  : never;

export interface DocumentType<
  DocumentNames extends string,
  Fields extends FieldsType<any, any>,
  Output = z.output<ZodDocument<DocumentNames, Fields>>
> extends SanityType<
    TypeValidation<
      Schema.DocumentDefinition,
      z.input<ZodDocument<DocumentNames, Fields>>
    > & { name: DocumentNames },
    z.ZodType<Output, any, z.input<ZodDocument<DocumentNames, Fields>>>
  > {
  name: DocumentNames;
}

export const document = <
  DocumentNames extends string,
  Fields extends FieldsType<any, any>,
  // eslint-disable-next-line @typescript-eslint/ban-types -- All other values assume keys
  Select extends Record<string, string> = {},
  Output = z.output<ZodDocument<DocumentNames, Fields>>
>({
  name,
  preview: previewDef,
  fields: { schema: fieldsSchema, mock: fieldsMock, zod: fieldsZod },
  mock = (faker, path) => {
    const createdAt = faker.date
      .between("2021-06-03T03:24:55.395Z", "2022-06-04T18:50:36.539Z")
      .toISOString();

    return {
      ...(fieldsMock(path) as z.input<InferFieldsZod<Fields>>),
      _id: faker.datatype.uuid(),
      _createdAt: createdAt,
      _rev: faker.datatype.string(23),
      _type: name,
      _updatedAt: faker.date
        .between(createdAt, "2022-06-05T18:50:36.539Z")
        .toISOString(),
    };
  },
  zod: zodFn = (zod) =>
    zod as unknown as z.ZodType<
      Output,
      any,
      z.input<ZodDocument<DocumentNames, Fields>>
    >,
  ...def
}: Omit<
  TypeValidation<
    Schema.DocumentDefinition,
    z.input<ZodDocument<DocumentNames, Fields>>
  >,
  "fields" | "name" | "preview" | "type"
> & {
  fields: Fields;
  mock?: (
    faker: Faker,
    path: string
  ) => z.input<ZodDocument<DocumentNames, Fields>>;
  name: DocumentNames;
  preview?: Preview<z.input<ZodDocument<DocumentNames, Fields>>, Select>;
  zod?: (
    zod: z.ZodType<
      z.input<ZodDocument<DocumentNames, Fields>>,
      any,
      z.input<ZodDocument<DocumentNames, Fields>>
    >
  ) => z.ZodType<Output, any, z.input<ZodDocument<DocumentNames, Fields>>>;
}): DocumentType<DocumentNames, Fields, Output> => ({
  name,
  ...createType({
    mock,
    zod: zodFn(
      (fieldsZod as InferFieldsZod<Fields>).extend({
        _createdAt: z.string().transform((v) => new Date(v)),
        _id: z.string().uuid(),
        _rev: z.string(),
        _type: z.literal(name),
        _updatedAt: z.string().transform((v) => new Date(v)),
      }) as unknown as ZodDocument<DocumentNames, Fields>
    ),
    schema: () => {
      const schemaForFields = fieldsSchema();

      return {
        ...def,
        name,
        type: "document",
        fields: schemaForFields,
        preview: preview(previewDef, schemaForFields),
      };
    },
  }),
});
