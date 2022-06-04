import { z } from "zod";

import type { SanityType } from "../types";

interface NumberType extends SanityType<NumberFieldDef, z.ZodNumber> {}

export const number = (
  def: Omit<NumberFieldDef, "description" | "type"> = {}
): NumberType => {
  const zod = z.number();

  return {
    zod,
    parse: zod.parse.bind(zod),
    schema: () => ({
      ...def,
      type: "number",
    }),
  };
};
