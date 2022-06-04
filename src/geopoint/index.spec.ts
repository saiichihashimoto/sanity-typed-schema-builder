import { describe, expect, it } from "@jest/globals";

import { geopoint } from ".";

import type { ValidateShape } from "../test-utils";
import type { InferInput, InferOutput } from "../types";

interface SanityGeopoint {
  _type: "geopoint";
  alt: number;
  lat: number;
  lng: number;
}

describe("geopoint", () => {
  it("builds a sanity config", () =>
    expect(geopoint().schema()).toEqual({
      type: "geopoint",
    }));

  it("passes through schema values", () =>
    expect(geopoint({ hidden: false }).schema()).toHaveProperty(
      "hidden",
      false
    ));

  it("parses into a geopoint", () => {
    const type = geopoint();

    const value: ValidateShape<InferInput<typeof type>, SanityGeopoint> = {
      _type: "geopoint",
      lat: 58.63169011423141,
      lng: 9.089101352587932,
      alt: 13.37,
    };
    const parsedValue: ValidateShape<
      InferOutput<typeof type>,
      SanityGeopoint
    > = type.parse(value);

    expect(parsedValue).toEqual(value);
  });
});
