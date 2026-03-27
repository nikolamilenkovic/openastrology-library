import { BirthInfo, VedicChartCalculations, DivisionalChartCalculator } from '../../src';
import { FormattingUtils } from '../../src';
import { VedicAstrologyCalculator } from '../../src';

const D = 'D27';

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
            expect(result.planets.sun.sign).toBe('libra');
            expect(result.planets.moon.sign).toBe('cancer');
            expect(result.planets.mars.sign).toBe('aries');
            expect(result.planets.mercury.sign).toBe('gemini');
            expect(result.planets.jupiter.sign).toBe('taurus');
            expect(result.planets.venus.sign).toBe('aquarius');
            expect(result.planets.saturn.sign).toBe('cancer');
            expect(result.planets.rahu.sign).toBe('cancer');
            expect(result.planets.ketu.sign).toBe('capricorn');
        });

        it('should calculate ' + D + ' ascendant degree correctly', () => {
            const result = chartCalculator.calculateDivisionalChart(rashiChart, D);

            expect(result.ascendant.degree).toBeWithinEpsilon(dms2def('25:22:34'), 0.1);
        });

        it('should calculate ' + D + ' planet degrees correctly', () => {
            const result = chartCalculator.calculateDivisionalChart(rashiChart, D);

            expect(result.planets.sun.degree).toBeWithinEpsilon(dms2def('16:14:03'), 0.1);
            expect(result.planets.moon.degree).toBeWithinEpsilon(dms2def('29:24:06'), 0.25);
            expect(result.planets.mars.degree).toBeWithinEpsilon(dms2def('21:31:22'), 0.1);
            expect(result.planets.mercury.degree).toBeWithinEpsilon(dms2def('02:41:31'), 0.1);
            expect(result.planets.jupiter.degree).toBeWithinEpsilon(dms2def('29:35:56'), 0.1);
            expect(result.planets.venus.degree).toBeWithinEpsilon(dms2def('22:58:28'), 0.1);
            expect(result.planets.saturn.degree).toBeWithinEpsilon(dms2def('07:53:44'), 0.1);
            expect(result.planets.rahu.degree).toBeWithinEpsilon(dms2def('28:43:09'), 0.1);
            expect(result.planets.ketu.degree).toBeWithinEpsilon(dms2def('28:43:09'), 0.1);
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
            expect(result.ascendant.nakshatraPada).toBe(4);

            // Check planets nakshatras and padas
            expect(result.planets.sun.nakshatra).toBe('swati');
            expect(result.planets.sun.nakshatraPada).toBe(3);
            expect(result.planets.moon.nakshatra).toBe('ashlesha');
            expect(result.planets.moon.nakshatraPada).toBe(4);
            expect(result.planets.mars.nakshatra).toBe('bharani');
            expect(result.planets.mars.nakshatraPada).toBe(3);
            expect(result.planets.mercury.nakshatra).toBe('mrigashira');
            expect(result.planets.mercury.nakshatraPada).toBe(3);
            expect(result.planets.jupiter.nakshatra).toBe('mrigashira');
            expect(result.planets.jupiter.nakshatraPada).toBe(2);
            expect(result.planets.venus.nakshatra).toBe('purva_bhadrapada');
            expect(result.planets.venus.nakshatraPada).toBe(1);
            expect(result.planets.saturn.nakshatra).toBe('pushya');
            expect(result.planets.saturn.nakshatraPada).toBe(2);
            expect(result.planets.rahu.nakshatra).toBe('ashlesha');
            expect(result.planets.rahu.nakshatraPada).toBe(4);
            expect(result.planets.ketu.nakshatra).toBe('dhanishta');
            expect(result.planets.ketu.nakshatraPada).toBe(2);
        });

        it('should assign planets to correct houses in ' + D + ' chart', () => {
            const result = chartCalculator.calculateDivisionalChart(rashiChart, D);

            expect(result.planets.sun.house).toBe(3);
            expect(result.planets.moon.house).toBe(12);
            expect(result.planets.mars.house).toBe(9);
            expect(result.planets.mercury.house).toBe(11);
            expect(result.planets.jupiter.house).toBe(10);
            expect(result.planets.venus.house).toBe(7);
            expect(result.planets.saturn.house).toBe(12);
            expect(result.planets.rahu.house).toBe(12);
            expect(result.planets.ketu.house).toBe(6);
        });
    });
});
