import { BirthInfo, VedicChartCalculations, DivisionalChartCalculator } from '../../src';
import { FormattingUtils } from '../../src';
import { VedicAstrologyCalculator } from '../../src';

const D = 'D24';

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

            expect(result.ascendant.sign).toBe('leo');
            expect(result.planets.sun.sign).toBe('leo');
            expect(result.planets.moon.sign).toBe('pisces');
            expect(result.planets.mars.sign).toBe('leo');
            expect(result.planets.mercury.sign).toBe('aries');
            expect(result.planets.jupiter.sign).toBe('capricorn');
            expect(result.planets.venus.sign).toBe('aries');
            expect(result.planets.saturn.sign).toBe('cancer');
            expect(result.planets.rahu.sign).toBe('gemini');
            expect(result.planets.ketu.sign).toBe('gemini');
        });

        it('should calculate ' + D + ' ascendant degree correctly', () => {
            const result = chartCalculator.calculateDivisionalChart(rashiChart, D);

            expect(result.ascendant.degree).toBeWithinEpsilon(dms2def('19:13:24'), 0.1);
        });

        it('should calculate ' + D + ' planet degrees correctly', () => {
            const result = chartCalculator.calculateDivisionalChart(rashiChart, D);

            expect(result.planets.sun.degree).toBeWithinEpsilon(dms2def('14:25:50'), 0.1);
            expect(result.planets.moon.degree).toBeWithinEpsilon(dms2def('16:08:05'), 0.22);
            expect(result.planets.mars.degree).toBeWithinEpsilon(dms2def('29:07:52'), 0.1);
            expect(result.planets.mercury.degree).toBeWithinEpsilon(dms2def('25:43:34'), 0.1);
            expect(result.planets.jupiter.degree).toBeWithinEpsilon(dms2def('22:58:37'), 0.1);
            expect(result.planets.venus.degree).toBeWithinEpsilon(dms2def('07:05:18'), 0.1);
            expect(result.planets.saturn.degree).toBeWithinEpsilon(dms2def('07:01:06'), 0.1);
            expect(result.planets.rahu.degree).toBeWithinEpsilon(dms2def('15:31:42'), 0.1);
            expect(result.planets.ketu.degree).toBeWithinEpsilon(dms2def('15:31:42'), 0.1);
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
            expect(result.ascendant.nakshatra).toBe('purva_phalguni');
            expect(result.ascendant.nakshatraPada).toBe(2);

            // Check planets nakshatras and padas
            expect(result.planets.sun.nakshatra).toBe('purva_phalguni');
            expect(result.planets.sun.nakshatraPada).toBe(1);
            expect(result.planets.moon.nakshatra).toBe('uttara_bhadrapada');
            expect(result.planets.moon.nakshatraPada).toBe(4);
            expect(result.planets.mars.nakshatra).toBe('uttara_phalguni');
            expect(result.planets.mars.nakshatraPada).toBe(1);
            expect(result.planets.mercury.nakshatra).toBe('bharani');
            expect(result.planets.mercury.nakshatraPada).toBe(4);
            expect(result.planets.jupiter.nakshatra).toBe('shravana');
            expect(result.planets.jupiter.nakshatraPada).toBe(4);
            expect(result.planets.venus.nakshatra).toBe('ashwini');
            expect(result.planets.venus.nakshatraPada).toBe(3);
            expect(result.planets.saturn.nakshatra).toBe('pushya');
            expect(result.planets.saturn.nakshatraPada).toBe(2);
            expect(result.planets.rahu.nakshatra).toBe('ardra');
            expect(result.planets.rahu.nakshatraPada).toBe(3);
            expect(result.planets.ketu.nakshatra).toBe('ardra');
            expect(result.planets.ketu.nakshatraPada).toBe(3);
        });

        it('should assign planets to correct houses in ' + D + ' chart', () => {
            const result = chartCalculator.calculateDivisionalChart(rashiChart, D);

            expect(result.planets.sun.house).toBe(1);
            expect(result.planets.moon.house).toBe(8);
            expect(result.planets.mars.house).toBe(1);
            expect(result.planets.mercury.house).toBe(9);
            expect(result.planets.jupiter.house).toBe(6);
            expect(result.planets.venus.house).toBe(9);
            expect(result.planets.saturn.house).toBe(12);
            expect(result.planets.rahu.house).toBe(11);
            expect(result.planets.ketu.house).toBe(11);
        });
    });
});
