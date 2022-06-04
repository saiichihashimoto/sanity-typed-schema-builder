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
  }
> extends SanityType<
    ArrayFieldDef<never, never>,
    "00" extends Positions
      ? z.ZodArray<
          z.ZodUnion<
            readonly [
              InferZod<Fields[keyof Fields]>,
              ...Array<InferZod<Fields[keyof Fields]>>
            ]
          >
        >
      : "0" extends Positions
      ? z.ZodArray<InferZod<Fields[keyof Fields]>>
      : z.ZodTuple<[]>
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
    }
  >;
}

const arrayInternal = <
  Mode extends Modes,
  Positions extends string,
  Fields extends {
    [field in Positions]: SanityType<any, any>;
  }
>(
  def: Omit<ArrayFieldDef<never, never>, "description" | "of" | "type">,
  ofs: Array<Fields[keyof Fields]>
): ArrayType<Mode, Positions, Fields> => {
  type ZodArrayType = "00" extends Positions
    ? z.ZodArray<
        z.ZodUnion<
          readonly [
            InferZod<Fields[keyof Fields]>,
            ...Array<InferZod<Fields[keyof Fields]>>
          ]
        >
      >
    : "0" extends Positions
    ? z.ZodArray<InferZod<Fields[keyof Fields]>>
    : z.ZodTuple<[]>;

  const zod = (
    ofs.length === 0
      ? z.tuple([])
      : ofs.length === 1
      ? z.array(ofs[0]!.zod)
      : z.array(
          z.union([
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
        )
  ) as ZodArrayType;

  return {
    zod,
    parse: zod.parse.bind(zod),
    schema: () => ({
      ...def,
      type: "array",
      of: ofs.map(<Definition>({ schema }: SanityType<Definition, any>) =>
        schema()
      ),
    }),
    of: <
      Input extends InputFromMode<Mode>,
      Zod extends z.ZodType<any, any, Input>,
      NewPosition extends Exclude<`${Positions}0`, Positions>
    >(
      type: SanityType<any, Zod>
    ) =>
      arrayInternal<
        ModeFromInput<z.input<Zod>>,
        Positions | NewPosition,
        // @ts-expect-error -- Not sure how to solve this
        Fields & {
          [field in NewPosition]: SanityType<any, Zod>;
        }
      >(def, [...ofs, type]),
  };
};

export const array = (
  def: Omit<ArrayFieldDef<never, never>, "description" | "of" | "type"> = {}
) => arrayInternal<Modes.Undecided, "", Record<"", never>>(def, []);
