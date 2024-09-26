module.exports = {
    rootDir: './',
    roots: ['./__test__', './src'],
    preset: 'jest-playwright-preset',
    transform: { '^.+\\.ts?$': 'ts-jest' },
    testMatch: ['**/?(*.)+(spec|test).[t]s'],
    testPathIgnorePatterns: ['/node_modules/', 'dist', 'src'],
    setupFilesAfterEnv: ['./jest.image.ts'],
    testTimeout: 15000,
};
