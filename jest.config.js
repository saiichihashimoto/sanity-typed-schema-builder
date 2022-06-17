/**
 * @type {import('@jest/types').Config.InitialOptions}
 * */
const config = {
  preset: "ts-jest",
  rootDir: "./src",
  testMatch: ["**/*.spec.ts"],
  testEnvironment: "node",
  modulePaths: ["<rootDir>"],
  clearMocks: true,
  moduleDirectories: ["node_modules"],
  resetMocks: true,
  restoreMocks: true,
  fakeTimers: {
    enableGlobally: true,
  },
};

module.exports = config;
