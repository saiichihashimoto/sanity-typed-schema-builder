import { z } from "zod";

import type { Faker } from "@faker-js/faker";
import type {
  CustomValidator,
  Rule as RuleWithoutTypedCustom,
} from "@sanity/types";
import type { Merge, PartialDeep, Promisable, SetOptional } from "type-fest";

export type AnyObject = Record<string, unknown>;

export const zodUnion = <Zods extends z.ZodType<any, any, any>>(zods: Zods[]) =>
  zods.length === 0
    ? (z.never() as unknown as Zods)
    : zods.length === 1
    ? (zods[0]! as Zods)
    : (z.union([
        zods[0]! as Zods,
        zods[1]! as Zods,
        ...zods.slice(2),
      ]) as unknown as Zods);

// TODO Type Definition across the board
export interface SanityType<
  Definition,
  // Need to union with ZodObject, not clear why
  Zod extends z.ZodType<any, any, any> | z.ZodObject<any>
> {
  mock: (faker: Faker, path?: string) => z.input<Zod>;
  parse: (data: unknown) => z.output<Zod>;
  schema: () => Definition;
  zod: Zod;
}

export type InferInput<T extends SanityType<any, any>> = z.input<T["zod"]>;

export type InferOutput<T extends SanityType<any, any>> = z.output<T["zod"]>;

const createMocker = <
  Input,
  Zod extends z.ZodType<any, any, Input> | z.ZodObject<any>
>(
  mockFn: (faker: Faker, path: string) => z.input<Zod>
) => {
  const fakers: Record<string, Faker> = {};

  return (faker: Faker, path = ""): z.input<Zod> => {
    // @ts-expect-error -- We need faker to not be bundled with the library while getting both the class to create new instances and faker.locales.
    const FakerClass: typeof Faker = faker.constructor;

    if (!(path in fakers)) {
      // eslint-disable-next-line fp/no-mutation -- Need to set fakers
      fakers[path] = new FakerClass({ locales: faker.locales });
      fakers[path]!.seed(
        Array.from(path).reduce(
          // eslint-disable-next-line no-bitwise -- copied from somewhere
          (s, c) => (Math.imul(31, s) + c.charCodeAt(0)) | 0,
          0
        )
      );
    }

    return mockFn(fakers[path]!, path);
  };
};

// TODO createType tests
export const createType = <
  Definition,
  Input,
  Zod extends z.ZodType<any, any, Input> | z.ZodObject<any>
>({
  mock,
  zod,
  parse = zod.parse.bind(zod),
  ...def
}: Merge<
  SetOptional<SanityType<Definition, Zod>, "parse">,
  { mock: (faker: Faker, path: string) => Input }
>): SanityType<Definition, Zod> => ({
  ...def,
  mock: createMocker(mock),
  parse,
  zod,
});

// Don't use Merge, because it creates a deep recursive type
export type Rule<Value> = Omit<RuleWithoutTypedCustom, "custom"> & {
  custom: (fn: CustomValidator<PartialDeep<Value>>) => Rule<PartialDeep<Value>>;
};

export type WithTypedValidation<
  Definition,
  Zod extends z.ZodType<any, any, any>
> = Merge<
  Definition,
  { validation?: (rule: Rule<z.input<Zod>>) => Rule<z.input<Zod>> }
>;

export type NamedSchemaFields = "description" | "name" | "title";

export type SanityTypeDef<
  Definition,
  Zod extends z.ZodType<any, any, any>,
  Output
> = Merge<
  WithTypedValidation<Omit<Definition, NamedSchemaFields | "type">, Zod>,
  {
    initialValue?: z.input<Zod> | (() => Promisable<z.input<Zod>>);
    mock?: (faker: Faker, path: string) => z.input<Zod>;
    zod?: (zod: Zod) => z.ZodType<Output, any, z.input<Zod>>;
  }
>;

export type SanityNamedTypeDef<
  Definition,
  Zod extends z.ZodType<any, any, any>,
  Output
> = Merge<
  WithTypedValidation<Omit<Definition, "type">, Zod>,
  {
    initialValue?: z.input<Zod> | (() => Promisable<z.input<Zod>>);
    mock?: (faker: Faker, path: string) => z.input<Zod>;
    zod?: (zod: Zod) => z.ZodType<Output, any, z.input<Zod>>;
  }
>;
