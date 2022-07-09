import { keyBy } from "lodash/fp";
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
import type {
  SanityNamedTypeDef,
  SanityType,
  WithTypedValidation,
} from "../types";
import type { Faker } from "@faker-js/faker";
import type {
  SanityDocument as SanityDocumentOriginal,
  Schema,
} from "@sanity/types";
import type { Merge, RemoveIndexSignature } from "type-fest";

export interface DocumentType<
  DocumentName extends string,
  Value,
  ParsedValue,
  ResolvedValue
> extends SanityType<
    Merge<
      WithTypedValidation<Schema.DocumentDefinition, Value>,
      {
        name: DocumentName;
      }
    >,
    Value,
    ParsedValue,
    ResolvedValue
  > {
  getMockById: (id: string) => Value | undefined;
  getNthMock: (faker: Faker, n: number) => Value;
  name: DocumentName;
}

export type SanityDocument<DocumentName extends string = string> = Merge<
  RemoveIndexSignature<SanityDocumentOriginal>,
  {
    _type: DocumentName;
  }
>;

export type ParsedSanityDocument<DocumentName extends string = string> = Merge<
  SanityDocument<DocumentName>,
  {
    _createdAt: Date;
    _updatedAt: Date;
  }
>;

interface ExtraZodFields<DocumentName extends string> {
  _createdAt: z.ZodType<Date, any, string>;
  _id: z.ZodString;
  _rev: z.ZodString;
  _type: z.ZodLiteral<DocumentName>;
  _updatedAt: z.ZodType<Date, any, string>;
}

const extraZodFields = <DocumentNames extends string>(name: DocumentNames) => ({
  _createdAt: z.string().transform((v) => new Date(v)),
  _id: z.string().uuid(),
  _rev: z.string(),
  _type: z.literal(name),
  _updatedAt: z.string().transform((v) => new Date(v)),
});

export const document = <
  DocumentName extends string,
  Names extends string,
  Zods extends z.ZodTypeAny,
  ResolvedValues,
  Optionals extends boolean,
  FieldsArray extends readonly [
    FieldOptions<Names, Zods, ResolvedValues, Optionals>,
    ...Array<FieldOptions<Names, Zods, ResolvedValues, Optionals>>
  ],
  Zod extends z.ZodObject<
    Merge<FieldsZodObject<FieldsArray>, ExtraZodFields<DocumentName>>
  >,
  ParsedValue = z.output<Zod>,
  ResolvedValue = z.output<
    z.ZodObject<
      Merge<FieldsZodResolvedObject<FieldsArray>, ExtraZodFields<DocumentName>>
    >
  >,
  // eslint-disable-next-line @typescript-eslint/ban-types -- All other values assume keys
  Select extends Record<string, string> = {}
>({
  name,
  fields,
  preview: previewDef,
  mock = (faker) => {
    const createdAt = faker.date
      .between("2021-06-03T03:24:55.395Z", "2022-06-04T18:50:36.539Z")
      .toISOString();

    return {
      ...fieldsMock(fields)(faker, name),
      _id: faker.datatype.uuid(),
      _createdAt: createdAt,
      _rev: faker.datatype.string(23),
      _type: name,
      _updatedAt: faker.date
        .between(createdAt, "2022-06-05T18:50:36.539Z")
        .toISOString(),
    } as unknown as z.input<Zod>;
  },
  zod: zodFn = (zod) =>
    zod as unknown as z.ZodType<ParsedValue, any, z.input<Zod>>,
  zodResolved = () =>
    z.object({
      ...fieldsZodResolvedObject(fields),
      ...extraZodFields(name),
    }) as unknown as z.ZodType<ResolvedValue, any, z.input<Zod>>,
  ...def
}: Merge<
  SanityNamedTypeDef<
    Schema.DocumentDefinition,
    z.input<Zod>,
    ParsedValue,
    ResolvedValue,
    z.output<Zod>
  >,
  {
    fields: FieldsArray;
    name: DocumentName;
    preview?: Preview<z.input<Zod>, Select>;
  }
>): DocumentType<DocumentName, z.input<Zod>, ParsedValue, ResolvedValue> => {
  const zod = z.object({
    ...fieldsZodObject(fields),
    ...extraZodFields(name),
  }) as unknown as Zod;

  /* eslint-disable fp/no-let -- Need side effects */
  let counter = 0;
  let mocks: Array<z.input<Zod>> = [];
  let mocksById: Record<string, z.input<Zod>> = {};
  /* eslint-enable fp/no-let */

  const getNthMock = (faker: Faker, n: number) => {
    const newMocks = new Array(Math.max(0, n + 1 - mocks.length))
      .fill("test")
      .map(() => mock(faker, ""));

    if (newMocks.length) {
      /* eslint-disable fp/no-mutation -- Need side effects */
      mocks = [...mocks, ...newMocks];
      mocksById = {
        ...mocksById,
        ...keyBy((doc) => (doc as { _id: string })._id, newMocks),
      };
      /* eslint-enable fp/no-mutation */
    }

    return mocks[n]!;
  };

  return {
    getMockById: (id: string) => mocksById[id],
    getNthMock,
    name,
    ...createType({
      // eslint-disable-next-line fp/no-mutation, no-plusplus -- Need side effects
      mock: (faker) => getNthMock(faker, counter++),
      schema: () => ({
        ...def,
        ...fieldsSchema(fields, previewDef),
        name,
        type: "document",
      }),
      zod: zodFn(zod),
      zodResolved: zodResolved(zod),
    }),
  };
};
