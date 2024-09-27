module.exports = {
    rootDir: './',
    roots: ['./__test__', './src'],
    preset: 'jest-playwright-preset',
    testEnvironmentOptions: {
        'jest-playwright': {
            browsers: ['webkit', 'chromium'],
            launchOptions: {
                headless: true,
                args: [
                    '--disable-skia-runtime-opts',
                    '--disable-font-subpixel-positioning',
                    '--disable-lcd-text',
                ]
            }
        },
    },
    transform: { '^.+\\.ts?$': 'ts-jest' },
    testMatch: ['**/?(*.)+(spec|test).[t]s'],
    testPathIgnorePatterns: ['/node_modules/', 'dist', 'src'],
    testTimeout: 15000,
};
