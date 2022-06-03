import { z } from "zod";

import type {
  InferDefinition,
  InferInput,
  InferOutput,
  InferZod,
  SanityType,
} from "../types";

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
    [field in Positions]: SanityType<any, any, any>;
  }
> extends SanityType<
    ArrayFieldDef<never, never>,
    Array<
      {
        [field in keyof Fields]: InferInput<Fields[field]>;
      }[keyof Fields]
    >,
    Array<
      {
        [field in keyof Fields]: InferOutput<Fields[field]>;
      }[keyof Fields]
    >
  > {
  of: <
    Input extends InputFromMode<Mode>,
    Output,
    NewPosition extends `${Positions}0`
  >(
    type: SanityType<any, Input, Output>
  ) => ArrayType<
    ModeFromInput<Input>,
    Positions | NewPosition,
    // @ts-expect-error -- Not sure how to solve this
    Fields & {
      [field in NewPosition]: SanityType<any, Input, Output>;
    }
  >;
}

const arrayInternal = <
  Mode extends Modes,
  Positions extends string,
  Fields extends {
    [field in Positions]: SanityType<any, InputFromMode<Mode>, any>;
  }
>(
  def: Omit<ArrayFieldDef<never, never>, "description" | "of" | "type">,
  ofs: Array<Fields[keyof Fields]>
): ArrayType<Mode, Positions, Fields> => {
  type ZodArrayType = z.ZodType<
    Array<
      { [field in keyof Fields]: InferOutput<Fields[field]> }[keyof Fields]
    >,
    any,
    Array<{ [field in keyof Fields]: InferInput<Fields[field]> }[keyof Fields]>
  >;

  const zod = (
    !ofs.length
      ? z.tuple([])
      : ofs.length === 1
      ? z.array(ofs[0]!.zod as InferZod<Fields[keyof Fields]>)
      : z.array(
          z.union([
            ofs[0]!.zod,
            ofs[1]!.zod,
            ...ofs
              .slice(2)
              .map(
                <Field extends keyof Fields>({ zod }: Fields[Field]) =>
                  zod as InferZod<Fields[Field]>
              ),
          ])
        )
  ) as ZodArrayType;

  return {
    zod,
    parse: zod.parse.bind(zod),
    schema: () => ({
      ...def,
      type: "array",
      of: ofs.map(({ schema }: Fields[keyof Fields]) =>
        (schema as () => InferDefinition<Fields[keyof Fields]>)()
      ),
    }),
    of: <
      Input extends InputFromMode<Mode>,
      Output,
      NewPosition extends `${Positions}0`
    >(
      type: SanityType<any, Input, Output>
    ) =>
      arrayInternal<
        ModeFromInput<Input>,
        Positions | NewPosition,
        // @ts-expect-error -- Not sure how to solve this
        Fields & {
          [position in NewPosition]: SanityType<any, Input, Output>;
        }
      >(def, [...ofs, type]),
  };
};

export const array = (
  def: Omit<ArrayFieldDef<never, never>, "description" | "of" | "type"> = {}
) => arrayInternal<Modes.Undecided, "", Record<"", never>>(def, []);
