import { faker } from "@faker-js/faker";
import { z } from "zod";

import type { FieldOptionKeys, FieldsType, InferFieldsZod } from "../fields";
import type { SanityType } from "../types";
import type { Faker } from "@faker-js/faker";
import type { Schema } from "@sanity/types";

type ZodFile<Fields extends FieldsType<any, any>> = z.ZodIntersection<
  InferFieldsZod<Fields>,
  z.ZodObject<
    {
      _type: z.ZodLiteral<"file">;
      asset: z.ZodObject<{
        _ref: z.ZodString;
        _type: z.ZodLiteral<"reference">;
      }>;
    },
    "strip"
  >
>;

interface FileType<Fields extends FieldsType<any, any>>
  extends SanityType<
    Omit<Schema.FileDefinition, FieldOptionKeys>,
    ZodFile<Fields>
  > {}

export const file = <
  Fields extends FieldsType<any, any> = FieldsType<never, Record<never, never>>
>(
  def: Omit<
    Schema.FileDefinition,
    FieldOptionKeys | "fields" | "preview" | "type"
  > & {
    fields?: Fields;
    mock?: (faker: Faker) => z.input<ZodFile<Fields>>;
  } = {}
): FileType<Fields> => {
  const {
    fields: {
      schema: fieldsSchema = () => undefined,
      mock: fieldsMock = () =>
        undefined as unknown as z.input<InferFieldsZod<Fields>>,
      zod: fieldsZod = z.object({}),
    } = {},
    mock = () => ({
      ...fieldsMock(),
      _type: "file",
      asset: {
        _type: "reference",
        _ref: faker.datatype.uuid(),
      },
    }),
  } = def;

  const zod = z.intersection(
    fieldsZod as InferFieldsZod<Fields>,
    z.object({
      _type: z.literal("file"),
      asset: z.object({
        _ref: z.string(),
        _type: z.literal("reference"),
      }),
    })
  ) as unknown as ZodFile<Fields>;

  return {
    zod,
    parse: zod.parse.bind(zod),
    mock: () => mock(faker),
    schema: () => ({
      ...def,
      type: "file",
      fields: fieldsSchema(),
    }),
  };
};
