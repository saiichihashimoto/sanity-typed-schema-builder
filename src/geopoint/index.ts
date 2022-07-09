import { z } from "zod";

import { createType } from "../types";

import type { SanityTypeDef } from "../types";
import type { Schema } from "@sanity/types";

export interface SanityGeopoint {
  _type: "geopoint";
  alt: number;
  lat: number;
  lng: number;
}

const zod: z.ZodType<SanityGeopoint, any, SanityGeopoint> = z.object({
  _type: z.literal("geopoint"),
  alt: z.number(),
  lat: z.number(),
  lng: z.number(),
});

export const geopoint = <
  ParsedValue = SanityGeopoint,
  ResolvedValue = SanityGeopoint
>({
  mock = (faker) => ({
    _type: "geopoint",
    alt: faker.datatype.number({ min: 0, max: 1000 }),
    lat: parseFloat(faker.address.latitude()),
    lng: parseFloat(faker.address.longitude()),
  }),
  zod: zodFn = (zod) =>
    zod as unknown as z.ZodType<ParsedValue, any, SanityGeopoint>,
  zodResolved,
  ...def
}: SanityTypeDef<
  Schema.GeopointDefinition,
  SanityGeopoint,
  ParsedValue,
  ResolvedValue
> = {}) =>
  createType({
    mock,
    schema: () => ({
      ...def,
      type: "geopoint",
    }),
    zod: zodFn(zod),
    zodResolved: zodResolved?.(zod),
  });
