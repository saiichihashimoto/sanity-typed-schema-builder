import { z } from "zod";

import { createType } from "../types";

import type { FieldOptionKeys } from "../field";
import type { SanityType, TypeValidation } from "../types";
import type { Faker } from "@faker-js/faker";
import type { Schema } from "@sanity/types";

type ZodGeopoint = z.ZodObject<{
  _type: z.ZodLiteral<"geopoint">;
  alt: z.ZodNumber;
  lat: z.ZodNumber;
  lng: z.ZodNumber;
}>;

type SanityGeopoint = z.input<ZodGeopoint>;

export const geopoint = ({
  mock = (faker) => ({
    _type: "geopoint",
    alt: faker.datatype.number({ min: 0, max: 1000 }),
    lat: faker.datatype.number({ min: -90, max: 90 }),
    lng: faker.datatype.number({ min: -180, max: 180 }),
  }),
  ...def
}: Omit<
  TypeValidation<Schema.GeopointDefinition, SanityGeopoint>,
  FieldOptionKeys | "type"
> & {
  mock?: (faker: Faker) => SanityGeopoint;
} = {}): SanityType<
  Omit<
    TypeValidation<Schema.GeopointDefinition, SanityGeopoint>,
    FieldOptionKeys
  >,
  ZodGeopoint
> =>
  createType({
    mock,
    zod: z.object({
      _type: z.literal("geopoint"),
      alt: z.number(),
      lat: z.number(),
      lng: z.number(),
    }),
    schema: () => ({
      ...def,
      type: "geopoint",
    }),
  });
