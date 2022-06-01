import type { InferDefinition, InferValue, SanityType } from "../types";

interface BooleanType extends SanityType<boolean, BooleanFieldDef> {}

export const boolean = (
  def: Omit<InferDefinition<BooleanType>, "description" | "type"> = {}
): BooleanType => ({
  _value: undefined as unknown as InferValue<BooleanType>,
  schema: () => ({
    ...def,
    type: "boolean",
  }),
});
