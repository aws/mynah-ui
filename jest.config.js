const jestConfig = {
  testEnvironment: 'jsdom',
  preset: 'ts-jest',
  moduleNameMapper: {
    '\\.svg$': 'jest-svg-transformer',
  },
  setupFiles: ['core-js'], // Polyfill things like structuredClone
};

module.exports = jestConfig;
