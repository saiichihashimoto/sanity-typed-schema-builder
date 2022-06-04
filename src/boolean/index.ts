import { z } from "zod";

import type { SanityType } from "../types";

interface BooleanType extends SanityType<BooleanFieldDef, z.ZodBoolean> {}

export const boolean = (
  def: Omit<BooleanFieldDef, "description" | "type"> = {}
): BooleanType => {
  const zod = z.boolean();

  return {
    zod,
    parse: zod.parse.bind(zod),
    schema: () => ({
      ...def,
      type: "boolean",
    }),
  };
};
