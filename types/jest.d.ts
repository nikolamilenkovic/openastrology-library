export {};

// Declare global type definitions for TypeScript
declare global {
    namespace jest {
        interface Matchers<R, T = {}> {
            toBeWithinEpsilon(expected: number, epsilon?: number): R;
        }
    }
}