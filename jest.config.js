const jestConfig = {
  testEnvironment: 'jsdom',
  preset: 'ts-jest',
  moduleNameMapper: {
    '\\.svg$': 'jest-svg-transformer',
  },
};

module.exports = jestConfig;
