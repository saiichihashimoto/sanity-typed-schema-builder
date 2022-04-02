/**
 * @type {import('@jest/types').Config.InitialOptions}
 * */
const config = {
  preset: "ts-jest",
  rootDir: "src",
  testMatch: ["**/*.spec.ts"],
  testEnvironment: "node",
  clearMocks: true,
  moduleDirectories: ["node_modules"],
  resetMocks: true,
  restoreMocks: true,
  timers: "modern",
};

module.exports = config;
