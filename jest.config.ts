import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  preset: "ts-jest",
  testMatch: ["**/*.spec.ts"],
  testEnvironment: "node",
  clearMocks: true,
  moduleDirectories: ["node_modules", "src"],
  resetMocks: true,
  restoreMocks: true,
  timers: "modern",
};

export default config;
