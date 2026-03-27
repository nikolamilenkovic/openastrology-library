import { BirthInfo, VedicChartCalculations, DivisionalChartCalculator } from '../../src';
import { FormattingUtils } from '../../src';
import { VedicAstrologyCalculator } from '../../src';

const D = 'D12';

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

            expect(result.ascendant.sign).toBe('virgo');
            expect(result.planets.sun.sign).toBe('gemini');
            expect(result.planets.moon.sign).toBe('scorpio');
            expect(result.planets.mars.sign).toBe('virgo');
            expect(result.planets.mercury.sign).toBe('virgo');
            expect(result.planets.jupiter.sign).toBe('aquarius');
            expect(result.planets.venus.sign).toBe('aquarius');
            expect(result.planets.saturn.sign).toBe('capricorn');
            expect(result.planets.rahu.sign).toBe('gemini');
            expect(result.planets.ketu.sign).toBe('sagittarius');
        });

        it('should calculate ' + D + ' ascendant degree correctly', () => {
            const result = DivisionalChartCalculator.calculateDivisionalChart(rashiChart, D);

            expect(result.ascendant.degree).toBeWithinEpsilon(dms2def('24:36:42'), 0.15);
        });

        it('should calculate ' + D + ' planet degrees correctly', () => {
            const result = DivisionalChartCalculator.calculateDivisionalChart(rashiChart, D);

            expect(result.planets.sun.degree).toBeWithinEpsilon(dms2def('07:12:55'), 0.1);
            expect(result.planets.moon.degree).toBeWithinEpsilon(dms2def('23:04:03'), 0.11);
            expect(result.planets.mars.degree).toBeWithinEpsilon(dms2def('29:33:56'), 0.1);
            expect(result.planets.mercury.degree).toBeWithinEpsilon(dms2def('27:51:47'), 0.1);
            expect(result.planets.jupiter.degree).toBeWithinEpsilon(dms2def('26:29:18'), 0.1);
            expect(result.planets.venus.degree).toBeWithinEpsilon(dms2def('03:32:39'), 0.1);
            expect(result.planets.saturn.degree).toBeWithinEpsilon(dms2def('03:30:33'), 0.1);
            expect(result.planets.rahu.degree).toBeWithinEpsilon(dms2def('22:45:51'), 0.1);
            expect(result.planets.ketu.degree).toBeWithinEpsilon(dms2def('22:45:51'), 0.1);
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
            expect(result.ascendant.nakshatra).toBe('chitra');
            expect(result.ascendant.nakshatraPada).toBe(1);

            // Check planets nakshatras and padas
            expect(result.planets.sun.nakshatra).toBe('ardra');
            expect(result.planets.sun.nakshatraPada).toBe(1);
            expect(result.planets.moon.nakshatra).toBe('jyeshtha');
            expect(result.planets.moon.nakshatraPada).toBe(2);
            expect(result.planets.mars.nakshatra).toBe('chitra');
            expect(result.planets.mars.nakshatraPada).toBe(2);
            expect(result.planets.mercury.nakshatra).toBe('chitra');
            expect(result.planets.mercury.nakshatraPada).toBe(2);
            expect(result.planets.jupiter.nakshatra).toBe('purva_bhadrapada');
            expect(result.planets.jupiter.nakshatraPada).toBe(2);
            expect(result.planets.venus.nakshatra).toBe('dhanishta');
            expect(result.planets.venus.nakshatraPada).toBe(4);
            expect(result.planets.saturn.nakshatra).toBe('uttara_ashadha');
            expect(result.planets.saturn.nakshatraPada).toBe(3);
            expect(result.planets.rahu.nakshatra).toBe('punarvasu');
            expect(result.planets.rahu.nakshatraPada).toBe(1);
            expect(result.planets.ketu.nakshatra).toBe('purva_ashadha');
            expect(result.planets.ketu.nakshatraPada).toBe(3);
        });

        it('should assign planets to correct houses in ' + D + ' chart', () => {
            const result = DivisionalChartCalculator.calculateDivisionalChart(rashiChart, D);

            expect(result.planets.sun.house).toBe(10);
            expect(result.planets.moon.house).toBe(3);
            expect(result.planets.mars.house).toBe(1);
            expect(result.planets.mercury.house).toBe(1);
            expect(result.planets.jupiter.house).toBe(6);
            expect(result.planets.venus.house).toBe(6);
            expect(result.planets.saturn.house).toBe(5);
            expect(result.planets.rahu.house).toBe(10);
            expect(result.planets.ketu.house).toBe(4);
        });
    });
});
