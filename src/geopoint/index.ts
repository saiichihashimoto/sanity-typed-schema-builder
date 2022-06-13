import { z } from "zod";

import { createType } from "../types";

import type { FieldOptionKeys } from "../field";
import type { TypeValidation } from "../types";
import type { Faker } from "@faker-js/faker";
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
}: Omit<
  TypeValidation<Schema.GeopointDefinition, SanityGeopoint>,
  FieldOptionKeys | "type"
> & {
  mock?: (faker: Faker, path: string) => SanityGeopoint;
  zod?: (
    zod: z.ZodType<SanityGeopoint, any, SanityGeopoint>
  ) => z.ZodType<Output, any, SanityGeopoint>;
} = {}) =>
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
