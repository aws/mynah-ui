const isHeadless = process.env.HEADLESS !== 'false';

module.exports = {
    rootDir: './',
    roots: ['./__test__', './src'],
    preset: 'jest-playwright-preset',
    testEnvironmentOptions: {
        'jest-playwright': {
            use: {
                trace: 'retain-on-failure',
            },
            browsers: ['webkit', 'chromium'],
            launchOptions: {
                headless: isHeadless,
            },
        },
    },
    transform: { '^.+\\.ts?$': 'ts-jest' },
    testMatch: ['**/?(*.)+(spec|test).[t]s'],
    testPathIgnorePatterns: ['/node_modules/', 'dist', 'src'],
    testTimeout: 15000,
};
