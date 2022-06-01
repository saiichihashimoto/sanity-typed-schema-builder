import type { InferDefinition, InferValue, SanityType } from "../types";

interface URLType extends SanityType<string, URLFieldDef> {}

export const url = (
  def: Omit<InferDefinition<URLType>, "description" | "type"> = {}
): URLType => ({
  _value: undefined as unknown as InferValue<URLType>,
  schema: () => ({
    ...def,
    type: "url",
  }),
});
