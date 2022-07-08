import { flow, map } from "lodash/fp";
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

// HACK Shouldn't have to omit NamedSchemaFields because arrays don't need names
type ItemDefinitions = Omit<
  Schema.ArrayDefinition["of"][number],
  NamedSchemaFields
>;

type AddKey<T> = T extends object ? Merge<T, { _key: string }> : T;

const addKeyToZod = <Input, Output>(zod: z.ZodType<Output, any, Input>) =>
  !(zod instanceof z.ZodObject)
    ? (zod as z.ZodType<AddKey<Output>, any, AddKey<Input>>)
    : (zod.extend({
        _key: z.string(),
      }) as unknown as z.ZodType<AddKey<Output>, any, AddKey<Input>>);

export const array = <
  Zods extends z.ZodTypeAny,
  ItemsArray extends [
    SanityType<ItemDefinitions, z.input<Zods>, z.output<Zods>>,
    ...Array<SanityType<ItemDefinitions, z.input<Zods>, z.output<Zods>>>
  ],
  Zod extends z.ZodArray<
    z.ZodType<
      AddKey<z.output<ItemsArray[number]["zod"]>>,
      any,
      AddKey<z.input<ItemsArray[number]["zod"]>>
    >,
    // eslint-disable-next-line no-use-before-define -- Zod can't be optional, but NonEmpty has to be
    NonEmpty extends true ? "atleastone" : "many"
  >,
  NonEmpty extends boolean = false,
  ParsedValue = z.output<Zod>
>({
  length,
  max,
  min,
  nonempty,
  validation,
  of: items,
  // FIXME Mock the array element types. Not sure how to allow an override, since the function has to be defined before we know the element types.
  mock = () => [] as unknown as z.input<Zod>,
  zod: zodFn = (zod) =>
    zod as unknown as z.ZodType<ParsedValue, any, z.input<Zod>>,
  ...def
}: Merge<
  SanityTypeDef<
    Schema.ArrayDefinition<z.input<Zod>[number]>,
    z.input<Zod>,
    ParsedValue,
    z.output<Zod>
  >,
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
      flow(
        (value: typeof items) => value,
        map(flow(({ zod }) => zod, addKeyToZod)),
        zodUnion,
        z.array,
        (zod) => (!nonempty ? zod : zod.nonempty()),
        (zod) => (!min ? zod : zod.min(min)),
        (zod) => (!max ? zod : zod.max(max))
      ),
      (zod) => (length === undefined ? zod : zod.length(length)),
      (zod) => zodFn(zod as z.ZodType<z.output<Zod>, any, z.input<Zod>>)
    )(items),
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
