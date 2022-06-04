import { z } from "zod";

import type { SanityType } from "../types";

interface SlugType
  extends SanityType<
    SlugFieldDef<string>,
    z.ZodType<
      string,
      any,
      {
        _type: "slug";
        current: string;
      }
    >
  > {}

export const slug = (
  def: Omit<SlugFieldDef<string>, "description" | "type"> = {}
): SlugType => {
  const zod = z
    .object({
      _type: z.literal("slug"),
      current: z.string(),
    })
    .transform(({ current }) => current);

  return {
    zod,
    parse: zod.parse.bind(zod),
    schema: () => ({
      ...def,
      type: "slug",
    }),
  };
};
