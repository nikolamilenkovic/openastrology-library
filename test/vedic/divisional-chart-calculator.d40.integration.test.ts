import { BirthInfo, VedicChartCalculations, DivisionalChartCalculator } from '../../src';
import { FormattingUtils } from '../../src';
import { VedicAstrologyCalculator } from '../../src';

const D = 'D40';

describe(DivisionalChartCalculator.name, () => {
    let chartCalculator: VedicAstrologyCalculator;
    let mockBirthInfo: BirthInfo;
    let rashiChart: VedicChartCalculations;

    const dms2def = FormattingUtils.formattedDMStoDegrees;

    beforeAll(() => {
        chartCalculator = new VedicAstrologyCalculator();
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
            rashiChart = await chartCalculator.calculateChart(mockBirthInfo);
        });

        it('should calculate ' + D + ' planet signs successfully', () => {
            const result = chartCalculator.calculateDivisionalChart(rashiChart, D);

            expect(result.ascendant.sign).toBe('sagittarius');
            expect(result.planets.sun.sign).toBe('aries');
            expect(result.planets.moon.sign).toBe('sagittarius');
            expect(result.planets.mars.sign).toBe('virgo');
            expect(result.planets.mercury.sign).toBe('aquarius');
            expect(result.planets.jupiter.sign).toBe('virgo');
            expect(result.planets.venus.sign).toBe('capricorn');
            expect(result.planets.saturn.sign).toBe('libra');
            expect(result.planets.rahu.sign).toBe('taurus');
            expect(result.planets.ketu.sign).toBe('taurus');
        });

        it('should calculate ' + D + ' ascendant degree correctly', () => {
            const result = chartCalculator.calculateDivisionalChart(rashiChart, D);

            expect(result.ascendant.degree).toBeWithinEpsilon(dms2def('22:02:20'), 0.15);
        });

        it('should calculate ' + D + ' planet degrees correctly', () => {
            const result = chartCalculator.calculateDivisionalChart(rashiChart, D);

            expect(result.planets.sun.degree).toBeWithinEpsilon(dms2def('24:03:03'), 0.1);
            expect(result.planets.moon.degree).toBeWithinEpsilon(dms2def('16:53:28'), 0.36);
            expect(result.planets.mars.degree).toBeWithinEpsilon(dms2def('08:33:07'), 0.1);
            expect(result.planets.mercury.degree).toBeWithinEpsilon(dms2def('12:52:36'), 0.1);
            expect(result.planets.jupiter.degree).toBeWithinEpsilon(dms2def('18:17:41'), 0.1);
            expect(result.planets.venus.degree).toBeWithinEpsilon(dms2def('21:48:51'), 0.1);
            expect(result.planets.saturn.degree).toBeWithinEpsilon(dms2def('11:41:50'), 0.1);
            expect(result.planets.rahu.degree).toBeWithinEpsilon(dms2def('05:52:49'), 0.1);
            expect(result.planets.ketu.degree).toBeWithinEpsilon(dms2def('05:52:49'), 0.1);
        });

        it('should calculate ' + D + ' retrograde planets correctly', () => {
            const result = chartCalculator.calculateDivisionalChart(rashiChart, D);

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
            const result = chartCalculator.calculateDivisionalChart(rashiChart, D);

            // Check ascendant nakshatra and pada
            expect(result.ascendant.nakshatra).toBe('purva_ashadha');
            expect(result.ascendant.nakshatraPada).toBe(3);

            // Check planets nakshatras and padas
            expect(result.planets.sun.nakshatra).toBe('bharani');
            expect(result.planets.sun.nakshatraPada).toBe(4);
            expect(result.planets.moon.nakshatra).toBe('purva_ashadha');
            expect(result.planets.moon.nakshatraPada).toBe(1); // Different compared to vedic software, need to verify
            expect(result.planets.mars.nakshatra).toBe('uttara_phalguni');
            expect(result.planets.mars.nakshatraPada).toBe(4);
            expect(result.planets.mercury.nakshatra).toBe('shatabhisha');
            expect(result.planets.mercury.nakshatraPada).toBe(2);
            expect(result.planets.jupiter.nakshatra).toBe('hasta');
            expect(result.planets.jupiter.nakshatraPada).toBe(3);
            expect(result.planets.venus.nakshatra).toBe('shravana');
            expect(result.planets.venus.nakshatraPada).toBe(4);
            expect(result.planets.saturn.nakshatra).toBe('swati');
            expect(result.planets.saturn.nakshatraPada).toBe(2);
            expect(result.planets.rahu.nakshatra).toBe('krittika');
            expect(result.planets.rahu.nakshatraPada).toBe(3);
            expect(result.planets.ketu.nakshatra).toBe('krittika');
            expect(result.planets.ketu.nakshatraPada).toBe(3);
        });

        it('should assign planets to correct houses in ' + D + ' chart', () => {
            const result = chartCalculator.calculateDivisionalChart(rashiChart, D);

            expect(result.planets.sun.house).toBe(5);
            expect(result.planets.moon.house).toBe(1);
            expect(result.planets.mars.house).toBe(10);
            expect(result.planets.mercury.house).toBe(3);
            expect(result.planets.jupiter.house).toBe(10);
            expect(result.planets.venus.house).toBe(2);
            expect(result.planets.saturn.house).toBe(11);
            expect(result.planets.rahu.house).toBe(6);
            expect(result.planets.ketu.house).toBe(6);
        });
    });
});
