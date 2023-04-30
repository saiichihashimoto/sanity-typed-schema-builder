import { faker } from "@faker-js/faker";
import { describe, expect, it } from "@jest/globals";

import type { GeopointValue } from "sanity";
import { mockRule } from "../test-utils";

import { geopoint } from ".";

import type { ValidateShape } from "../test-utils";
import type {
  InferParsedValue,
  InferResolvedValue,
  InferValue,
} from "../types";

describe("geopoint", () => {
  it("builds a sanity config", () =>
    expect(geopoint().schema()).toStrictEqual({
      type: "geopoint",
    }));

  it("passes through schema values", () =>
    expect(geopoint({ hidden: false }).schema()).toHaveProperty(
      "hidden",
      false
    ));

  it("parses into a geopoint", () => {
    const type = geopoint();

    const value: ValidateShape<InferValue<typeof type>, GeopointValue> = {
      _type: "geopoint",
      lat: 58.63169011423141,
      lng: 9.089101352587932,
      alt: 13.37,
    };
    const parsedValue: ValidateShape<
      InferParsedValue<typeof type>,
      GeopointValue
    > = type.parse(value);

    expect(parsedValue).toStrictEqual(value);
  });

  it("resolves into a geopoint", () => {
    const type = geopoint();

    const value: ValidateShape<InferValue<typeof type>, GeopointValue> = {
      _type: "geopoint",
      lat: 58.63169011423141,
      lng: 9.089101352587932,
      alt: 13.37,
    };
    const resolvedValue: ValidateShape<
      InferResolvedValue<typeof type>,
      GeopointValue
    > = type.resolve(value);

    expect(resolvedValue).toStrictEqual(value);
  });

  it("mocks a geopoint", () =>
    expect(geopoint().mock(faker)).toStrictEqual({
      _type: "geopoint",
      lat: expect.any(Number),
      lng: expect.any(Number),
      alt: expect.any(Number),
    }));

  it("mocks the same value with the same path", () => {
    expect(geopoint().mock(faker)).toStrictEqual(geopoint().mock(faker));
    expect(geopoint().mock(faker, ".foo")).toStrictEqual(
      geopoint().mock(faker, ".foo")
    );

    expect(geopoint().mock(faker, ".foo")).not.toStrictEqual(
      geopoint().mock(faker)
    );
    expect(geopoint().mock(faker)).not.toStrictEqual(
      geopoint().mock(faker, ".foo")
    );
  });

  it("allows defining the mocks", () =>
    expect([
      {
        _type: "geopoint",
        lat: 58.63169011423141,
        lng: 9.089101352587932,
        alt: 13.37,
      },
      {
        _type: "geopoint",
        lat: -58.63169011423141,
        lng: -9.089101352587932,
        alt: 12.37,
      },
    ]).toContainEqual(
      geopoint({
        mock: (faker) =>
          faker.helpers.arrayElement([
            {
              _type: "geopoint",
              lat: 58.63169011423141,
              lng: 9.089101352587932,
              alt: 13.37,
            },
            {
              _type: "geopoint",
              lat: -58.63169011423141,
              lng: -9.089101352587932,
              alt: 12.37,
            },
          ]),
      }).mock(faker)
    ));

  it("allows defining the zod", () => {
    const type = geopoint({
      zod: (zod) => zod.transform(({ lat }) => lat),
    });

    const parsedValue: ValidateShape<
      InferParsedValue<typeof type>,
      number
    > = type.parse({
      _type: "geopoint",
      lat: 58.63169011423141,
      lng: 9.089101352587932,
      alt: 13.37,
    });

    expect(parsedValue).toBe(58.63169011423141);
  });

  it("types custom validation", () => {
    const type = geopoint({
      validation: (Rule) =>
        Rule.custom((value) => {
          const geopoint: ValidateShape<
            typeof value,
            GeopointValue | undefined
          > = value;

          return (geopoint?.lat ?? 0) > 50 || "Needs to be greater than 50";
        }),
    });

    const rule = mockRule();

    type.schema().validation?.(rule);

    expect(rule.custom).toHaveBeenCalledWith(expect.any(Function));
  });
});
