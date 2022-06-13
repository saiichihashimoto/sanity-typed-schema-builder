import { Faker, faker as globalFaker } from "@faker-js/faker";

import type {
  CustomValidator,
  Rule as RuleWithoutTypedCustom,
} from "@sanity/types";
import type { Merge, PartialDeep, SetOptional } from "type-fest";
import type { z } from "zod";

const hashCode = (str: string) =>
  // eslint-disable-next-line no-bitwise -- copied from somewhere
  Array.from(str).reduce((s, c) => (Math.imul(31, s) + c.charCodeAt(0)) | 0, 0);

export type AnyObject = Record<string, unknown>;
export type EmptyObject = Record<string, never>;

// TODO Type Definition across the board
export interface SanityType<
  Definition,
  // Need to union with ZodObject, not clear why
  Zod extends z.ZodType<any, any, any> | z.ZodObject<any>
> {
  mock: (path?: string) => z.input<Zod>;
  parse: (data: unknown) => z.output<Zod>;
  schema: () => Definition;
  zod: Zod;
}

// TODO createType tests
export const createType = <
  Definition,
  Zod extends z.ZodType<any, any, any> | z.ZodObject<any>
>({
  mock,
  zod,
  parse = zod.parse.bind(zod),
  ...def
}: Merge<
  SetOptional<SanityType<Definition, Zod>, "parse">,
  { mock: (faker: Faker, path: string) => z.input<Zod> }
>): SanityType<Definition, Zod> => {
  const fakers: Record<string, Faker> = {};

  return {
    ...def,
    parse,
    zod,
    mock: (path = "") => {
      const faker = fakers[path] ?? new Faker({ locales: globalFaker.locales });

      if (!(path in fakers)) {
        // eslint-disable-next-line fp/no-mutation -- Allowing for local dictionary
        fakers[path] = faker;
        faker.seed(hashCode(path));
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- Not sure why this is happening
      return mock(faker, path);
    },
  };
};

export type Rule<Value> = Omit<RuleWithoutTypedCustom, "custom"> & {
  custom: (fn: CustomValidator<PartialDeep<Value>>) => Rule<PartialDeep<Value>>;
};

export type TypeValidation<Definition, Value> = Merge<
  Definition,
  { validation?: (rule: Rule<Value>) => Rule<Value> }
>;

export type InferZod<T extends SanityType<any, any>> = T extends SanityType<
  any,
  infer Zod
>
  ? Zod
  : never;

export type InferInput<T extends SanityType<any, any>> = z.input<InferZod<T>>;

export type InferOutput<T extends SanityType<any, any>> = z.output<InferZod<T>>;
