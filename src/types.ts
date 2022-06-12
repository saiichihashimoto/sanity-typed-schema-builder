import type { Faker } from "@faker-js/faker";
import type {
  CustomValidator,
  Rule as RuleWithoutTypedCustom,
} from "@sanity/types";
import type { PartialDeep, SetOptional, Simplify } from "type-fest";
import type { z } from "zod";

export type AnyObject = Record<string, unknown>;
export type EmptyObject = Record<string, never>;

// TODO Type Definition across the board
export interface SanityType<Definition, Zod extends z.ZodType<any, any, any>> {
  mock: (faker: Faker) => z.input<Zod>;
  parse: (data: unknown) => z.output<Zod>;
  schema: () => Definition;
  zod: Zod;
}

// TODO createType tests
export const createType = <Definition, Zod extends z.ZodType<any, any, any>>({
  zod,
  parse = zod.parse.bind(zod),
  ...def
}: SetOptional<SanityType<Definition, Zod>, "parse">): SanityType<
  Definition,
  Zod
> => ({
  ...def,
  parse,
  zod,
});

type Rule<Value> = Omit<RuleWithoutTypedCustom, "custom"> & {
  custom: (fn: CustomValidator<Value>) => Rule<Value>;
};

export type TypeValidation<Definition, Value> = Omit<
  Definition,
  "validation"
> & {
  validation?: (rule: Rule<PartialDeep<Value>>) => Rule<PartialDeep<Value>>;
};

export type InferZod<T extends SanityType<any, any>> = T extends SanityType<
  any,
  infer Zod
>
  ? Zod
  : never;

export type InferInput<T extends SanityType<any, any>> = T extends SanityType<
  any,
  infer Zod
>
  ? Simplify<z.input<Zod>>
  : never;

export type InferOutput<T extends SanityType<any, any>> = T extends SanityType<
  any,
  infer Zod
>
  ? Simplify<z.output<Zod>>
  : never;
