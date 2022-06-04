import { faker } from "@faker-js/faker";
import { z } from "zod";

import type { SanityType } from "../types";
import type { Faker } from "@faker-js/faker";

type ZodGeopoint = z.ZodObject<{
  _type: z.ZodLiteral<"geopoint">;
  alt: z.ZodNumber;
  lat: z.ZodNumber;
  lng: z.ZodNumber;
}>;

type SanityGeopoint = z.input<ZodGeopoint>;

interface GeopointType extends SanityType<GeopointFieldDef, ZodGeopoint> {}

export const geopoint = (
  def: Omit<GeopointFieldDef, "description" | "type"> & {
    mock?: (faker: Faker) => SanityGeopoint;
  } = {}
): GeopointType => {
  const {
    mock = () => ({
      _type: "geopoint",
      alt: faker.datatype.number({ min: 0, max: 1000 }),
      lat: faker.datatype.number({ min: -90, max: 90 }),
      lng: faker.datatype.number({ min: -180, max: 180 }),
    }),
  } = def;

  const zod = z.object({
    _type: z.literal("geopoint"),
    alt: z.number(),
    lat: z.number(),
    lng: z.number(),
  });

  return {
    zod,
    parse: zod.parse.bind(zod),
    mock: () => mock(faker),
    schema: () => ({
      ...def,
      type: "geopoint",
    }),
  };
};
