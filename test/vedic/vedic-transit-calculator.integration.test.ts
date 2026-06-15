import { VedicTransitCalculator } from '../../src';

describe('VedicTransitCalculator (integration)', () => {
    let calculator: VedicTransitCalculator;

    beforeAll(() => {
        calculator = new VedicTransitCalculator({ ayanamsa: 'lahiri' });
    });

    afterAll(() => {
        calculator.dispose();
    });

    // ─── Contract tests (all planets) ────────────────────────────────────────

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

        it('returns all ingresses within the requested date range', () => {
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
                ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'rahu', 'ketu'],
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

        it('longitude is within the entered sign (0-30° within that sign)', () => {
            const ingresses = calculator.calculateTransitIngresses(
                ['sun', 'mars', 'jupiter'],
                new Date('2026-01-01T00:00:00Z'),
                new Date('2026-06-01T00:00:00Z')
            );

            const SIGN_START: Record<string, number> = {
                aries: 0, taurus: 30, gemini: 60, cancer: 90,
                leo: 120, virgo: 150, libra: 180, scorpio: 210,
                sagittarius: 240, capricorn: 270, aquarius: 300, pisces: 330,
            };

            for (const ing of ingresses) {
                const signStart = SIGN_START[ing.sign];
                const degInSign = ((ing.longitude - signStart + 360) % 360);
                // At ingress the planet is at the sign boundary — either just past the
                // start of the new sign (direct ingress, degInSign ≈ 0) or just before
                // the end (a retrograde ingress entering from the high side, degInSign ≈ 30).
                const nearStart = degInSign < 1;
                const nearEnd   = degInSign > 29;
                expect(nearStart || nearEnd).toBe(true);
            }
        });

        it('returns empty array when startDate equals endDate', () => {
            const d = new Date('2026-06-15T12:00:00Z');
            const ingresses = calculator.calculateTransitIngresses(['sun'], d, d);
            expect(ingresses).toHaveLength(0);
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

    // ─── Sun ─────────────────────────────────────────────────────────────────

    describe('Sun ingresses', () => {
        it('Sun has exactly 12 ingresses in a full sidereal year', () => {
            const ingresses = calculator.calculateTransitIngresses(
                ['sun'],
                new Date('2026-01-01T00:00:00Z'),
                new Date('2027-01-01T00:00:00Z')
            );
            expect(ingresses).toHaveLength(12);
        });

        it('Sun isRetrograde is always false', () => {
            const ingresses = calculator.calculateTransitIngresses(
                ['sun'],
                new Date('2026-01-01T00:00:00Z'),
                new Date('2027-01-01T00:00:00Z')
            );
            for (const ing of ingresses) {
                expect(ing.isRetrograde).toBe(false);
            }
        });

        it('Sun enters Capricorn (Makar) in mid-January (Makar Sankranti)', () => {
            // In Vedic astrology, Makar Sankranti occurs when the Sun enters
            // Capricorn (sidereal) — traditionally around Jan 14.
            const ingresses = calculator.calculateTransitIngresses(
                ['sun'],
                new Date('2026-01-10T00:00:00Z'),
                new Date('2026-01-20T00:00:00Z')
            );

            const makar = ingresses.find(i => i.sign === 'capricorn');
            expect(makar).toBeDefined();
            // Makar Sankranti falls between Jan 13 and Jan 16
            const d = makar!.date;
            expect(d.getUTCMonth()).toBe(0); // January
            expect(d.getUTCDate()).toBeGreaterThanOrEqual(13);
            expect(d.getUTCDate()).toBeLessThanOrEqual(16);
        });

        it('Sun ingresses follow the order of the zodiac signs', () => {
            const ingresses = calculator.calculateTransitIngresses(
                ['sun'],
                new Date('2026-04-14T00:00:00Z'), // just before Vedic new year
                new Date('2027-04-14T00:00:00Z')
            );

            const SIGNS_IN_ORDER = [
                'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
                'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces',
            ];

            for (let i = 0; i < ingresses.length; i++) {
                const expectedSign = SIGNS_IN_ORDER[i % 12];
                expect(ingresses[i].sign).toBe(expectedSign);
            }
        });
    });

    // ─── Moon ────────────────────────────────────────────────────────────────

    describe('Moon ingresses', () => {
        it('Moon changes sign roughly every 2.25 days (13-15 ingresses in 30 days)', () => {
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
            for (const ing of ingresses) {
                expect(ing.isRetrograde).toBe(false);
            }
        });

        it('Moon ingresses are spaced 1.5–3.5 days apart', () => {
            const ingresses = calculator.calculateTransitIngresses(
                ['moon'],
                new Date('2026-06-01T00:00:00Z'),
                new Date('2026-06-30T00:00:00Z')
            );

            for (let i = 1; i < ingresses.length; i++) {
                const daysBetween = (ingresses[i].jd - ingresses[i - 1].jd);
                expect(daysBetween).toBeGreaterThan(1.5);
                expect(daysBetween).toBeLessThan(3.5);
            }
        });
    });

    // ─── Rahu and Ketu ───────────────────────────────────────────────────────

    describe('Rahu and Ketu ingresses', () => {
        it('Rahu isRetrograde is always true', () => {
            const ingresses = calculator.calculateTransitIngresses(
                ['rahu'],
                new Date('2023-01-01T00:00:00Z'),
                new Date('2028-01-01T00:00:00Z')
            );
            for (const ing of ingresses) {
                expect(ing.isRetrograde).toBe(true);
            }
        });

        it('Ketu isRetrograde is always true', () => {
            const ingresses = calculator.calculateTransitIngresses(
                ['ketu'],
                new Date('2023-01-01T00:00:00Z'),
                new Date('2028-01-01T00:00:00Z')
            );
            for (const ing of ingresses) {
                expect(ing.isRetrograde).toBe(true);
            }
        });

        it('Rahu and Ketu change signs simultaneously (within 1 second)', () => {
            // Since Ketu = Rahu + 180°, their sign ingresses always happen at the
            // same moment. The two entries should have JD values within 1 second.
            const rahuIngresses = calculator.calculateTransitIngresses(
                ['rahu'],
                new Date('2023-01-01T00:00:00Z'),
                new Date('2028-01-01T00:00:00Z')
            );
            const ketuIngresses = calculator.calculateTransitIngresses(
                ['ketu'],
                new Date('2023-01-01T00:00:00Z'),
                new Date('2028-01-01T00:00:00Z')
            );

            expect(rahuIngresses).toHaveLength(ketuIngresses.length);

            for (let i = 0; i < rahuIngresses.length; i++) {
                const jdDiff = Math.abs(rahuIngresses[i].jd - ketuIngresses[i].jd);
                expect(jdDiff).toBeLessThan(1 / 86400); // < 1 second
            }
        });

        it('Rahu changes sign approximately every 18 months (2-3 changes per 5 years)', () => {
            const ingresses = calculator.calculateTransitIngresses(
                ['rahu'],
                new Date('2023-01-01T00:00:00Z'),
                new Date('2028-01-01T00:00:00Z')
            );
            // 5 years / ~1.5 years per sign = ~3-4 ingresses
            expect(ingresses.length).toBeGreaterThanOrEqual(2);
            expect(ingresses.length).toBeLessThanOrEqual(5);
        });
    });

    // ─── Mercury retrograde re-entry ─────────────────────────────────────────

    describe('Mercury retrograde re-entry', () => {
        it('Mercury can enter the same sign twice (retrograde + direct) within a few months', () => {
            // Mercury retrogrades 3x per year; each retrograde loop often causes it
            // to cross back into the previous sign and then re-enter the original.
            // Over 3 months we expect to see >3 ingresses for Mercury.
            const ingresses = calculator.calculateTransitIngresses(
                ['mercury'],
                new Date('2026-01-01T00:00:00Z'),
                new Date('2026-12-31T00:00:00Z')
            );

            // Mercury should have many more ingresses than 12 in a year because
            // of retrograde re-entries (typically 18-22 per year)
            expect(ingresses.length).toBeGreaterThanOrEqual(14);

            // At least some retrograde ingresses should appear
            const retrogrades = ingresses.filter(i => i.isRetrograde);
            expect(retrogrades.length).toBeGreaterThan(0);
        });
    });

    // ─── Precision ───────────────────────────────────────────────────────────

    describe('Timestamp precision', () => {
        it('Sun ingress is precise to the second (zero ms in the returned date)', () => {
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
                const jdEpoch = (ing.jd - 2440587.5) * 86400 * 1000; // JD to ms since Unix epoch
                expect(Math.abs(dateMs - jdEpoch)).toBeLessThan(2000); // within 2 seconds
            }
        });
    });
});
