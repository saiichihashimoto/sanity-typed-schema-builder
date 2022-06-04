import { z } from "zod";

import type { SanityType } from "../types";

interface StringType extends SanityType<StringFieldDef, z.ZodString> {}

export const string = (
  def: Omit<StringFieldDef, "description" | "type"> = {}
): StringType => {
  const zod = z.string();

  return {
    zod,
    parse: zod.parse.bind(zod),
    schema: () => ({
      ...def,
      type: "string",
    }),
  };
};
