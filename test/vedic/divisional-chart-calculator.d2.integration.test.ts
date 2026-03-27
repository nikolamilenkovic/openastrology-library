import { FormattingUtils, VedicAstrologyCalculator } from '../../src';
import { BirthInfo, VedicChartCalculations } from '../../src';
import { DivisionalChartCalculator } from '../../src';

const D = 'D2';

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

            expect(result.ascendant.sign).toBe('cancer');
            expect(result.planets.sun.sign).toBe('leo');
            expect(result.planets.moon.sign).toBe('cancer');
            expect(result.planets.mars.sign).toBe('leo');
            expect(result.planets.mercury.sign).toBe('cancer');
            expect(result.planets.jupiter.sign).toBe('cancer');
            expect(result.planets.venus.sign).toBe('cancer');
            expect(result.planets.saturn.sign).toBe('cancer');
            expect(result.planets.rahu.sign).toBe('cancer');
            expect(result.planets.ketu.sign).toBe('cancer');
        });

        it('should calculate ' + D + ' planet degrees correctly', () => {
            const result = chartCalculator.calculateDivisionalChart(rashiChart, D);

            expect(result.planets.sun.degree).toBeWithinEpsilon(dms2def('01:12:00'), 0.1);
            expect(result.planets.moon.degree).toBeWithinEpsilon(dms2def('18:50:00'), 0.1);
            expect(result.planets.mars.degree).toBeWithinEpsilon(dms2def('04:55:00'), 0.1);
            expect(result.planets.mercury.degree).toBeWithinEpsilon(dms2def('24:38:00'), 0.1);
            expect(result.planets.jupiter.degree).toBeWithinEpsilon(dms2def('14:24:00'), 0.1);
            expect(result.planets.venus.degree).toBeWithinEpsilon(dms2def('20:35:00'), 0.1);
            expect(result.planets.saturn.degree).toBeWithinEpsilon(dms2def('00:35:00'), 0.1);
            expect(result.planets.rahu.degree).toBeWithinEpsilon(dms2def('28:47:00'), 0.1);
            expect(result.planets.ketu.degree).toBeWithinEpsilon(dms2def('28:47:00'), 0.1);
        });

        it('should calculate ' + D + ' ascendant degree correctly', () => {
            const result = chartCalculator.calculateDivisionalChart(rashiChart, D);

            expect(result.ascendant.degree).toBeWithinEpsilon(dms2def('04:06:00'), 0.1);
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
            expect(result.ascendant.nakshatra).toBe('pushya');
            expect(result.ascendant.nakshatraPada).toBe(1);

            // Check planets nakshatras and padas
            expect(result.planets.sun.nakshatra).toBe('magha');
            expect(result.planets.sun.nakshatraPada).toBe(1);
            expect(result.planets.moon.nakshatra).toBe('ashlesha');
            expect(result.planets.moon.nakshatraPada).toBe(1);
            expect(result.planets.mars.nakshatra).toBe('magha');
            expect(result.planets.mars.nakshatraPada).toBe(2);
            expect(result.planets.mercury.nakshatra).toBe('ashlesha');
            expect(result.planets.mercury.nakshatraPada).toBe(3);
            expect(result.planets.jupiter.nakshatra).toBe('pushya');
            expect(result.planets.jupiter.nakshatraPada).toBe(4);
            expect(result.planets.venus.nakshatra).toBe('ashlesha');
            expect(result.planets.venus.nakshatraPada).toBe(2);
            expect(result.planets.saturn.nakshatra).toBe('punarvasu');
            expect(result.planets.saturn.nakshatraPada).toBe(4);
            expect(result.planets.rahu.nakshatra).toBe('ashlesha');
            expect(result.planets.rahu.nakshatraPada).toBe(4);
            expect(result.planets.ketu.nakshatra).toBe('ashlesha');
            expect(result.planets.ketu.nakshatraPada).toBe(4);
        });

        it('should assign planets to correct houses in ' + D + ' chart', () => {
            const result = chartCalculator.calculateDivisionalChart(rashiChart, D);

            expect(result.planets.sun.house).toBe(2);
            expect(result.planets.moon.house).toBe(1);
            expect(result.planets.mars.house).toBe(2);
            expect(result.planets.mercury.house).toBe(1);
            expect(result.planets.jupiter.house).toBe(1);
            expect(result.planets.venus.house).toBe(1);
            expect(result.planets.saturn.house).toBe(1);
            expect(result.planets.rahu.house).toBe(1);
            expect(result.planets.ketu.house).toBe(1);
        });

        it('should carry over combustion', async () => {
            const result = chartCalculator.calculateDivisionalChart(rashiChart, D);

            expect(result.planets.mercury.isCombust).toBe(false);
            expect(result.planets.saturn.isCombust).toBe(false);
        });
    });
});
