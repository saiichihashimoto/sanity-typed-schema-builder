import type { Faker } from "@faker-js/faker";
import type {
  CustomValidator,
  Rule as RuleWithoutTypedCustom,
} from "@sanity/types";
import type { PartialDeep } from "type-fest";
import type { z } from "zod";

// TODO Type Definition across the board

export interface SanityType<Definition, Zod extends z.ZodType<any, any, any>> {
  mock: (faker: Faker) => z.input<Zod>;
  parse: (data: unknown) => z.output<Zod>;
  schema: () => Definition;
  zod: Zod;
}

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

export type Resolve<T> = T extends (...args: any[]) => any
  ? T
  : T extends abstract new (...args: any[]) => any
  ? T
  : { [K in keyof T]: T[K] };

export type InferInput<T extends SanityType<any, any>> = T extends SanityType<
  any,
  infer Zod
>
  ? Resolve<z.input<Zod>>
  : never;

export type InferOutput<T extends SanityType<any, any>> = T extends SanityType<
  any,
  infer Zod
>
  ? Resolve<z.output<Zod>>
  : never;
