import { describe, expect, it } from "@jest/globals";
import { z } from "zod";

import { mockRule } from "../test-utils";

import { url } from ".";

import type { ValidateShape } from "../test-utils";
import type { InferInput, InferOutput } from "../types";

describe("url", () => {
  it("builds a sanity config", () =>
    expect(url().schema()).toEqual({
      type: "url",
    }));

  it("passes through schema values", () =>
    expect(url({ hidden: false }).schema()).toHaveProperty("hidden", false));

  it("parses into a string", () => {
    const type = url();

    const value: ValidateShape<
      InferInput<typeof type>,
      string
    > = "https://example.com/img.jpg";
    const parsedValue: ValidateShape<
      InferOutput<typeof type>,
      string
    > = type.parse(value);

    expect(parsedValue).toEqual(value);
  });

  it("enforces a url", () => {
    const type = url();

    const value: ValidateShape<InferInput<typeof type>, string> = "not a url";

    expect(() => {
      type.parse(value);
    }).toThrow(z.ZodError);
  });

  it("mocks a url", () =>
    expect(z.string().url().parse(url().mock())).toEqual(expect.any(String)));

  it("allows defining the mocks", () =>
    expect(["https://google.com", "https://facebook.com"]).toContainEqual(
      url({
        mock: (faker) =>
          faker.helpers.arrayElement([
            "https://google.com",
            "https://facebook.com",
          ]),
      }).mock()
    ));

  it("allows defining the zod", () => {
    const type = url({
      zod: (zod) => zod.transform((value) => value.length),
    });

    const parsedValue: ValidateShape<
      InferOutput<typeof type>,
      number
    > = type.parse("https://google.com");

    expect(parsedValue).toEqual(18);
  });

  it("types custom validation", () => {
    const type = url({
      validation: (Rule) =>
        Rule.custom((value) => {
          const url: ValidateShape<typeof value, string> = value;

          return url.length > 50 || "Needs to be 50 characters";
        }),
    });

    const rule = mockRule();

    type.schema().validation?.(rule);

    expect(rule.custom).toHaveBeenCalledWith(expect.any(Function));
  });
});
