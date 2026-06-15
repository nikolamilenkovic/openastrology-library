import { VedicTransitCalculator } from '../../src';
import { VedicTransitIngress } from '../../src';

// ─── Mock sweph ──────────────────────────────────────────────────────────────
// Simulates a simple scenario:
//   - julday returns a base JD for startDate and a larger JD for endDate
//   - solcross_ut / mooncross_ut return a single crossing within the window,
//     then one beyond the window to terminate the loop
//   - calc_ut returns a fixed longitude in Aries (sign 0) then in Taurus (sign 1)

jest.mock('sweph', () => ({
        constants: {
            SE_SUN:      0,
            SE_MOON:     1,
            SE_MERCURY:  2,
            SE_VENUS:    3,
            SE_MARS:     4,
            SE_JUPITER:  5,
            SE_SATURN:   6,
            SE_TRUE_NODE: 11,
            SE_GREG_CAL: 1,
            SEFLG_SWIEPH:   2,
            SEFLG_SIDEREAL: 65536,
            SEFLG_SPEED:      256,
            SE_SIDM_LAHIRI:   1,
            SE_SIDM_RAMAN:    3,
            SE_SIDM_KRISHNAMURTI: 5,
            SE_SIDM_YUKTESHWAR:   7,
            SE_SIDM_JN_BHASIN:    8,
            SE_SIDM_BABYL_KUGLER1: 9,
            SE_SIDM_TRUE_CITRA:   27,
            SE_SIDM_TRUE_REVATI:  28,
            SE_SIDM_TRUE_PUSHYA:  29,
        },

        set_ephe_path: jest.fn(),
        set_sid_mode:  jest.fn(),
        close:         jest.fn(),

        // julday: startDate → JD 2460000, endDate → JD 2460060
        julday: jest.fn().mockImplementation(
            (y: number, m: number, d: number, h: number) =>
                y === 2026 && m === 1 && d === 1 ? 2460000 : 2460060
        ),

        revjul: jest.fn().mockReturnValue({ year: 2026, month: 2, day: 14, hour: 6.5 }),

        // solcross_ut: first call returns crossing at JD 2460010 (within window),
        //              second call returns crossing at JD 2460070 (past window) to stop loop
        solcross_ut: jest.fn().mockImplementation((_x: number, jd: number) => {
            const crossings = [2460010, 2460070];
            const idx = jd < 2460015 ? 0 : 1;
            return { date: crossings[idx], error: '' };
        }),

        // mooncross_ut: two crossings inside the window.
        // Threshold is based on jd passed in (the "search from" time).
        // After recording ingress at 2460002.5 we advance jd to 2460002.501,
        // so the threshold for the second call must be > 2460002.501.
        mooncross_ut: jest.fn().mockImplementation((_x: number, jd: number) => {
            // Call 1: jd ≈ 2460000  → first crossing at 2460002.5
            // Call 2: jd ≈ 2460002.501 → second crossing at 2460005.0
            // Call 3: jd ≈ 2460005.001 → past window (stop)
            if (jd <= 2460001)    return { date: 2460002.5, error: '' };
            if (jd <= 2460005)    return { date: 2460005.0, error: '' };
            return { date: 2460070, error: '' };
        }),

        // calc_ut: returns a longitude based on JD and planet
        //   - At JD 2460000 (start):          Sun at 25°  Aries (sign 0)
        //   - At JD 2460010 (Sun ingress):     Sun at 30.001° → Taurus (sign 1)
        //   - At JD 2460010.001 (after ingress): Sun at 30.1° Taurus
        //   - For bisection planets (Mars etc.): sign changes between JD 2460020 and JD 2460021
        calc_ut: jest.fn().mockImplementation((jd: number, planet: number) => {
            // Sun (0)
            if (planet === 0) {
                const lon = jd < 2460005 ? 25.0  // Aries
                          : jd < 2460015 ? 30.1  // Taurus (just entered)
                          : 60.5;                  // Gemini
                return { flag: 65538, error: '', data: [lon, 0, 1, 1.0, 0, 0] };
            }
            // Moon (1) — shouldn't be called for Moon (uses mooncross_ut)
            // Returns Aries before first crossing, Taurus after, Gemini after second.
            if (planet === 1) {
                const lon = jd < 2460002.5 ? 29.0   // late Aries (sign 0)
                          : jd < 2460005   ? 30.5   // Taurus (sign 1)
                          : 60.5;                    // Gemini (sign 2)
                return { flag: 65538, error: '', data: [lon, 0, 1, 13.0, 0, 0] };
            }
            // Mars (4) — sign crossing midway through the window.
            // Boundary at 2460019.5 (between steps 2460019 and 2460020) so that
            // the bisection mid values can cross the boundary and converge to Gemini.
            if (planet === 4) {
                const lon   = jd < 2460019.5 ? 55.0 : 60.5; // Taurus → Gemini
                const speed = 0.5; // direct
                return { flag: 65538, error: '', data: [lon, 0, 1, speed, 0, 0] };
            }
            // Rahu / SE_TRUE_NODE (11) — retrograde into previous sign around JD 2460030
            // Rahu at 62° (Gemini, sign 2) → moves back to 59.5° (Taurus, sign 1)
            // Ketu = rahu + 180: 242° (Sagittarius, sign 8) → 239.5° (Scorpio, sign 7)
            if (planet === 11) {
                const lon   = jd < 2460030 ? 62.0 : 59.5;
                const speed = -0.05; // always retrograde
                return { flag: 65538, error: '', data: [lon, 0, 1, speed, 0, 0] };
            }
            return { flag: 65538, error: '', data: [100.0, 0, 1, 0.5, 0, 0] };
        }),
}));

describe(VedicTransitCalculator.name, () => {
    let calculator: VedicTransitCalculator;

    beforeEach(() => {
        calculator = new VedicTransitCalculator({ ayanamsa: 'lahiri' });
        jest.clearAllMocks();
    });

    afterEach(() => {
        calculator.dispose();
    });

    // ─── Constructor ─────────────────────────────────────────────────────────

    describe('constructor', () => {
        it('creates an instance with default options', () => {
            expect(() => new VedicTransitCalculator()).not.toThrow();
        });

        it('accepts custom ayanamsa and ephePath', () => {
            expect(() => new VedicTransitCalculator({ ayanamsa: 'raman', ephePath: '/tmp' })).not.toThrow();
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

    // ─── calculateTransitIngresses – setup calls ──────────────────────────────

    describe('calculateTransitIngresses – infrastructure', () => {
        it('calls set_ephe_path and set_sid_mode before calculations', () => {
            const { set_ephe_path, set_sid_mode } = require('sweph');
            calculator.calculateTransitIngresses(
                ['sun'],
                new Date('2026-01-01T00:00:00Z'),
                new Date('2026-03-01T00:00:00Z')
            );
            expect(set_ephe_path).toHaveBeenCalledTimes(1);
            expect(set_sid_mode).toHaveBeenCalledTimes(1);
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
    });

    // ─── Sun (solcross_ut path) ───────────────────────────────────────────────

    describe('Sun ingresses (solcross_ut)', () => {
        it('uses solcross_ut instead of calc_ut for the Sun', () => {
            const { solcross_ut, calc_ut } = require('sweph');
            calculator.calculateTransitIngresses(
                ['sun'],
                new Date('2026-01-01T00:00:00Z'),
                new Date('2026-03-01T00:00:00Z')
            );
            expect(solcross_ut).toHaveBeenCalled();
        });

        it('records one Sun ingress within the mock window', () => {
            const ingresses = calculator.calculateTransitIngresses(
                ['sun'],
                new Date('2026-01-01T00:00:00Z'),
                new Date('2026-03-01T00:00:00Z')
            );

            const sunIngresses = ingresses.filter(i => i.planet === 'sun');
            expect(sunIngresses).toHaveLength(1);
        });

        it('Sun ingress has isRetrograde = false', () => {
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
            expect(sun).toMatchObject<Partial<VedicTransitIngress>>({
                planet:      'sun',
                isRetrograde: false,
            });
            expect(sun.sign).not.toBe(sun.fromSign);
            expect(typeof sun.jd).toBe('number');
            expect(sun.date).toBeInstanceOf(Date);
            expect(typeof sun.longitude).toBe('number');
        });
    });

    // ─── Moon (mooncross_ut path) ─────────────────────────────────────────────

    describe('Moon ingresses (mooncross_ut)', () => {
        it('uses mooncross_ut instead of calc_ut for the Moon', () => {
            const { mooncross_ut } = require('sweph');
            calculator.calculateTransitIngresses(
                ['moon'],
                new Date('2026-01-01T00:00:00Z'),
                new Date('2026-03-01T00:00:00Z')
            );
            expect(mooncross_ut).toHaveBeenCalled();
        });

        it('records multiple Moon ingresses within the mock window', () => {
            const ingresses = calculator.calculateTransitIngresses(
                ['moon'],
                new Date('2026-01-01T00:00:00Z'),
                new Date('2026-03-01T00:00:00Z')
            );
            const moonIngresses = ingresses.filter(i => i.planet === 'moon');
            expect(moonIngresses.length).toBeGreaterThanOrEqual(1);
        });

        it('Moon ingress has isRetrograde = false', () => {
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

    describe('Mars ingresses (bisection path)', () => {
        it('uses calc_ut for Mars', () => {
            const { calc_ut } = require('sweph');
            calculator.calculateTransitIngresses(
                ['mars'],
                new Date('2026-01-01T00:00:00Z'),
                new Date('2026-03-01T00:00:00Z')
            );
            expect(calc_ut).toHaveBeenCalled();
        });

        it('records a Mars ingress and reports isRetrograde correctly (speed > 0 → false)', () => {
            const ingresses = calculator.calculateTransitIngresses(
                ['mars'],
                new Date('2026-01-01T00:00:00Z'),
                new Date('2026-03-01T00:00:00Z')
            );
            const marsIngresses = ingresses.filter(i => i.planet === 'mars');
            expect(marsIngresses.length).toBeGreaterThanOrEqual(1);
            // Mock speed = 0.5 (direct) → not retrograde
            expect(marsIngresses[0].isRetrograde).toBe(false);
        });
    });

    // ─── Rahu (always retrograde) ─────────────────────────────────────────────

    describe('Rahu ingresses', () => {
        it('Rahu isRetrograde is always true regardless of computed speed', () => {
            const ingresses = calculator.calculateTransitIngresses(
                ['rahu'],
                new Date('2026-01-01T00:00:00Z'),
                new Date('2026-03-01T00:00:00Z')
            );
            for (const ing of ingresses.filter(i => i.planet === 'rahu')) {
                expect(ing.isRetrograde).toBe(true);
            }
        });
    });

    // ─── Ketu ─────────────────────────────────────────────────────────────────

    describe('Ketu ingresses', () => {
        it('Ketu isRetrograde is always true', () => {
            const ingresses = calculator.calculateTransitIngresses(
                ['ketu'],
                new Date('2026-01-01T00:00:00Z'),
                new Date('2026-03-01T00:00:00Z')
            );
            for (const ing of ingresses.filter(i => i.planet === 'ketu')) {
                expect(ing.isRetrograde).toBe(true);
            }
        });
    });

    // ─── Result shape ─────────────────────────────────────────────────────────

    describe('TransitIngress result shape', () => {
        it('every result has all required fields', () => {
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
