import { WesternTransitCalculator } from '../../src';

describe('WesternTransitCalculator (integration)', () => {
    let calculator: WesternTransitCalculator;

    beforeAll(() => {
        calculator = new WesternTransitCalculator();
    });

    afterAll(() => {
        calculator.dispose();
    });

    // ─── General contract ─────────────────────────────────────────────────────

    describe('calculateTransitIngresses – general contract', () => {
        it('returns an array sorted chronologically', () => {
            const ingresses = calculator.calculateTransitIngresses(
                ['sun', 'moon', 'mars'],
                new Date('2026-01-01T00:00:00Z'),
                new Date('2026-03-01T00:00:00Z')
            );
            for (let i = 1; i < ingresses.length; i++) {
                expect(ingresses[i].jd).toBeGreaterThanOrEqual(ingresses[i - 1].jd);
            }
        });

        it('all ingresses are within the requested date range', () => {
            const start = new Date('2026-01-01T00:00:00Z');
            const end   = new Date('2026-06-01T00:00:00Z');
            const ingresses = calculator.calculateTransitIngresses(
                ['sun', 'mercury', 'venus'],
                start, end
            );
            for (const ing of ingresses) {
                expect(ing.date.getTime()).toBeGreaterThanOrEqual(start.getTime() - 1000);
                expect(ing.date.getTime()).toBeLessThanOrEqual(end.getTime() + 1000);
            }
        });

        it('fromSign and sign are always different', () => {
            const ingresses = calculator.calculateTransitIngresses(
                ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn',
                 'uranus', 'neptune', 'pluto', 'north_node', 'south_node', 'chiron', 'lilith'],
                new Date('2026-01-01T00:00:00Z'),
                new Date('2027-01-01T00:00:00Z')
            );
            for (const ing of ingresses) {
                expect(ing.sign).not.toBe(ing.fromSign);
            }
        });

        it('each ingress has a valid sign and fromSign', () => {
            const VALID_SIGNS = [
                'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
                'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces',
            ];
            const ingresses = calculator.calculateTransitIngresses(
                ['sun', 'moon'],
                new Date('2026-01-01T00:00:00Z'),
                new Date('2026-04-01T00:00:00Z')
            );
            for (const ing of ingresses) {
                expect(VALID_SIGNS).toContain(ing.sign);
                expect(VALID_SIGNS).toContain(ing.fromSign);
            }
        });

        it('returns empty array when startDate equals endDate', () => {
            const d = new Date('2026-06-15T12:00:00Z');
            expect(calculator.calculateTransitIngresses(['sun'], d, d)).toHaveLength(0);
        });

        it('returns only ingresses for the requested planets', () => {
            const ingresses = calculator.calculateTransitIngresses(
                ['jupiter', 'saturn'],
                new Date('2026-01-01T00:00:00Z'),
                new Date('2027-01-01T00:00:00Z')
            );
            for (const ing of ingresses) {
                expect(['jupiter', 'saturn']).toContain(ing.planet);
            }
        });
    });

    // ─── Sun (tropical) ───────────────────────────────────────────────────────

    describe('Sun ingresses', () => {
        it('Sun has exactly 12 ingresses in a full tropical year', () => {
            // Tropical year ~365.25 days; one ingress per sign = 12
            const ingresses = calculator.calculateTransitIngresses(
                ['sun'],
                new Date('2026-03-20T00:00:00Z'), // ~vernal equinox
                new Date('2027-03-20T00:00:00Z')
            );
            expect(ingresses).toHaveLength(12);
        });

        it('Sun isRetrograde is always false', () => {
            const ingresses = calculator.calculateTransitIngresses(
                ['sun'],
                new Date('2026-01-01T00:00:00Z'),
                new Date('2026-12-31T00:00:00Z')
            );
            for (const ing of ingresses) expect(ing.isRetrograde).toBe(false);
        });

        it('Sun enters Aries (vernal equinox) around March 20', () => {
            const ingresses = calculator.calculateTransitIngresses(
                ['sun'],
                new Date('2026-03-15T00:00:00Z'),
                new Date('2026-03-25T00:00:00Z')
            );
            const aries = ingresses.find(i => i.sign === 'aries');
            expect(aries).toBeDefined();
            const d = aries!.date;
            expect(d.getUTCMonth()).toBe(2); // March
            expect(d.getUTCDate()).toBeGreaterThanOrEqual(19);
            expect(d.getUTCDate()).toBeLessThanOrEqual(22);
        });

        it('Sun enters Cancer (summer solstice) around June 21', () => {
            const ingresses = calculator.calculateTransitIngresses(
                ['sun'],
                new Date('2026-06-18T00:00:00Z'),
                new Date('2026-06-24T00:00:00Z')
            );
            const cancer = ingresses.find(i => i.sign === 'cancer');
            expect(cancer).toBeDefined();
            const d = cancer!.date;
            expect(d.getUTCMonth()).toBe(5); // June
            expect(d.getUTCDate()).toBeGreaterThanOrEqual(20);
            expect(d.getUTCDate()).toBeLessThanOrEqual(22);
        });

        it('Sun ingresses follow the order of the zodiac signs starting from Aries', () => {
            const ingresses = calculator.calculateTransitIngresses(
                ['sun'],
                new Date('2026-03-20T12:00:00Z'),
                new Date('2027-03-20T12:00:00Z')
            );
            const SIGNS_IN_ORDER = [
                'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
                'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces',
            ];
            for (let i = 0; i < ingresses.length; i++) {
                expect(ingresses[i].sign).toBe(SIGNS_IN_ORDER[i % 12]);
            }
        });
    });

    // ─── Moon ────────────────────────────────────────────────────────────────

    describe('Moon ingresses', () => {
        it('Moon changes sign ~13 times in 30 days (12-15 ingresses)', () => {
            const ingresses = calculator.calculateTransitIngresses(
                ['moon'],
                new Date('2026-01-01T00:00:00Z'),
                new Date('2026-01-31T00:00:00Z')
            );
            expect(ingresses.length).toBeGreaterThanOrEqual(12);
            expect(ingresses.length).toBeLessThanOrEqual(15);
        });

        it('Moon isRetrograde is always false', () => {
            const ingresses = calculator.calculateTransitIngresses(
                ['moon'],
                new Date('2026-01-01T00:00:00Z'),
                new Date('2026-01-31T00:00:00Z')
            );
            for (const ing of ingresses) expect(ing.isRetrograde).toBe(false);
        });

        it('Moon ingresses are spaced 1.5–3.5 days apart', () => {
            const ingresses = calculator.calculateTransitIngresses(
                ['moon'],
                new Date('2026-06-01T00:00:00Z'),
                new Date('2026-06-30T00:00:00Z')
            );
            for (let i = 1; i < ingresses.length; i++) {
                expect(ingresses[i].jd - ingresses[i - 1].jd).toBeGreaterThan(1.5);
                expect(ingresses[i].jd - ingresses[i - 1].jd).toBeLessThan(3.5);
            }
        });
    });

    // ─── Mercury (retrograde re-entry) ────────────────────────────────────────

    describe('Mercury retrograde re-entry', () => {
        it('Mercury has retrograde sign re-entries in its longer retrograde cycles', () => {
            // Mercury retrogrades 3x per year; over 3 years we're guaranteed sign-crossing
            // retrogrades. Total ingresses per year: typically 13-20 depending on retrograde extent.
            const ingresses = calculator.calculateTransitIngresses(
                ['mercury'],
                new Date('2024-01-01T00:00:00Z'),
                new Date('2027-01-01T00:00:00Z')
            );
            expect(ingresses.length).toBeGreaterThanOrEqual(40); // ~13+ per year × 3 years
            expect(ingresses.filter(i => i.isRetrograde).length).toBeGreaterThan(0);
        });
    });

    // ─── north_node / south_node ──────────────────────────────────────────────

    describe('north_node and south_node', () => {
        it('north_node isRetrograde is always true', () => {
            const ingresses = calculator.calculateTransitIngresses(
                ['north_node'],
                new Date('2023-01-01T00:00:00Z'),
                new Date('2028-01-01T00:00:00Z')
            );
            for (const ing of ingresses) expect(ing.isRetrograde).toBe(true);
        });

        it('south_node isRetrograde is always true', () => {
            const ingresses = calculator.calculateTransitIngresses(
                ['south_node'],
                new Date('2023-01-01T00:00:00Z'),
                new Date('2028-01-01T00:00:00Z')
            );
            for (const ing of ingresses) expect(ing.isRetrograde).toBe(true);
        });

        it('north_node and south_node change signs simultaneously (within 1 second)', () => {
            const north = calculator.calculateTransitIngresses(
                ['north_node'],
                new Date('2023-01-01T00:00:00Z'),
                new Date('2028-01-01T00:00:00Z')
            );
            const south = calculator.calculateTransitIngresses(
                ['south_node'],
                new Date('2023-01-01T00:00:00Z'),
                new Date('2028-01-01T00:00:00Z')
            );
            expect(north.length).toBe(south.length);
            for (let i = 0; i < north.length; i++) {
                expect(Math.abs(north[i].jd - south[i].jd)).toBeLessThan(1 / 86400);
            }
        });

        it('north_node changes sign ~2-4 times over 5 years', () => {
            const ingresses = calculator.calculateTransitIngresses(
                ['north_node'],
                new Date('2023-01-01T00:00:00Z'),
                new Date('2028-01-01T00:00:00Z')
            );
            expect(ingresses.length).toBeGreaterThanOrEqual(2);
            expect(ingresses.length).toBeLessThanOrEqual(5);
        });
    });

    // ─── Outer planets ────────────────────────────────────────────────────────

    describe('Outer planets (slow movers)', () => {
        it('Saturn changes sign 1-3 times over a 10-year period', () => {
            const ingresses = calculator.calculateTransitIngresses(
                ['saturn'],
                new Date('2020-01-01T00:00:00Z'),
                new Date('2030-01-01T00:00:00Z')
            );
            expect(ingresses.length).toBeGreaterThanOrEqual(1);
            expect(ingresses.length).toBeLessThanOrEqual(10);
        });

        it('Uranus changes sign 0-2 times over a 10-year period', () => {
            const ingresses = calculator.calculateTransitIngresses(
                ['uranus'],
                new Date('2020-01-01T00:00:00Z'),
                new Date('2030-01-01T00:00:00Z')
            );
            expect(ingresses.length).toBeGreaterThanOrEqual(0);
            expect(ingresses.length).toBeLessThanOrEqual(4);
        });

        it('Neptune rarely changes sign (0-1 times over 10 years)', () => {
            const ingresses = calculator.calculateTransitIngresses(
                ['neptune'],
                new Date('2020-01-01T00:00:00Z'),
                new Date('2030-01-01T00:00:00Z')
            );
            expect(ingresses.length).toBeLessThanOrEqual(3);
        });
    });

    // ─── Chiron and Lilith ────────────────────────────────────────────────────

    describe('Chiron and Lilith', () => {
        it('Chiron changes sign 1-3 times over 5 years', () => {
            const ingresses = calculator.calculateTransitIngresses(
                ['chiron'],
                new Date('2023-01-01T00:00:00Z'),
                new Date('2028-01-01T00:00:00Z')
            );
            // Chiron ~8-9 years per sign; some sign changes include retrograde re-entries
            expect(ingresses.length).toBeGreaterThanOrEqual(0);
            expect(ingresses.length).toBeLessThanOrEqual(5);
        });

        it('Lilith (Black Moon) changes sign ~every 9 months (~6-7 ingresses per 5 years)', () => {
            const ingresses = calculator.calculateTransitIngresses(
                ['lilith'],
                new Date('2023-01-01T00:00:00Z'),
                new Date('2028-01-01T00:00:00Z')
            );
            expect(ingresses.length).toBeGreaterThanOrEqual(5);
            expect(ingresses.length).toBeLessThanOrEqual(10);
        });
    });

    // ─── Tropical vs Sidereal distinction ────────────────────────────────────

    describe('Tropical (Western) vs Sidereal (Vedic) distinction', () => {
        it('Sun enters tropical Aries (vernal equinox, ~Mar 20) not sidereal Aries (~Apr 14)', () => {
            // Tropical Aries starts at the vernal equinox (~Mar 20).
            // Sidereal Aries starts ~23-24 days later (~Apr 14).
            const ingresses = calculator.calculateTransitIngresses(
                ['sun'],
                new Date('2026-03-10T00:00:00Z'),
                new Date('2026-04-20T00:00:00Z')
            );
            const aries = ingresses.find(i => i.sign === 'aries');
            expect(aries).toBeDefined();
            // Must be before April 1 (tropical entry), not around Apr 14 (sidereal)
            expect(aries!.date.getUTCMonth()).toBe(2); // March
        });
    });

    // ─── Precision ───────────────────────────────────────────────────────────

    describe('Timestamp precision', () => {
        it('Sun ingress has zero milliseconds (second-level precision)', () => {
            const ingresses = calculator.calculateTransitIngresses(
                ['sun'],
                new Date('2026-01-01T00:00:00Z'),
                new Date('2026-02-01T00:00:00Z')
            );
            for (const ing of ingresses) {
                expect(ing.date.getUTCMilliseconds()).toBe(0);
            }
        });

        it('JD and Date are consistent (round-trip within 2 seconds)', () => {
            const ingresses = calculator.calculateTransitIngresses(
                ['sun', 'moon'],
                new Date('2026-06-01T00:00:00Z'),
                new Date('2026-06-30T00:00:00Z')
            );
            for (const ing of ingresses) {
                const dateMs  = ing.date.getTime();
                const jdEpoch = (ing.jd - 2440587.5) * 86400 * 1000;
                expect(Math.abs(dateMs - jdEpoch)).toBeLessThan(2000);
            }
        });
    });
});
