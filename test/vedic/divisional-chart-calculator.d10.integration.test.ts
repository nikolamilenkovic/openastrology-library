import { BirthInfo, VedicChartCalculations, DivisionalChartCalculator } from '../../src';
import { FormattingUtils } from '../../src';
import { VedicAstrologyCalculator } from '../../src';

describe(DivisionalChartCalculator.name, () => {
    let chartCalculator: VedicAstrologyCalculator;
    let mockBirthInfo: BirthInfo;
    let rashiChart: VedicChartCalculations;

    const dms2def = FormattingUtils.formattedDMStoDegrees;

    beforeAll(() => {
        chartCalculator = new VedicAstrologyCalculator();
    });

    describe('D10 calculations for test person 1', () => {
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

        it('should calculate D10 planet signs successfully', () => {
            const result = chartCalculator.calculateDivisionalChart(rashiChart, 'D10');
            
            expect(result.ascendant.sign).toBe('taurus');
            expect(result.planets.sun.sign).toBe('gemini');
            expect(result.planets.moon.sign).toBe('libra');
            expect(result.planets.mars.sign).toBe('aries');
            expect(result.planets.mercury.sign).toBe('taurus');
            expect(result.planets.jupiter.sign).toBe('capricorn');
            expect(result.planets.venus.sign).toBe('sagittarius');
            expect(result.planets.saturn.sign).toBe('virgo');
            expect(result.planets.rahu.sign).toBe('capricorn');
            expect(result.planets.ketu.sign).toBe('cancer');
        });

        it('should calculate ascendant degree correctly', () => {
            const result = chartCalculator.calculateDivisionalChart(rashiChart, 'D10');

            expect(result.ascendant.degree).toBeWithinEpsilon(dms2def('20:30:35'), 0.1);
        });

        it('should calculate planet degrees correctly', () => {
            const result = chartCalculator.calculateDivisionalChart(rashiChart, 'D10');

            expect(result.planets.sun.degree).toBeWithinEpsilon(dms2def('06:00:46'), 0.1);
            expect(result.planets.moon.degree).toBeWithinEpsilon(dms2def('04:13:22'), 0.11);
            expect(result.planets.mars.degree).toBeWithinEpsilon(dms2def('24:38:17'), 0.1);
            expect(result.planets.mercury.degree).toBeWithinEpsilon(dms2def('03:13:09'), 0.1);
            expect(result.planets.jupiter.degree).toBeWithinEpsilon(dms2def('12:04:25'), 0.1);
            expect(result.planets.venus.degree).toBeWithinEpsilon(dms2def('12:57:13'), 0.1);
            expect(result.planets.saturn.degree).toBeWithinEpsilon(dms2def('02:55:28'), 0.1);
            expect(result.planets.rahu.degree).toBeWithinEpsilon(dms2def('23:58:12'), 0.1);
            expect(result.planets.ketu.degree).toBeWithinEpsilon(dms2def('23:58:12'), 0.1);
        });

        it('should calculate retrograde planets correctly', () => {
            const result = chartCalculator.calculateDivisionalChart(rashiChart, 'D10');
            
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

        it('should calculate nakshatras and padas correctly', () => {
            const result = chartCalculator.calculateDivisionalChart(rashiChart, 'D10');

            // Check ascendant nakshatra
            expect(result.ascendant.nakshatra).toBe('rohini');
            expect(result.ascendant.nakshatraPada).toBe(4);

            expect(result.planets.sun.nakshatra).toBe('mrigashira');
            expect(result.planets.sun.nakshatraPada).toBe(4);
            expect(result.planets.moon.nakshatra).toBe('chitra');
            expect(result.planets.moon.nakshatraPada).toBe(4);
            expect(result.planets.mars.nakshatra).toBe('bharani');
            expect(result.planets.mars.nakshatraPada).toBe(4);
            expect(result.planets.mercury.nakshatra).toBe('krittika');
            expect(result.planets.mercury.nakshatraPada).toBe(2);
            expect(result.planets.jupiter.nakshatra).toBe('shravana');
            expect(result.planets.jupiter.nakshatraPada).toBe(1);
            expect(result.planets.venus.nakshatra).toBe('moola');
            expect(result.planets.venus.nakshatraPada).toBe(4);
            expect(result.planets.saturn.nakshatra).toBe('uttara_phalguni');
            expect(result.planets.saturn.nakshatraPada).toBe(2);
            expect(result.planets.rahu.nakshatra).toBe('dhanishta');
            expect(result.planets.rahu.nakshatraPada).toBe(1);
            expect(result.planets.ketu.nakshatra).toBe('ashlesha');
            expect(result.planets.ketu.nakshatraPada).toBe(3);
        });

        it('should assign planets to correct houses', () => {
            const result = chartCalculator.calculateDivisionalChart(rashiChart, 'D10');

            expect(result.planets.sun.house).toBe(2);
            expect(result.planets.moon.house).toBe(6);
            expect(result.planets.mars.house).toBe(12);
            expect(result.planets.mercury.house).toBe(1);
            expect(result.planets.jupiter.house).toBe(9);
            expect(result.planets.venus.house).toBe(8);
            expect(result.planets.saturn.house).toBe(5);
            expect(result.planets.rahu.house).toBe(9);
            expect(result.planets.ketu.house).toBe(3);
        });
    });
});
