import { z } from "zod";

import type { SanityType } from "../types";

interface DateType extends SanityType<DateFieldDef, z.ZodString> {}

export const date = (
  def: Omit<DateFieldDef, "description" | "type"> = {}
): DateType => {
  // TODO Check date validity against dateFormat with something like moment (moment is too big)
  const zod = z.string();

  return {
    zod,
    parse: zod.parse.bind(zod),
    schema: () => ({
      ...def,
      type: "date",
    }),
  };
};
