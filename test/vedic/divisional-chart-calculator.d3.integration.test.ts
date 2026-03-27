import { FormattingUtils } from '../../src';
import { VedicAstrologyCalculator } from '../../src';
import { BirthInfo, VedicChartCalculations, DivisionalChartCalculator } from '../../src';

const D = 'D3';

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
            const result = rashiChartCalculator.calculateDivisionalChart(rashiChart, D);

            expect(result.ascendant.sign).toBe('virgo');

            expect(result.planets.sun.sign).toBe('gemini');
            expect(result.planets.moon.sign).toBe('libra');
            expect(result.planets.mars.sign).toBe('cancer');
            expect(result.planets.mercury.sign).toBe('virgo');
            expect(result.planets.jupiter.sign).toBe('aquarius');
            expect(result.planets.venus.sign).toBe('sagittarius');
            expect(result.planets.saturn.sign).toBe('capricorn');
            expect(result.planets.rahu.sign).toBe('taurus');
            expect(result.planets.ketu.sign).toBe('scorpio');
        });

        it('should calculate ' + D + ' ascendant degree correctly', () => {
            const result = rashiChartCalculator.calculateDivisionalChart(rashiChart, D);

            expect(result.ascendant.degree).toBeWithinEpsilon(dms2def('06:09:10'), 0.1);
        });

        it('should calculate ' + D + ' planet degrees correctly', () => {
            const result = rashiChartCalculator.calculateDivisionalChart(rashiChart, D);

            expect(result.planets.sun.degree).toBeWithinEpsilon(dms2def('01:48:14'), 0.1);
            expect(result.planets.moon.degree).toBeWithinEpsilon(dms2def('13:16:01'), 0.1);
            expect(result.planets.mars.degree).toBeWithinEpsilon(dms2def('22:23:29'), 0.1);
            expect(result.planets.mercury.degree).toBeWithinEpsilon(dms2def('06:57:57'), 0.1);
            expect(result.planets.jupiter.degree).toBeWithinEpsilon(dms2def('06:37:20'), 0.1);
            expect(result.planets.venus.degree).toBeWithinEpsilon(dms2def('15:53:10'), 0.1);
            expect(result.planets.saturn.degree).toBeWithinEpsilon(dms2def('00:52:38'), 0.1);
            expect(result.planets.rahu.degree).toBeWithinEpsilon(dms2def('13:11:28'), 0.1);
            expect(result.planets.ketu.degree).toBeWithinEpsilon(dms2def('13:11:28'), 0.1);
        });

        it('should calculate ' + D + ' retrograde planets correctly', () => {
            const result = rashiChartCalculator.calculateDivisionalChart(rashiChart, D);

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
            const result = rashiChartCalculator.calculateDivisionalChart(rashiChart, D);

            // Check ascendant nakshatra and pada
            expect(result.ascendant.nakshatra).toBe('uttara_phalguni');
            expect(result.ascendant.nakshatraPada).toBe(3);

            // Check planets nakshatras and padas
            expect(result.planets.sun.nakshatra).toBe('mrigashira');
            expect(result.planets.sun.nakshatraPada).toBe(3);
            expect(result.planets.moon.nakshatra).toBe('swati');
            expect(result.planets.moon.nakshatraPada).toBe(2);
            expect(result.planets.mars.nakshatra).toBe('ashlesha');
            expect(result.planets.mars.nakshatraPada).toBe(2);
            expect(result.planets.mercury.nakshatra).toBe('uttara_phalguni');
            expect(result.planets.mercury.nakshatraPada).toBe(4);
            expect(result.planets.jupiter.nakshatra).toBe('dhanishta');
            expect(result.planets.jupiter.nakshatraPada).toBe(4);
            expect(result.planets.venus.nakshatra).toBe('purva_ashadha');
            expect(result.planets.venus.nakshatraPada).toBe(1);
            expect(result.planets.saturn.nakshatra).toBe('uttara_ashadha');
            expect(result.planets.saturn.nakshatraPada).toBe(2);
            expect(result.planets.rahu.nakshatra).toBe('rohini');
            expect(result.planets.rahu.nakshatraPada).toBe(1);
            expect(result.planets.ketu.nakshatra).toBe('anuradha');
            expect(result.planets.ketu.nakshatraPada).toBe(3);
        });

        it('should assign planets to correct houses in ' + D + ' chart', () => {
            const result = rashiChartCalculator.calculateDivisionalChart(rashiChart, D);

            expect(result.planets.sun.house).toBe(10);
            expect(result.planets.moon.house).toBe(2);
            expect(result.planets.mars.house).toBe(11);
            expect(result.planets.mercury.house).toBe(1);
            expect(result.planets.jupiter.house).toBe(6);
            expect(result.planets.venus.house).toBe(4);
            expect(result.planets.saturn.house).toBe(5);
            expect(result.planets.rahu.house).toBe(9);
            expect(result.planets.ketu.house).toBe(3);
        });
    });
});
