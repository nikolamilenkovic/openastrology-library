import { BirthInfo, VedicChartCalculations, DivisionalChartCalculator } from '../../src';
import { FormattingUtils } from '../../src';
import { VedicAstrologyCalculator } from '../../src';

const D = 'D5';

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

            expect(result.ascendant.sign).toBe('taurus');
            expect(result.planets.sun.sign).toBe('aries');
            expect(result.planets.moon.sign).toBe('libra');
            expect(result.planets.mars.sign).toBe('pisces');
            expect(result.planets.mercury.sign).toBe('pisces');
            expect(result.planets.jupiter.sign).toBe('gemini');
            expect(result.planets.venus.sign).toBe('libra');
            expect(result.planets.saturn.sign).toBe('taurus');
            expect(result.planets.rahu.sign).toBe('pisces');
            expect(result.planets.ketu.sign).toBe('pisces');
        });

        it('should calculate ' + D + ' ascendant degree correctly', () => {
            const result = chartCalculator.calculateDivisionalChart(rashiChart, D);

            expect(result.ascendant.degree).toBeWithinEpsilon(dms2def('10:15:17'), 0.1);
        });

        it('should calculate ' + D + ' planet degrees correctly', () => {
            const result = chartCalculator.calculateDivisionalChart(rashiChart, D);

            expect(result.planets.sun.degree).toBeWithinEpsilon(dms2def('03:00:23'), 0.1);
            expect(result.planets.moon.degree).toBeWithinEpsilon(dms2def('02:06:41'), 0.1);
            expect(result.planets.mars.degree).toBeWithinEpsilon(dms2def('27:19:08'), 0.1);
            expect(result.planets.mercury.degree).toBeWithinEpsilon(dms2def('01:36:35'), 0.1);
            expect(result.planets.jupiter.degree).toBeWithinEpsilon(dms2def('21:02:13'), 0.1);
            expect(result.planets.venus.degree).toBeWithinEpsilon(dms2def('06:28:36'), 0.1);
            expect(result.planets.saturn.degree).toBeWithinEpsilon(dms2def('01:27:44'), 0.1);
            expect(result.planets.rahu.degree).toBeWithinEpsilon(dms2def('11:59:06'), 0.1);
            expect(result.planets.ketu.degree).toBeWithinEpsilon(dms2def('11:59:06'), 0.1);
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
            expect(result.ascendant.nakshatra).toBe('rohini');
            expect(result.ascendant.nakshatraPada).toBe(1);

            // Check planets nakshatras and padas
            expect(result.planets.sun.nakshatra).toBe('ashwini');
            expect(result.planets.sun.nakshatraPada).toBe(1);
            expect(result.planets.moon.nakshatra).toBe('chitra');
            expect(result.planets.moon.nakshatraPada).toBe(3);
            expect(result.planets.mars.nakshatra).toBe('revati');
            expect(result.planets.mars.nakshatraPada).toBe(4);
            expect(result.planets.mercury.nakshatra).toBe('purva_bhadrapada');
            expect(result.planets.mercury.nakshatraPada).toBe(4);
            expect(result.planets.jupiter.nakshatra).toBe('punarvasu');
            expect(result.planets.jupiter.nakshatraPada).toBe(1);
            expect(result.planets.venus.nakshatra).toBe('chitra'); // Swati?
            expect(result.planets.venus.nakshatraPada).toBe(4);
            expect(result.planets.saturn.nakshatra).toBe('krittika');
            expect(result.planets.saturn.nakshatraPada).toBe(2);
            expect(result.planets.rahu.nakshatra).toBe('uttara_bhadrapada');
            expect(result.planets.rahu.nakshatraPada).toBe(3);
            expect(result.planets.ketu.nakshatra).toBe('uttara_bhadrapada');
            expect(result.planets.ketu.nakshatraPada).toBe(3);
        });

        it('should assign planets to correct houses in ' + D + ' chart', () => {
            const result = chartCalculator.calculateDivisionalChart(rashiChart, D);

            expect(result.planets.sun.house).toBe(12);
            expect(result.planets.moon.house).toBe(6);
            expect(result.planets.mars.house).toBe(11);
            expect(result.planets.mercury.house).toBe(11);
            expect(result.planets.jupiter.house).toBe(2);
            expect(result.planets.venus.house).toBe(6);
            expect(result.planets.saturn.house).toBe(1);
            expect(result.planets.rahu.house).toBe(11);
            expect(result.planets.ketu.house).toBe(11);
        });
    });
});
