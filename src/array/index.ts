import { flow } from "lodash/fp";
import { z } from "zod";

import type { InferZod, SanityType } from "../types";

enum Modes {
  Undecided,
  NonPrimitive,
  Primitive,
}

type PrimitiveValue = string | number | boolean;

type InputFromMode<Mode extends Modes> = Mode extends Modes.Undecided
  ? PrimitiveValue | Record<string, any>
  : Mode extends Modes.Primitive
  ? PrimitiveValue
  : Record<string, any>;

type ModeFromInput<Input> = Input extends PrimitiveValue
  ? Modes.Primitive
  : Modes.NonPrimitive;

interface ArrayType<
  Mode extends Modes,
  Positions extends string,
  Fields extends {
    [field in Positions]: SanityType<any, any>;
  },
  NonEmpty extends boolean
> extends SanityType<
    ArrayFieldDef<any, any>,
    z.ZodArray<
      "00" extends Positions
        ? z.ZodUnion<
            readonly [
              InferZod<Fields[keyof Fields]>,
              ...Array<InferZod<Fields[keyof Fields]>>
            ]
          >
        : "0" extends Positions
        ? InferZod<Fields[keyof Fields]>
        : z.ZodNever,
      NonEmpty extends true ? "atleastone" : "many"
    >
  > {
  of: <
    Input extends InputFromMode<Mode>,
    Zod extends z.ZodType<any, any, Input>,
    NewPosition extends Exclude<`${Positions}0`, Positions>
  >(
    type: SanityType<any, Zod>
  ) => ArrayType<
    ModeFromInput<Input>,
    Positions | NewPosition,
    // @ts-expect-error -- Not sure how to solve this
    Fields & {
      [field in NewPosition]: SanityType<any, Zod>;
    },
    NonEmpty
  >;
}

type ArrayDef<NonEmpty extends boolean> = Omit<
  ArrayFieldDef<any, any>,
  "description" | "of" | "type"
> & {
  length?: number;
  max?: number;
  min?: number;
  nonempty?: NonEmpty;
};

const arrayInternal = <
  Mode extends Modes,
  Positions extends string,
  Fields extends {
    [field in Positions]: SanityType<any, any>;
  },
  NonEmpty extends boolean
>(
  def: ArrayDef<NonEmpty>,
  ofs: Array<Fields[keyof Fields]>
): ArrayType<Mode, Positions, Fields, NonEmpty> => {
  const { length, max, min, nonempty, validation } = def;

  type ZodArrayElement = "00" extends Positions
    ? z.ZodUnion<
        readonly [
          InferZod<Fields[keyof Fields]>,
          ...Array<InferZod<Fields[keyof Fields]>>
        ]
      >
    : "0" extends Positions
    ? InferZod<Fields[keyof Fields]>
    : z.ZodNever;

  type ZodArrayTypeMany = z.ZodArray<ZodArrayElement, "many">;

  type ZodArrayType = z.ZodArray<
    ZodArrayElement,
    NonEmpty extends true ? "atleastone" : "many"
  >;

  const zod = flow(
    (zod: ZodArrayTypeMany) => (!nonempty ? zod : zod.nonempty()),
    (zod: ZodArrayType) => (!min ? zod : zod.min(min)),
    (zod: ZodArrayType) => (!max ? zod : zod.max(max)),
    (zod: ZodArrayType) => (length === undefined ? zod : zod.length(length))
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
                }: SanityType<any, Zod>) => zod
              ) as unknown as readonly [
              InferZod<Fields[keyof Fields]>,
              ...Array<InferZod<Fields[keyof Fields]>>
            ]),
          ])
    ) as ZodArrayTypeMany
  ) as ZodArrayType;

  return {
    zod,
    parse: zod.parse.bind(zod),
    // FIXME Mock the array element types. Not sure how to allow an override, since the function has to be defined before we know the element types.
    mock: () => [] as unknown as z.infer<ZodArrayType>,
    schema: () => ({
      ...def,
      type: "array",
      of: ofs.map(<Definition>({ schema }: SanityType<Definition, any>) =>
        schema()
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
      Input extends InputFromMode<Mode>,
      Zod extends z.ZodType<any, any, Input>,
      NewPosition extends Exclude<`${Positions}0`, Positions>,
      NonEmpty extends boolean
    >(
      type: SanityType<any, Zod>
    ) =>
      arrayInternal<
        ModeFromInput<z.input<Zod>>,
        Positions | NewPosition,
        // @ts-expect-error -- Not sure how to solve this
        Fields & {
          [field in NewPosition]: SanityType<any, Zod>;
        },
        NonEmpty
      >(def, [...ofs, type]),
  };
};

export const array = <NonEmpty extends boolean = false>(
  def: ArrayDef<NonEmpty> = {}
) => arrayInternal<Modes.Undecided, "", Record<"", never>, NonEmpty>(def, []);
