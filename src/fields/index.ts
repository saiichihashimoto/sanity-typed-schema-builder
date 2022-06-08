import { flow, fromPairs, isFunction } from "lodash/fp";
import { z } from "zod";

import type { InferZod, Resolve, SanityType, TypeValidation } from "../types";
import type {
  PrepareViewOptions,
  PreviewConfig,
  PreviewValue,
  Rule,
  Schema,
} from "@sanity/types";

export type FieldOptionKeys = "description" | "name" | "title";

interface FieldOptions<
  Name extends string,
  Zod extends z.ZodType<any, any, any>,
  Optional extends boolean
> extends Pick<
    Schema.FieldDefinition,
    "description" | "fieldset" | "group" | "title"
  > {
  name: Name;
  optional?: Optional;
  type: SanityType<
    Omit<
      TypeValidation<Schema.FieldDefinition<any>, z.input<Zod>>,
      FieldOptionKeys
    >,
    Zod
  >;
}

type InferName<T extends FieldOptions<any, any, any>> = T extends FieldOptions<
  infer Name,
  any,
  any
>
  ? Name
  : never;

type InferType<T extends FieldOptions<any, any, any>> = T extends FieldOptions<
  any,
  any,
  any
>
  ? T["type"]
  : never;

type InferOptional<T extends FieldOptions<any, any, any>> =
  T extends FieldOptions<any, any, infer Optional> ? Optional : never;

export interface FieldsType<
  FieldNames extends string,
  Fields extends {
    [field in FieldNames]: FieldOptions<field, any, any>;
  }
> extends SanityType<
    Array<
      TypeValidation<
        Schema.FieldDefinition<any>,
        z.input<
          z.ZodObject<
            {
              [field in FieldNames]: InferOptional<Fields[field]> extends true
                ? z.ZodOptional<InferZod<InferType<Fields[field]>>>
                : InferZod<InferType<Fields[field]>>;
            },
            "strip"
          >
        >
      >
    >,
    z.ZodObject<
      {
        [field in FieldNames]: InferOptional<Fields[field]> extends true
          ? z.ZodOptional<InferZod<InferType<Fields[field]>>>
          : InferZod<InferType<Fields[field]>>;
      },
      "strip"
    >
  > {
  field: <
    Name extends string,
    Zod extends z.ZodType<any, any, any>,
    NewFieldNames extends FieldNames | Name,
    Optional extends boolean = false
  >(
    options: FieldOptions<Name, Zod, Optional>
  ) => FieldsType<
    NewFieldNames,
    // @ts-expect-error -- Not sure how to solve this
    Resolve<
      Fields & {
        [field in Name]: FieldOptions<Name, Zod, Optional>;
      }
    >
  >;
}

export type InferFieldsZod<T extends FieldsType<any, any>> =
  T extends FieldsType<infer FieldNames, infer Fields>
    ? z.ZodObject<
        {
          [field in FieldNames]: InferOptional<Fields[field]> extends true
            ? z.ZodOptional<InferZod<InferType<Fields[field]>>>
            : InferZod<InferType<Fields[field]>>;
        },
        "strip"
      >
    : never;

const fieldsInternal = <
  FieldNames extends string,
  Fields extends {
    [field in FieldNames]: FieldOptions<field, any, any>;
  }
>(
  fields: Array<Fields[FieldNames]>
): FieldsType<FieldNames, Fields> => {
  type Tuple = {
    [field in FieldNames]: [
      InferName<Fields[field]>,
      InferOptional<Fields[field]> extends true
        ? z.ZodOptional<InferZod<InferType<Fields[field]>>>
        : InferZod<InferType<Fields[field]>>
    ];
  }[FieldNames];

  const tuples = fields.map(
    <
      Name extends string,
      Zod extends z.ZodType<any, any, any>,
      Optional extends boolean
    >({
      name,
      optional,
      type: { zod },
    }: FieldOptions<Name, Zod, Optional>) => [
      name,
      !optional ? zod : zod.optional(),
    ]
  ) as Tuple[];

  type ZodRawObject = {
    [field in FieldNames]: InferOptional<Fields[field]> extends true
      ? z.ZodOptional<InferZod<InferType<Fields[field]>>>
      : InferZod<InferType<Fields[field]>>;
  };

  const zod = z.object(fromPairs(tuples) as ZodRawObject);

  return {
    zod,
    parse: zod.parse.bind(zod),
    mock: () =>
      fromPairs(
        fields.map(
          ({ name, type: { mock } }) => [name, mock()] as const
        ) as Array<[string, any]>
      ) as z.input<InferZod<FieldsType<FieldNames, Fields>>>,
    schema: () =>
      fields.map(
        <Name extends FieldNames>({
          name,
          type,
          optional,
          ...props
        }: Fields[Name]) => {
          const schema = type.schema();

          const { validation } = schema;

          return {
            ...schema,
            ...props,
            name: name as Name,
            validation: flow(
              (rule: Rule) => (optional ? rule : rule.required()),
              (rule) => validation?.(rule) ?? rule
            ),
          };
        }
      ),
    field: <
      Name extends string,
      Zod extends z.ZodType<any, any, any>,
      NewFieldNames extends FieldNames | Name,
      Optional extends boolean = false
    >(
      options: FieldOptions<Name, Zod, Optional>
    ) =>
      fieldsInternal<
        NewFieldNames,
        // @ts-expect-error -- Not sure how to solve this
        Resolve<
          Fields & {
            [field in Name]: FieldOptions<Name, Zod, Optional>;
          }
        >
      >([...fields, options]),
  };
};

export const fields = () => fieldsInternal<never, Record<never, never>>([]);

export type Preview<Value extends Record<string, unknown>> =
  | ((object: Value, viewOptions?: PrepareViewOptions) => PreviewValue)
  | NonNullable<PreviewConfig["select"]>;

export const preview = <Value extends Record<string, unknown>>(
  preview: Preview<Value> | undefined,
  fields: Array<TypeValidation<Schema.FieldDefinition<any>, any>>
): PreviewConfig | undefined =>
  !preview
    ? undefined
    : !isFunction(preview)
    ? { select: preview }
    : {
        prepare: preview as NonNullable<PreviewConfig["prepare"]>,
        select: fromPairs(fields.map(({ name }) => [name, name])),
      };
