import { z } from "zod";

import type { SanityType } from "../types";

interface URLType extends SanityType<URLFieldDef, z.ZodString> {}

export const url = (
  def: Omit<URLFieldDef, "description" | "type"> = {}
): URLType => {
  const zod = z.string().url();

  return {
    zod,
    parse: zod.parse.bind(zod),
    schema: () => ({
      ...def,
      type: "url",
    }),
  };
};
