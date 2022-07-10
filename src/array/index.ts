import { flow, map } from "lodash/fp";
import { z } from "zod";

import { createType, zodUnion } from "../types";

import type {
  InferParsedValue,
  InferResolvedValue,
  InferValue,
  NamedSchemaFields,
  Rule,
  SanityType,
  SanityTypeDef,
} from "../types";
import type { Schema } from "@sanity/types";
import type { Merge } from "type-fest";

type TupleOfLength<
  T,
  Min extends number = number,
  Max extends number = number,
  Result extends T[] = []
> = Result["length"] extends Min
  ? number extends Max
    ? [...Result, ...T[]]
    : Result["length"] extends Max
    ? Result
    :
        | Result
        | TupleOfLength<
            T,
            [T, ...Result]["length"] & number,
            Max,
            [T, ...Result]
          >
  : TupleOfLength<T, Min, Max, [T, ...Result]>;

type AddKey<T> = T extends object ? Merge<T, { _key: string }> : T;

const addKeyToZod = <Input, Output>(zod: z.ZodType<Output, any, Input>) =>
  !(zod instanceof z.ZodObject)
    ? (zod as z.ZodType<AddKey<Output>, any, AddKey<Input>>)
    : (zod.extend({
        _key: z.string(),
      }) as unknown as z.ZodType<AddKey<Output>, any, AddKey<Input>>);

type Precedence<A extends number, B extends number> = number extends A ? B : A;

const zodArrayOfLength =
  <Length extends number, Min extends number, Max extends number>({
    length,
    max,
    min,
  }: {
    length?: Length;
    max?: Max;
    min?: Min;
  }) =>
  <Input, Output>(zods: Array<z.ZodType<Output, any, Input>>) =>
    flow(
      flow(
        (value: typeof zods) => value,
        map(addKeyToZod),
        zodUnion,
        z.array,
        (zod) => (!min ? zod : zod.min(min)),
        (zod) => (!max ? zod : zod.max(max)),
        (zod) => (length === undefined ? zod : zod.length(length))
      ),
      (zod) =>
        zod as unknown as z.ZodType<
          TupleOfLength<
            AddKey<Output>,
            Precedence<Length, Min>,
            Precedence<Length, Max>
          >,
          any,
          TupleOfLength<
            AddKey<Input>,
            Precedence<Length, Min>,
            Precedence<Length, Max>
          >
        >
    )(zods);

// HACK Shouldn't have to omit NamedSchemaFields because arrays don't need names
type ItemDefinitions = Omit<
  Schema.ArrayDefinition["of"][number],
  NamedSchemaFields
>;

export const array = <
  ItemValue,
  ParsedItemValue,
  ResolvedItemValue,
  ItemsArray extends TupleOfLength<
    SanityType<ItemDefinitions, ItemValue, ParsedItemValue, ResolvedItemValue>,
    1
  >,
  Length extends number,
  Min extends number,
  Max extends number,
  Value extends TupleOfLength<
    AddKey<InferValue<ItemsArray[number]>>,
    Precedence<Length, Min>,
    Precedence<Length, Max>
  >,
  ParsedValue = TupleOfLength<
    AddKey<InferParsedValue<ItemsArray[number]>>,
    Precedence<Length, Min>,
    Precedence<Length, Max>
  >,
  ResolvedValue = TupleOfLength<
    AddKey<InferResolvedValue<ItemsArray[number]>>,
    Precedence<Length, Min>,
    Precedence<Length, Max>
  >
>({
  length,
  max,
  min,
  validation,
  of: items,
  // FIXME Mock the array element types. Not sure how to allow an override, since the function has to be defined before we know the element types.
  mock = () => [] as unknown as Value,
  zod: zodFn = (zod) => zod as unknown as z.ZodType<ParsedValue, any, Value>,
  zodResolved = (zod) => zod as unknown as z.ZodType<ResolvedValue, any, Value>,
  ...def
}: Merge<
  SanityTypeDef<
    Schema.ArrayDefinition<Value[keyof Value]>,
    Value,
    ParsedValue,
    ResolvedValue,
    TupleOfLength<
      AddKey<InferParsedValue<ItemsArray[number]>>,
      Precedence<Length, Min>,
      Precedence<Length, Max>
    >,
    TupleOfLength<
      AddKey<InferResolvedValue<ItemsArray[number]>>,
      Precedence<Length, Min>,
      Precedence<Length, Max>
    >
  >,
  {
    length?: Length;
    max?: Max;
    min?: Min;
    of: ItemsArray;
  }
>) =>
  createType({
    mock,
    zod: zodFn(
      flow(
        (value: typeof items) => value,
        map(
          ({ zod }) =>
            zod as z.ZodType<
              InferParsedValue<ItemsArray[number]>,
              any,
              InferValue<ItemsArray[number]>
            >
        ),
        zodArrayOfLength({ length, max, min }),
        <Output>(value: z.ZodType<Output, any, any>) =>
          value as z.ZodType<Output, any, Value>
      )(items)
    ),
    zodResolved: zodResolved(
      flow(
        (value: typeof items) => value,
        map(
          ({ zodResolved }) =>
            zodResolved as z.ZodType<
              InferResolvedValue<ItemsArray[number]>,
              any,
              InferValue<ItemsArray[number]>
            >
        ),
        zodArrayOfLength({ length, max, min }),
        <Output>(value: z.ZodType<Output, any, any>) =>
          value as z.ZodType<Output, any, Value>
      )(items)
    ),
    schema: () => ({
      ...def,
      type: "array",
      of: items.map(({ schema }) => schema()),
      validation: flow(
        (rule: Rule<Value>) => (!min ? rule : rule.min(min)),
        (rule) => (!max ? rule : rule.max(max)),
        (rule) => (length === undefined ? rule : rule.length(length)),
        (rule) => validation?.(rule) ?? rule
      ),
    }),
  });
