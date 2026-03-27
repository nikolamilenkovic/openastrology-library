import { expect } from '@jest/globals';

// Type declaration for custom Jest matcher
declare global {
    namespace jest {
        interface Matchers<R, T = {}> {
            toBeWithinEpsilon(expected: number, epsilon?: number): R;
        }
    }
}

expect.extend({
    toBeWithinEpsilon(received: number, expected: number, epsilon: number = 0.1) {
        const pass = Math.abs(received - expected) < epsilon;
        return {
            message: () => `expected ${received} to be within ${epsilon} of ${expected} (difference: ${Math.abs(received - expected)})`,
            pass,
        };
    },
});

