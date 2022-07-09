import { flow, fromPairs } from "lodash/fp";
import { z } from "zod";

import type {
  InferResolvedValue,
  InferValue,
  NamedSchemaFields,
  SanityType,
  WithTypedValidation,
} from "../types";
import type { Faker } from "@faker-js/faker";
import type {
  PrepareViewOptions,
  PreviewConfig,
  PreviewValue,
  Schema,
  Rule as UntypedRule,
} from "@sanity/types";
import type { Merge } from "type-fest";

export type FieldOptions<
  Name extends string,
  Zod extends z.ZodTypeAny,
  ResolvedValue,
  Optional extends boolean
> = Pick<
  Schema.FieldDefinition,
  "description" | "fieldset" | "group" | "title"
> & {
  name: Name;
  optional?: Optional;
  type: SanityType<
    WithTypedValidation<
      Omit<Schema.FieldDefinition<any>, NamedSchemaFields>,
      z.input<Zod>
    >,
    z.input<Zod>,
    z.output<Zod>,
    ResolvedValue
  >;
};

type ZodOptional<
  T extends z.ZodTypeAny,
  Optional extends boolean
> = Optional extends true ? z.ZodOptional<T> : T;

export type FieldsZodObject<
  FieldsArray extends readonly [
    FieldOptions<any, z.ZodTypeAny, any, any>,
    ...Array<FieldOptions<any, z.ZodTypeAny, any, any>>
  ]
> = {
  [Name in FieldsArray[number]["name"]]: ZodOptional<
    Extract<FieldsArray[number], { name: Name }>["type"]["zod"],
    Extract<FieldsArray[number], { name: Name }>["optional"]
  >;
};

export const fieldsZodObject = <
  FieldsArray extends readonly [
    FieldOptions<any, z.ZodTypeAny, any, any>,
    ...Array<FieldOptions<any, z.ZodTypeAny, any, any>>
  ]
>(
  fields: FieldsArray
) =>
  fromPairs(
    fields.map(({ name, optional, type: { zod } }) => [
      name,
      optional ? z.optional(zod) : zod,
    ])
  ) as FieldsZodObject<FieldsArray>;

export type FieldsZodResolvedObject<
  FieldsArray extends readonly [
    FieldOptions<any, z.ZodTypeAny, any, any>,
    ...Array<FieldOptions<any, z.ZodTypeAny, any, any>>
  ]
> = {
  [Name in FieldsArray[number]["name"]]: ZodOptional<
    z.ZodType<
      InferResolvedValue<Extract<FieldsArray[number], { name: Name }>["type"]>,
      any,
      InferValue<Extract<FieldsArray[number], { name: Name }>["type"]>
    >,
    Extract<FieldsArray[number], { name: Name }>["optional"]
  >;
};

export const fieldsZodResolvedObject = <
  FieldsArray extends readonly [
    FieldOptions<any, z.ZodTypeAny, any, any>,
    ...Array<FieldOptions<any, z.ZodTypeAny, any, any>>
  ]
>(
  fields: FieldsArray
) =>
  fromPairs(
    fields.map(({ name, optional, type: { zodResolved } }) => [
      name,
      optional ? z.optional(zodResolved) : zodResolved,
    ])
  ) as FieldsZodResolvedObject<FieldsArray>;

export const fieldsMock =
  <
    Names extends string,
    FieldsArray extends readonly [
      FieldOptions<Names, z.ZodTypeAny, any, any>,
      ...Array<FieldOptions<Names, z.ZodTypeAny, any, any>>
    ]
  >(
    fields: FieldsArray
  ) =>
  (faker: Faker, path = "") =>
    fromPairs(
      fields.map(({ name, type: { mock } }) => [
        name,
        mock(faker, `${path}.${name}`),
      ])
    ) as z.input<z.ZodObject<FieldsZodObject<FieldsArray>>>;

export type Preview<
  Value extends Record<string, unknown>,
  Select extends NonNullable<PreviewConfig["select"]>
> =
  | {
      select: PreviewValue;
    }
  | {
      prepare: (
        object: Merge<
          Value,
          {
            [field in keyof Select]: unknown;
          }
        >,
        viewOptions?: PrepareViewOptions
      ) => PreviewValue;
      select?: Select;
    };

export const fieldsSchema = <
  Names extends string,
  FieldsArray extends readonly [
    FieldOptions<Names, z.ZodTypeAny, any, any>,
    ...Array<FieldOptions<Names, z.ZodTypeAny, any, any>>
  ],
  Value extends Record<string, unknown>,
  Select extends NonNullable<PreviewConfig["select"]>
>(
  fields: FieldsArray,
  previewDef?: Preview<Value, Select> | undefined
) => {
  const preview: PreviewConfig | undefined = !previewDef
    ? undefined
    : !("prepare" in previewDef)
    ? (previewDef as PreviewConfig)
    : {
        ...(previewDef as Pick<PreviewConfig, "prepare">),
        select: {
          ...fromPairs(fields.map(({ name }) => [name, name])),
          ...previewDef.select,
        },
      };

  return {
    preview,
    fields: fields.map(({ name, type, optional, ...props }) => {
      const schema = type.schema();

      const { validation } = schema;

      return {
        ...schema,
        ...props,
        name,
        validation: flow(
          (rule: UntypedRule) => (optional ? rule : rule.required()),
          (rule) => validation?.(rule) ?? rule
        ),
      };
    }),
  };
};
