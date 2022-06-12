import { describe, expect, it } from "@jest/globals";
import { z } from "zod";

import { mockRule } from "../test-utils";

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

  it("types custom validation", () => {
    const type = date({
      validation: (Rule) =>
        Rule.custom((value) => {
          const date: ValidateShape<typeof value, string> = value;

          return date.length > 50 || "Needs to be 50 characters";
        }),
    });

    const rule = mockRule();

    type.schema().validation?.(rule);

    expect(rule.custom).toHaveBeenCalledWith(expect.any(Function));
  });
});
