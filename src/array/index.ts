import { flow } from "lodash/fp";
import { z } from "zod";

import type { FieldOptionKeys } from "../fields";
import type { InferZod, SanityType } from "../types";
import type { Schema } from "@sanity/types";

type UnArray<T> = T extends Array<infer U> ? U : never;

// HACK Shouldn't have to omit FieldOptionKeys because arrays don't need names
type ArrayElementDefinition = Omit<
  UnArray<Schema.ArrayDefinition["of"]>,
  FieldOptionKeys
>;

type ZodArrayElement<
  Positions extends string,
  Fields extends {
    [field in Positions]: SanityType<ArrayElementDefinition, any>;
  }
> = "00" extends Positions
  ? z.ZodUnion<
      readonly [
        InferZod<Fields[keyof Fields]>,
        ...Array<InferZod<Fields[keyof Fields]>>
      ]
    >
  : "0" extends Positions
  ? InferZod<Fields[keyof Fields]>
  : z.ZodNever;

type ZodArray<
  Positions extends string,
  Fields extends {
    [field in Positions]: SanityType<ArrayElementDefinition, any>;
  },
  NonEmpty extends boolean
> = z.ZodArray<
  ZodArrayElement<Positions, Fields>,
  NonEmpty extends true ? "atleastone" : "many"
>;

interface ArrayType<
  Positions extends string,
  Fields extends {
    [field in Positions]: SanityType<ArrayElementDefinition, any>;
  },
  NonEmpty extends boolean
> extends SanityType<
    Omit<
      Schema.ArrayDefinition<z.infer<ZodArray<Positions, Fields, NonEmpty>>>,
      FieldOptionKeys
    >,
    ZodArray<Positions, Fields, NonEmpty>
  > {
  of: <
    Zod extends z.ZodType<any, any, any>,
    NewPosition extends Exclude<`${Positions}0`, Positions>
  >(
    type: SanityType<ArrayElementDefinition, Zod>
  ) => ArrayType<
    Positions | NewPosition,
    // @ts-expect-error -- Not sure how to solve this
    Fields & {
      [field in NewPosition]: SanityType<ArrayElementDefinition, Zod>;
    },
    NonEmpty
  >;
}

type ArrayDef<
  Positions extends string,
  Fields extends {
    [field in Positions]: SanityType<ArrayElementDefinition, any>;
  },
  NonEmpty extends boolean
> = Omit<
  Schema.ArrayDefinition<z.infer<ZodArray<Positions, Fields, NonEmpty>>>,
  FieldOptionKeys | "of" | "type"
> & {
  length?: number;
  max?: number;
  min?: number;
  nonempty?: NonEmpty;
};

const arrayInternal = <
  Positions extends string,
  Fields extends {
    [field in Positions]: SanityType<ArrayElementDefinition, any>;
  },
  NonEmpty extends boolean
>(
  def: ArrayDef<Positions, Fields, NonEmpty>,
  ofs: Array<Fields[keyof Fields]>
): ArrayType<Positions, Fields, NonEmpty> => {
  const { length, max, min, nonempty, validation } = def;

  const zod = flow(
    (zod: ZodArray<Positions, Fields, false>) =>
      !nonempty ? zod : zod.nonempty(),
    (zod: ZodArray<Positions, Fields, NonEmpty>) => (!min ? zod : zod.min(min)),
    (zod: ZodArray<Positions, Fields, NonEmpty>) => (!max ? zod : zod.max(max)),
    (zod: ZodArray<Positions, Fields, NonEmpty>) =>
      length === undefined ? zod : zod.length(length)
  )(
    z.array(
      ofs.length === 0
        ? z.never()
        : ofs.length === 1
        ? ofs[0]!.zod
        : z.union([
            ofs[0]!.zod,
            ofs[1]!.zod,
            ...(ofs
              .slice(2)
              .map(
                <Zod extends z.ZodType<any, any, any>>({
                  zod,
                }: SanityType<ArrayElementDefinition, Zod>) => zod
              ) as unknown as readonly [
              InferZod<Fields[keyof Fields]>,
              ...Array<InferZod<Fields[keyof Fields]>>
            ]),
          ])
    ) as ZodArray<Positions, Fields, false>
  ) as ZodArray<Positions, Fields, NonEmpty>;

  return {
    zod,
    parse: zod.parse.bind(zod),
    // FIXME Mock the array element types. Not sure how to allow an override, since the function has to be defined before we know the element types.
    mock: () => [] as unknown as z.infer<ZodArray<Positions, Fields, NonEmpty>>,
    schema: () => ({
      ...def,
      type: "array",
      of: ofs.map(
        <
          Definition extends
            | Schema.TypeDefinition<any>
            | Schema.TypeReference<any>
        >({
          schema,
        }: SanityType<Definition, any>) => schema()
      ),
      validation: flow(
        (rule) => (!nonempty ? rule : rule.min(1)),
        (rule) => (!min ? rule : rule.min(min)),
        (rule) => (!max ? rule : rule.max(max)),
        (rule) => (length === undefined ? rule : rule.length(length)),
        (rule) => validation?.(rule) ?? rule
      ),
    }),
    of: <
      Zod extends z.ZodType<any, any, any>,
      NewPosition extends Exclude<`${Positions}0`, Positions>,
      NonEmpty extends boolean
    >(
      type: SanityType<ArrayElementDefinition, Zod>
    ) =>
      arrayInternal<
        Positions | NewPosition,
        // @ts-expect-error -- Not sure how to solve this
        Fields & {
          [field in NewPosition]: SanityType<ArrayElementDefinition, Zod>;
        },
        NonEmpty
      >(def, [...ofs, type]),
  };
};

export const array = <NonEmpty extends boolean = false>(
  def: ArrayDef<"", Record<"", never>, NonEmpty> = {}
) => arrayInternal<"", Record<"", never>, NonEmpty>(def, []);
