module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/test'],
    testMatch: [
        '**/*.test.ts', //
        '**/*.spec.ts'
    ],
    transform: {
        '^.+\\.ts$': ['ts-jest', {
            tsconfig: {
                esModuleInterop: true,
                allowSyntheticDefaultImports: true
            }
        }]
    },
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1'
    },
    collectCoverageFrom: [
        'src/**/*.ts', //
        '!src/**/*.d.ts',
        '!src/**/index.ts',
        '!src/types/**'
    ],
    coverageDirectory: 'coverage',
    coverageReporters: [
        'text', //
        'lcov',
        'html'
    ],
    setupFilesAfterEnv: [
        './test/jest-utils.ts' //
    ]
};
