import type { InferDefinition, SanityType } from "../base";

interface BooleanType extends SanityType<boolean, BooleanFieldDef> {}

export const boolean = (
  def: Omit<InferDefinition<BooleanType>, "type"> = {}
): BooleanType => ({
  _value: undefined as unknown as boolean,
  schema: () => ({
    ...def,
    type: "boolean",
  }),
});
