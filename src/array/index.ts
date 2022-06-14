import { flow } from "lodash/fp";
import { z } from "zod";

import { createType } from "../types";

import type { FieldOptionKeys } from "../field";
import type { Rule, SanityType, TypeValidation } from "../types";
import type { Faker } from "@faker-js/faker";
import type { Schema } from "@sanity/types";
import type { Simplify } from "type-fest";

type UnArray<T> = T extends Array<infer U> ? U : never;

// HACK Shouldn't have to omit FieldOptionKeys because arrays don't need names
type ItemDefinition = Omit<
  UnArray<Schema.ArrayDefinition["of"]>,
  FieldOptionKeys
>;

const addKeyToZod = <Zod extends z.ZodFirstPartySchemaTypes>(zod: Zod) =>
  !(zod instanceof z.ZodObject)
    ? zod
    : zod.extend({
        _key: z.string(),
      });

export const array = <
  ItemDefinitions extends ItemDefinition,
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
            Simplify<Output & { _key: string }>,
            Definition,
            Simplify<Input & { _key: string }>
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
}: Omit<
  TypeValidation<Schema.ArrayDefinition<z.input<Zod>>, z.input<Zod>>,
  FieldOptionKeys | "of" | "type"
> & {
  length?: number;
  max?: number;
  min?: number;
  mock?: (faker: Faker, path: string) => z.input<Zod>;
  nonempty?: NonEmpty;
  of: ItemsArray;
  zod?: (zod: Zod) => z.ZodType<Output, any, z.input<Zod>>;
}) =>
  createType({
    mock,
    zod: flow(
      (zod: z.ZodArray<Zods>) => (!nonempty ? zod : zod.nonempty()) as Zod,
      (zod) => (!min ? zod : zod.min(min)),
      (zod) => (!max ? zod : zod.max(max)),
      (zod) => (length === undefined ? zod : zod.length(length)),
      (zod) => zodFn(zod)
    )(
      z.array<Zods>(
        items.length === 1
          ? (addKeyToZod(items[0]!.zod) as unknown as Zods)
          : (z.union([
              addKeyToZod(items[0]!.zod),
              addKeyToZod(items[1]!.zod),
              ...items.slice(2).map(({ zod }) => addKeyToZod(zod)),
            ]) as unknown as Zods)
      )
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
