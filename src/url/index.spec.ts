import { describe, expect, it } from "@jest/globals";
import { z } from "zod";

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
});
