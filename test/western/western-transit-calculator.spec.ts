import { WesternTransitCalculator } from '../../src';
import { WesternTransitIngress } from '../../src';

// ─── Mock sweph ──────────────────────────────────────────────────────────────
// Mirrors the Vedic spec mock but with no SEFLG_SIDEREAL/set_sid_mode.

jest.mock('sweph', () => ({
    constants: {
        SE_SUN:       0,
        SE_MOON:      1,
        SE_MERCURY:   2,
        SE_VENUS:     3,
        SE_MARS:      4,
        SE_JUPITER:   5,
        SE_SATURN:    6,
        SE_URANUS:    7,
        SE_NEPTUNE:   8,
        SE_PLUTO:     9,
        SE_TRUE_NODE: 11,
        SE_MEAN_APOG: 12,
        SE_CHIRON:    15,
        SE_GREG_CAL:  1,
        SEFLG_SWIEPH:  2,
        SEFLG_SPEED:   256,
    },

    set_ephe_path: jest.fn(),
    close:         jest.fn(),

    julday: jest.fn().mockImplementation(
        (y: number, m: number, d: number) =>
            y === 2026 && m === 1 && d === 1 ? 2460000 : 2460060
    ),

    revjul: jest.fn().mockReturnValue({ year: 2026, month: 2, day: 14, hour: 6.5 }),

    // solcross_ut: one crossing within window
    solcross_ut: jest.fn().mockImplementation((_x: number, jd: number) => ({
        date: jd < 2460015 ? 2460010 : 2460070,
        error: '',
    })),

    // mooncross_ut: two crossings within window
    mooncross_ut: jest.fn().mockImplementation((_x: number, jd: number) => {
        if (jd <= 2460001)  return { date: 2460002.5, error: '' };
        if (jd <= 2460005)  return { date: 2460005.0, error: '' };
        return { date: 2460070, error: '' };
    }),

    // calc_ut: tropical longitudes (no sidereal shift)
    calc_ut: jest.fn().mockImplementation((jd: number, planet: number) => {
        if (planet === 0) {  // Sun
            const lon = jd < 2460005 ? 25.0 : jd < 2460015 ? 30.1 : 60.5;
            return { flag: 2, error: '', data: [lon, 0, 1, 1.0, 0, 0] };
        }
        if (planet === 1) {  // Moon
            const lon = jd < 2460002.5 ? 29.0 : jd < 2460005 ? 30.5 : 60.5;
            return { flag: 2, error: '', data: [lon, 0, 1, 13.0, 0, 0] };
        }
        if (planet === 4) {  // Mars — direct sign crossing
            const lon = jd < 2460019.5 ? 55.0 : 60.5;
            return { flag: 2, error: '', data: [lon, 0, 1, 0.5, 0, 0] };
        }
        if (planet === 7) {  // Uranus — very slow
            const lon = jd < 2460040 ? 22.0 : 30.1;
            return { flag: 2, error: '', data: [lon, 0, 1, 0.03, 0, 0] };
        }
        if (planet === 11) { // north_node — retrograde crossing
            const lon = jd < 2460030 ? 62.0 : 59.5;
            return { flag: 2, error: '', data: [lon, 0, 1, -0.05, 0, 0] };
        }
        return { flag: 2, error: '', data: [100.0, 0, 1, 0.5, 0, 0] };
    }),
}));

describe(WesternTransitCalculator.name, () => {
    let calculator: WesternTransitCalculator;

    beforeEach(() => {
        calculator = new WesternTransitCalculator();
        jest.clearAllMocks();
    });

    afterEach(() => {
        calculator.dispose();
    });

    // ─── Constructor ─────────────────────────────────────────────────────────

    describe('constructor', () => {
        it('creates an instance with default options', () => {
            expect(() => new WesternTransitCalculator()).not.toThrow();
        });

        it('accepts custom ephePath', () => {
            expect(() => new WesternTransitCalculator({ ephePath: '/tmp' })).not.toThrow();
        });
    });

    // ─── dispose ─────────────────────────────────────────────────────────────

    describe('dispose()', () => {
        it('calls close() on the sweph module', () => {
            const { close } = require('sweph');
            calculator.dispose();
            expect(close).toHaveBeenCalledTimes(1);
        });
    });

    // ─── Infrastructure ───────────────────────────────────────────────────────

    describe('calculateTransitIngresses – infrastructure', () => {
        it('calls set_ephe_path but NOT set_sid_mode (tropical mode)', () => {
            const { set_ephe_path, set_sid_mode } = require('sweph');
            calculator.calculateTransitIngresses(
                ['sun'],
                new Date('2026-01-01T00:00:00Z'),
                new Date('2026-03-01T00:00:00Z')
            );
            expect(set_ephe_path).toHaveBeenCalledTimes(1);
            expect(set_sid_mode).toBeUndefined(); // not imported at all
        });

        it('returns a sorted array for multiple planets', () => {
            const ingresses = calculator.calculateTransitIngresses(
                ['sun', 'moon'],
                new Date('2026-01-01T00:00:00Z'),
                new Date('2026-03-01T00:00:00Z')
            );
            for (let i = 1; i < ingresses.length; i++) {
                expect(ingresses[i].jd).toBeGreaterThanOrEqual(ingresses[i - 1].jd);
            }
        });

        it('returns only ingresses for the requested planets', () => {
            const ingresses = calculator.calculateTransitIngresses(
                ['mars'],
                new Date('2026-01-01T00:00:00Z'),
                new Date('2026-03-01T00:00:00Z')
            );
            for (const ing of ingresses) {
                expect(ing.planet).toBe('mars');
            }
        });
    });

    // ─── Sun ─────────────────────────────────────────────────────────────────

    describe('Sun ingresses (solcross_ut)', () => {
        it('uses solcross_ut for the Sun', () => {
            const { solcross_ut } = require('sweph');
            calculator.calculateTransitIngresses(
                ['sun'],
                new Date('2026-01-01T00:00:00Z'),
                new Date('2026-03-01T00:00:00Z')
            );
            expect(solcross_ut).toHaveBeenCalled();
        });

        it('Sun isRetrograde is always false', () => {
            const ingresses = calculator.calculateTransitIngresses(
                ['sun'],
                new Date('2026-01-01T00:00:00Z'),
                new Date('2026-03-01T00:00:00Z')
            );
            for (const ing of ingresses.filter(i => i.planet === 'sun')) {
                expect(ing.isRetrograde).toBe(false);
            }
        });

        it('Sun ingress shape is correct', () => {
            const ingresses = calculator.calculateTransitIngresses(
                ['sun'],
                new Date('2026-01-01T00:00:00Z'),
                new Date('2026-03-01T00:00:00Z')
            );
            const sun = ingresses.find(i => i.planet === 'sun')!;
            expect(sun).toMatchObject<Partial<WesternTransitIngress>>({
                planet:       'sun',
                isRetrograde: false,
            });
            expect(sun.sign).not.toBe(sun.fromSign);
            expect(sun.date).toBeInstanceOf(Date);
            expect(typeof sun.jd).toBe('number');
            expect(typeof sun.longitude).toBe('number');
        });
    });

    // ─── Moon ────────────────────────────────────────────────────────────────

    describe('Moon ingresses (mooncross_ut)', () => {
        it('uses mooncross_ut for the Moon', () => {
            const { mooncross_ut } = require('sweph');
            calculator.calculateTransitIngresses(
                ['moon'],
                new Date('2026-01-01T00:00:00Z'),
                new Date('2026-03-01T00:00:00Z')
            );
            expect(mooncross_ut).toHaveBeenCalled();
        });

        it('Moon isRetrograde is always false', () => {
            const ingresses = calculator.calculateTransitIngresses(
                ['moon'],
                new Date('2026-01-01T00:00:00Z'),
                new Date('2026-03-01T00:00:00Z')
            );
            for (const ing of ingresses.filter(i => i.planet === 'moon')) {
                expect(ing.isRetrograde).toBe(false);
            }
        });
    });

    // ─── Bisection planets ────────────────────────────────────────────────────

    describe('Mars ingresses (bisection, direct)', () => {
        it('isRetrograde is false when speed > 0', () => {
            const ingresses = calculator.calculateTransitIngresses(
                ['mars'],
                new Date('2026-01-01T00:00:00Z'),
                new Date('2026-03-01T00:00:00Z')
            );
            const marsIngresses = ingresses.filter(i => i.planet === 'mars');
            expect(marsIngresses.length).toBeGreaterThanOrEqual(1);
            expect(marsIngresses[0].isRetrograde).toBe(false);
        });
    });

    describe('Uranus ingresses (slow planet, 15d step)', () => {
        it('finds a Uranus sign crossing within the window', () => {
            const ingresses = calculator.calculateTransitIngresses(
                ['uranus'],
                new Date('2026-01-01T00:00:00Z'),
                new Date('2026-03-01T00:00:00Z')
            );
            expect(ingresses.filter(i => i.planet === 'uranus').length).toBeGreaterThanOrEqual(1);
        });
    });

    // ─── north_node / south_node ──────────────────────────────────────────────

    describe('north_node and south_node (always retrograde)', () => {
        it('north_node isRetrograde is always true', () => {
            const ingresses = calculator.calculateTransitIngresses(
                ['north_node'],
                new Date('2026-01-01T00:00:00Z'),
                new Date('2026-03-01T00:00:00Z')
            );
            for (const ing of ingresses.filter(i => i.planet === 'north_node')) {
                expect(ing.isRetrograde).toBe(true);
            }
        });

        it('south_node isRetrograde is always true', () => {
            const ingresses = calculator.calculateTransitIngresses(
                ['south_node'],
                new Date('2026-01-01T00:00:00Z'),
                new Date('2026-03-01T00:00:00Z')
            );
            for (const ing of ingresses.filter(i => i.planet === 'south_node')) {
                expect(ing.isRetrograde).toBe(true);
            }
        });
    });

    // ─── Result shape ─────────────────────────────────────────────────────────

    describe('WesternTransitIngress result shape', () => {
        it('every result has all required fields with correct types', () => {
            const ingresses = calculator.calculateTransitIngresses(
                ['sun', 'moon', 'mars'],
                new Date('2026-01-01T00:00:00Z'),
                new Date('2026-03-01T00:00:00Z')
            );

            for (const ing of ingresses) {
                expect(ing).toHaveProperty('planet');
                expect(ing).toHaveProperty('sign');
                expect(ing).toHaveProperty('fromSign');
                expect(ing).toHaveProperty('date');
                expect(ing).toHaveProperty('jd');
                expect(ing).toHaveProperty('isRetrograde');
                expect(ing).toHaveProperty('longitude');

                expect(typeof ing.planet).toBe('string');
                expect(typeof ing.sign).toBe('string');
                expect(typeof ing.fromSign).toBe('string');
                expect(ing.date).toBeInstanceOf(Date);
                expect(typeof ing.jd).toBe('number');
                expect(typeof ing.isRetrograde).toBe('boolean');
                expect(typeof ing.longitude).toBe('number');
                expect(ing.sign).not.toBe(ing.fromSign);
            }
        });
    });
});
