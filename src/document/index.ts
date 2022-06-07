import { faker } from "@faker-js/faker";
import { z } from "zod";

import { preview } from "../fields";

import type { FieldsType, InferFieldsZod, Preview } from "../fields";
import type { SanityType, TypeValidation } from "../types";
import type { Faker } from "@faker-js/faker";
import type { Schema } from "@sanity/types";

type ZodDocument<
  DocumentNames extends string,
  Fields extends FieldsType<any, any>
> = z.ZodIntersection<
  InferFieldsZod<Fields>,
  z.ZodObject<
    {
      _createdAt: z.ZodType<Date, any, string>;
      _id: z.ZodString;
      _rev: z.ZodString;
      _type: z.ZodLiteral<DocumentNames>;
      _updatedAt: z.ZodType<Date, any, string>;
    },
    "strip"
  >
>;

export interface DocumentType<
  DocumentNames extends string,
  Fields extends FieldsType<any, any>
> extends SanityType<
    TypeValidation<
      Schema.DocumentDefinition,
      z.input<ZodDocument<DocumentNames, Fields>>
    > & { name: DocumentNames },
    ZodDocument<DocumentNames, Fields>
  > {
  name: DocumentNames;
}

export const document = <
  DocumentNames extends string,
  Fields extends FieldsType<any, any>
>(
  def: Omit<
    TypeValidation<
      Schema.DocumentDefinition,
      z.input<ZodDocument<DocumentNames, Fields>>
    >,
    "fields" | "name" | "preview" | "type"
  > & {
    fields: Fields;
    mock?: (faker: Faker) => z.input<ZodDocument<DocumentNames, Fields>>;
    name: DocumentNames;
    preview?: Preview<z.input<ZodDocument<DocumentNames, Fields>>>;
  }
): DocumentType<DocumentNames, Fields> => {
  const {
    name,
    preview: previewDef,
    fields: { schema: fieldsSchema, mock: fieldsMock, zod: fieldsZod },
    mock = () => {
      const createdAt = faker.date
        .between("2021-06-03T03:24:55.395Z", "2022-06-04T18:50:36.539Z")
        .toISOString();

      return {
        ...(fieldsMock() as z.input<InferFieldsZod<Fields>>),
        _id: faker.datatype.uuid(),
        _createdAt: createdAt,
        _rev: faker.datatype.string(23),
        _type: name,
        _updatedAt: faker.date
          .between(createdAt, "2022-06-05T18:50:36.539Z")
          .toISOString(),
      };
    },
  } = def;

  const zod = z.intersection(
    fieldsZod as InferFieldsZod<Fields>,
    z.object({
      _createdAt: z.string().transform((v) => new Date(v)),
      _id: z.string().uuid(),
      _rev: z.string(),
      _type: z.literal(name),
      _updatedAt: z.string().transform((v) => new Date(v)),
    })
  ) as unknown as ZodDocument<DocumentNames, Fields>;

  return {
    name,
    zod,
    parse: zod.parse.bind(zod),
    mock: () => mock(faker),
    schema: () => {
      const schemaForFields = fieldsSchema();

      return {
        ...def,
        type: "document",
        fields: schemaForFields,
        preview: preview(previewDef, schemaForFields),
      };
    },
  };
};
