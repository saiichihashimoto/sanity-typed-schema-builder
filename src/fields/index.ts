import { flow, fromPairs, isFunction } from "lodash/fp";
import { z } from "zod";

import type { InferZod, Resolve, SanityType } from "../types";

type FieldRule<FieldNames extends string> = Parameters<
  NonNullable<FieldTypeFields<any, any, FieldNames>["validation"]>
>[0];

interface FieldOptions<
  Name extends string,
  Zod extends z.ZodType<any, any, any>,
  Optional extends boolean
> {
  description?: string;
  name: Name;
  optional?: Optional;
  title?: string;
  type: SanityType<FieldTypeFields<any, any, Name>, Zod>;
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
    ObjectFieldDef<any, any, FieldNames, any>["fields"],
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

export type InferFieldNames<T extends FieldsType<any, any>> =
  T extends FieldsType<infer FieldNames, any> ? FieldNames : never;

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

          type Rule = FieldRule<Name>;

          const { validation: validationUntyped } = schema;
          const validation = validationUntyped as
            | ((rule: Rule) => Rule)
            | undefined;

          return {
            ...schema,
            ...props,
            name: name as Name,
            validation: flow(
              (rule: Rule): Rule => (optional ? rule : rule.required()),
              (rule): Rule => (validation?.(rule) ?? rule) as Rule
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

interface Selection {
  media?: string | ReactElement;
  subtitle?: string;
  title?: string;
}

export type Preview<Value> = ((object: Value) => Selection) | Selection;

export const preview = <Value, FieldNames extends string>(
  preview: Preview<Value> | undefined,
  fields: ObjectFieldDef<any, any, FieldNames, any>["fields"]
) =>
  !preview
    ? undefined
    : !isFunction(preview)
    ? { select: preview }
    : {
        prepare: preview,
        select: fromPairs(fields.map(({ name }) => [name, name])),
      };
