import { z } from "zod";

import type { SanityType } from "../types";

interface GeopointType
  extends SanityType<
    GeopointFieldDef,
    z.ZodObject<{
      _type: z.ZodLiteral<"geopoint">;
      alt: z.ZodNumber;
      lat: z.ZodNumber;
      lng: z.ZodNumber;
    }>
  > {}

export const geopoint = (
  def: Omit<GeopointFieldDef, "description" | "type"> = {}
): GeopointType => {
  const zod = z.object({
    _type: z.literal("geopoint"),
    alt: z.number(),
    lat: z.number(),
    lng: z.number(),
  });

  return {
    zod,
    parse: zod.parse.bind(zod),
    schema: () => ({
      ...def,
      type: "geopoint",
    }),
  };
};
