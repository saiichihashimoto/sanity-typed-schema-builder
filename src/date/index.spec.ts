import { describe, expect, it } from "@jest/globals";
import { z } from "zod";

import { date } from ".";

import type { ValidateShape } from "../test-utils";
import type { InferInput, InferOutput } from "../types";

describe("date", () => {
  it("builds a sanity config", () =>
    expect(date().schema()).toEqual({
      type: "date",
    }));

  it("passes through schema values", () =>
    expect(date({ hidden: false }).schema()).toHaveProperty("hidden", false));

  it("parses into a date", () => {
    const type = date();

    const value: ValidateShape<InferInput<typeof type>, string> = "2017-02-12";
    const parsedValue: ValidateShape<
      InferOutput<typeof type>,
      string
    > = type.parse(value);

    expect(parsedValue).toEqual(value);
  });

  it("mocks a string", () => {
    const value = date().mock();

    expect(value).toEqual(expect.any(String));

    z.string()
      .regex(/^\d\d\d\d-\d\d-\d\d$/)
      .parse(value);
  });

  it("allows defining the mocks", () =>
    expect(["2010-05-06", "2011-04-27"]).toContainEqual(
      date({
        mock: (faker) =>
          faker.helpers.arrayElement(["2010-05-06", "2011-04-27"]),
      }).mock()
    ));
});
