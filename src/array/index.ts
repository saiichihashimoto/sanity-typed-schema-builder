import { flow } from "lodash/fp";
import { z } from "zod";

import { createType, zodUnion } from "../types";

import type {
  NamedSchemaFields,
  Rule,
  SanityType,
  SanityTypeDef,
} from "../types";
import type { Schema } from "@sanity/types";
import type { Merge } from "type-fest";

type UnArray<T> = T extends Array<infer U> ? U : never;

const addKeyToZod = <Zod extends z.ZodFirstPartySchemaTypes>(zod: Zod) =>
  !(zod instanceof z.ZodObject)
    ? zod
    : zod.extend({
        _key: z.string(),
      });

export const array = <
  // HACK Shouldn't have to omit NamedSchemaFields because arrays don't need names
  ItemDefinitions extends Omit<
    UnArray<Schema.ArrayDefinition["of"]>,
    NamedSchemaFields
  >,
  Zods extends z.ZodType<any, any, any>,
  ItemsArray extends [
    SanityType<ItemDefinitions, Zods>,
    ...Array<SanityType<ItemDefinitions, Zods>>
  ],
  Zod extends z.ZodArray<
    ItemsArray[number]["zod"] extends z.ZodType<
      infer Output,
      infer Definition,
      infer Input
    >
      ? Input extends object
        ? z.ZodType<
            Merge<Output, { _key: string }>,
            Definition,
            Merge<Input, { _key: string }>
          >
        : ItemsArray[number]["zod"]
      : never,
    // eslint-disable-next-line no-use-before-define -- Zod can't be optional, but NonEmpty has to be
    NonEmpty extends true ? "atleastone" : "many"
  >,
  NonEmpty extends boolean = false,
  Output = z.output<Zod>
>({
  length,
  max,
  min,
  nonempty,
  validation,
  of: items,
  // FIXME Mock the array element types. Not sure how to allow an override, since the function has to be defined before we know the element types.
  mock = () => [] as unknown as z.input<Zod>,
  zod: zodFn = (zod) => zod as unknown as z.ZodType<Output, any, z.input<Zod>>,
  ...def
}: Merge<
  SanityTypeDef<Schema.ArrayDefinition<z.input<Zod>[number]>, Zod, Output>,
  {
    length?: number;
    max?: number;
    min?: number;
    nonempty?: NonEmpty;
    of: ItemsArray;
  }
>) =>
  createType({
    mock,
    zod: flow(
      (zod: z.ZodArray<Zods>) => (!nonempty ? zod : zod.nonempty()) as Zod,
      (zod) => (!min ? zod : zod.min(min)),
      (zod) => (!max ? zod : zod.max(max)),
      (zod) => (length === undefined ? zod : zod.length(length)),
      (zod) => zodFn(zod)
    )(
      z.array<Zods>(zodUnion(items.map(({ zod }) => addKeyToZod(zod) as Zods)))
    ),
    schema: () => ({
      ...def,
      type: "array",
      of: items.map(({ schema }) => schema()),
      validation: flow(
        (rule: Rule<z.input<Zod>>) => (!nonempty ? rule : rule.min(1)),
        (rule) => (!min ? rule : rule.min(min)),
        (rule) => (!max ? rule : rule.max(max)),
        (rule) => (length === undefined ? rule : rule.length(length)),
        (rule) => validation?.(rule) ?? rule
      ),
    }),
  });
