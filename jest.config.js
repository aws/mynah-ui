const jestConfig = {
    testEnvironment: 'jsdom',
    preset: 'ts-jest',
    moduleNameMapper: {
        '\\.svg$': 'jest-svg-transformer',
        '^.+\\.(css|less|scss)$': 'babel-jest',
    },
    setupFiles: ['<rootDir>/test-config/config.js', 'core-js'], // Polyfill things like structuredClone
};

module.exports = jestConfig;
