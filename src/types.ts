import { Faker, faker as globalFaker } from "@faker-js/faker";

import type {
  CustomValidator,
  Rule as RuleWithoutTypedCustom,
} from "@sanity/types";
import type { PartialDeep, SetOptional, Simplify } from "type-fest";
import type { z } from "zod";

const hashCode = (str: string) =>
  // eslint-disable-next-line no-bitwise -- copied from somewhere
  Array.from(str).reduce((s, c) => (Math.imul(31, s) + c.charCodeAt(0)) | 0, 0);

export type AnyObject = Record<string, unknown>;
export type EmptyObject = Record<string, never>;

// TODO Type Definition across the board
export interface SanityType<Definition, Zod extends z.ZodType<any, any, any>> {
  mock: (path?: string) => z.input<Zod>;
  parse: (data: unknown) => z.output<Zod>;
  schema: () => Definition;
  zod: Zod;
}

// TODO createType tests
export const createType = <Definition, Zod extends z.ZodType<any, any, any>>({
  mock,
  zod,
  parse = zod.parse.bind(zod),
  ...def
}: Omit<SetOptional<SanityType<Definition, Zod>, "parse">, "mock"> & {
  mock: (faker: Faker, path: string) => z.input<Zod>;
}): SanityType<Definition, Zod> => {
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
