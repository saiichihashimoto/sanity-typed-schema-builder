import { z } from "zod";

import { createType } from "../types";

import type { SanityTypeDef } from "../types";
import type { Schema } from "@sanity/types";

interface SanityGeopoint {
  _type: "geopoint";
  alt: number;
  lat: number;
  lng: number;
}

export const geopoint = <Output = SanityGeopoint>({
  mock = (faker) => ({
    _type: "geopoint",
    alt: faker.datatype.number({ min: 0, max: 1000 }),
    lat: faker.datatype.number({ min: -90, max: 90 }),
    lng: faker.datatype.number({ min: -180, max: 180 }),
  }),
  zod: zodFn = (zod) =>
    zod as unknown as z.ZodType<Output, any, SanityGeopoint>,
  ...def
}: SanityTypeDef<
  Schema.GeopointDefinition,
  z.ZodType<SanityGeopoint, any, SanityGeopoint>,
  Output
> = {}) =>
  createType({
    mock,
    zod: zodFn(
      z.object({
        _type: z.literal("geopoint"),
        alt: z.number(),
        lat: z.number(),
        lng: z.number(),
      })
    ),
    schema: () => ({
      ...def,
      type: "geopoint",
    }),
  });
