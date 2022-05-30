import { describe, expect, it } from "@jest/globals";

import { foo } from ".";

describe("foo", () => {
  it("Hello World", () => {
    expect(foo).toEqual("Hello World");
  });
});
