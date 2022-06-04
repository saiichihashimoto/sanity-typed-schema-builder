import { faker } from "@faker-js/faker";
import { z } from "zod";

import type { FieldsType, InferFieldNames, InferFieldsZod } from "../fields";
import type { SanityType } from "../types";
import type { Faker } from "@faker-js/faker";
import type { DocumentDef } from "@sanity/base";

type ZodDocument<
  DocumentName extends string,
  Fields extends FieldsType<any, any>
> = z.ZodIntersection<
  InferFieldsZod<Fields>,
  z.ZodObject<
    {
      _createdAt: z.ZodType<Date, any, string>;
      _id: z.ZodString;
      _rev: z.ZodString;
      _type: z.ZodLiteral<DocumentName>;
      _updatedAt: z.ZodType<Date, any, string>;
    },
    "strip"
  >
>;

export interface DocumentType<
  DocumentName extends string,
  Fields extends FieldsType<any, any>
> extends SanityType<
    DocumentDef<
      DocumentName,
      never,
      InferFieldNames<Fields>,
      never,
      never,
      never
    >,
    ZodDocument<DocumentName, Fields>
  > {
  name: DocumentName;
}

export const document = <
  DocumentName extends string,
  Fields extends FieldsType<any, any>
>(
  def: Omit<
    DocumentDef<
      DocumentName,
      never,
      InferFieldNames<Fields>,
      never,
      never,
      never
    >,
    "fields" | "type"
  > & {
    fields: Fields;
    mock?: (faker: Faker) => z.input<ZodDocument<DocumentName, Fields>>;
  }
): DocumentType<DocumentName, Fields> => {
  const {
    name,
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
  ) as unknown as ZodDocument<DocumentName, Fields>;

  return {
    name,
    zod,
    parse: zod.parse.bind(zod),
    mock: () => mock(faker),
    schema: () => ({
      ...def,
      type: "document",
      fields: fieldsSchema(),
    }),
  };
};
