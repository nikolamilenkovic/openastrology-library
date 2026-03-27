import { BirthInfo, VedicChartCalculations, DivisionalChartCalculator } from '../../src';
import { FormattingUtils } from '../../src';
import { VedicAstrologyCalculator } from '../../src';

const D = 'D45';

describe(DivisionalChartCalculator.name, () => {
    let rashiChartCalculator: VedicAstrologyCalculator;
    let mockBirthInfo: BirthInfo;
    let rashiChart: VedicChartCalculations;

    const dms2def = FormattingUtils.formattedDMStoDegrees;

    beforeAll(() => {
        rashiChartCalculator = new VedicAstrologyCalculator();
    });

    describe(D + ' calculations for test person 1', () => {
        beforeEach(async () => {
            mockBirthInfo = {
                name: 'Test Person',
                dateOfBirth: '1990-06-15',
                timeOfBirth: '13:00',
                latitude: 40,
                longitude: -74,
                timezone: 'America/New_York'
            };
            rashiChart = await rashiChartCalculator.calculateChart(mockBirthInfo);
        });

        it('should calculate ' + D + ' planet signs successfully', () => {
            const result = DivisionalChartCalculator.calculateDivisionalChart(rashiChart, D);

            expect(result.ascendant.sign).toBe('pisces');
            expect(result.planets.sun.sign).toBe('sagittarius');
            expect(result.planets.moon.sign).toBe('leo');
            expect(result.planets.mars.sign).toBe('aquarius');
            expect(result.planets.mercury.sign).toBe('aquarius');
            expect(result.planets.jupiter.sign).toBe('virgo');
            expect(result.planets.venus.sign).toBe('taurus');
            expect(result.planets.saturn.sign).toBe('aries');
            expect(result.planets.rahu.sign).toBe('capricorn');
            expect(result.planets.ketu.sign).toBe('capricorn');
        });

        it('should calculate ' + D + ' ascendant degree correctly', () => {
            const result = DivisionalChartCalculator.calculateDivisionalChart(rashiChart, D);

            expect(result.ascendant.degree).toBeWithinEpsilon(dms2def('02:17:37'), 0.16);
        });

        it('should calculate ' + D + ' planet degrees correctly', () => {
            const result = DivisionalChartCalculator.calculateDivisionalChart(rashiChart, D);

            expect(result.planets.sun.degree).toBeWithinEpsilon(dms2def('27:03:26'), 0.1);
            expect(result.planets.moon.degree).toBeWithinEpsilon(dms2def('19:00:10'), 0.41);
            expect(result.planets.mars.degree).toBeWithinEpsilon(dms2def('05:52:16'), 0.1);
            expect(result.planets.mercury.degree).toBeWithinEpsilon(dms2def('14:29:11'), 0.1);
            expect(result.planets.jupiter.degree).toBeWithinEpsilon(dms2def('09:19:54'), 0.1);
            expect(result.planets.venus.degree).toBeWithinEpsilon(dms2def('28:17:54'), 0.1);
            expect(result.planets.saturn.degree).toBeWithinEpsilon(dms2def('13:09:34'), 0.1);
            expect(result.planets.rahu.degree).toBeWithinEpsilon(dms2def('17:51:56'), 0.1);
            expect(result.planets.ketu.degree).toBeWithinEpsilon(dms2def('17:51:56'), 0.1);
        });

        it('should calculate ' + D + ' retrograde planets correctly', () => {
            const result = DivisionalChartCalculator.calculateDivisionalChart(rashiChart, D);

            expect(result.planets.mercury.isRetrograde).toBe(false);
            expect(result.planets.venus.isRetrograde).toBe(false);
            expect(result.planets.mars.isRetrograde).toBe(false);
            expect(result.planets.jupiter.isRetrograde).toBe(false);
            expect(result.planets.saturn.isRetrograde).toBe(true);
            expect(result.planets.rahu.isRetrograde).toBe(true);
            expect(result.planets.ketu.isRetrograde).toBe(true);
            expect(result.planets.sun.isRetrograde).toBe(false);
            expect(result.planets.moon.isRetrograde).toBe(false);
        });

        it('should calculate ' + D + ' nakshatras and padas correctly', () => {
            const result = DivisionalChartCalculator.calculateDivisionalChart(rashiChart, D);

            // Check ascendant nakshatra and pada
            expect(result.ascendant.nakshatra).toBe('purva_bhadrapada');
            expect(result.ascendant.nakshatraPada).toBe(4);

            // Check planets nakshatras and padas
            expect(result.planets.sun.nakshatra).toBe('uttara_ashadha');
            expect(result.planets.sun.nakshatraPada).toBe(1);
            expect(result.planets.moon.nakshatra).toBe('purva_phalguni');
            expect(result.planets.moon.nakshatraPada).toBe(2);
            expect(result.planets.mars.nakshatra).toBe('dhanishta');
            expect(result.planets.mars.nakshatraPada).toBe(4);
            expect(result.planets.mercury.nakshatra).toBe('shatabhisha');
            expect(result.planets.mercury.nakshatraPada).toBe(3);
            expect(result.planets.jupiter.nakshatra).toBe('uttara_phalguni');
            expect(result.planets.jupiter.nakshatraPada).toBe(4);
            expect(result.planets.venus.nakshatra).toBe('mrigashira');
            expect(result.planets.venus.nakshatraPada).toBe(2);
            expect(result.planets.saturn.nakshatra).toBe('ashwini');
            expect(result.planets.saturn.nakshatraPada).toBe(4);
            expect(result.planets.rahu.nakshatra).toBe('shravana');
            expect(result.planets.rahu.nakshatraPada).toBe(3);
            expect(result.planets.ketu.nakshatra).toBe('shravana');
            expect(result.planets.ketu.nakshatraPada).toBe(3);
        });

        it('should assign planets to correct houses in ' + D + ' chart', () => {
            const result = DivisionalChartCalculator.calculateDivisionalChart(rashiChart, D);

            expect(result.planets.sun.house).toBe(10);
            expect(result.planets.moon.house).toBe(6);
            expect(result.planets.mars.house).toBe(12);
            expect(result.planets.mercury.house).toBe(12);
            expect(result.planets.jupiter.house).toBe(7);
            expect(result.planets.venus.house).toBe(3);
            expect(result.planets.saturn.house).toBe(2);
            expect(result.planets.rahu.house).toBe(11);
            expect(result.planets.ketu.house).toBe(11);
        });
    });
});
