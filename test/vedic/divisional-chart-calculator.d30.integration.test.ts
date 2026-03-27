import { BirthInfo, VedicChartCalculations, DivisionalChartCalculator } from '../../src';
import { FormattingUtils } from '../../src';
import { VedicAstrologyCalculator } from '../../src';

const D = 'D30';

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
            expect(result.planets.moon.sign).toBe('gemini');
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

            expect(result.ascendant.degree).toBeWithinEpsilon(dms2def('01:40:00'), 0.1);
        });

        it('should calculate ' + D + ' planet degrees correctly', () => {
            const result = chartCalculator.calculateDivisionalChart(rashiChart, D);

            expect(result.planets.sun.degree).toBeWithinEpsilon(dms2def('18:01:00'), 0.1);
            expect(result.planets.moon.degree).toBeWithinEpsilon(dms2def('12:27:01'), 0.1);
            expect(result.planets.mars.degree).toBeWithinEpsilon(dms2def('13:59:35'), 0.1);
            expect(result.planets.mercury.degree).toBeWithinEpsilon(dms2def('09:40:57'), 0.1);
            expect(result.planets.jupiter.degree).toBeWithinEpsilon(dms2def('06:12:00'), 0.1);
            expect(result.planets.venus.degree).toBeWithinEpsilon(dms2def('08:51:00'), 0.1);
            expect(result.planets.saturn.degree).toBeWithinEpsilon(dms2def('08:45:00'), 0.1);
            expect(result.planets.rahu.degree).toBeWithinEpsilon(dms2def('11:55:00'), 0.1);
            expect(result.planets.ketu.degree).toBeWithinEpsilon(dms2def('11:55:00'), 0.1);
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
            expect(result.ascendant.nakshatra).toBe('krittika');
            expect(result.ascendant.nakshatraPada).toBe(2);

            // Check planets nakshatras and padas
            expect(result.planets.sun.nakshatra).toBe('bharani'); // Different compared to vedic software, need to verify
            expect(result.planets.sun.nakshatraPada).toBe(2);
            expect(result.planets.moon.nakshatra).toBe('ardra'); // Different compared to vedic software, need to verify
            expect(result.planets.moon.nakshatraPada).toBe(2);
            expect(result.planets.mars.nakshatra).toBe('uttara_bhadrapada'); // Different compared to vedic software, need to verify
            expect(result.planets.mars.nakshatraPada).toBe(4);
            expect(result.planets.mercury.nakshatra).toBe('uttara_bhadrapada'); // Different compared to vedic software, need to verify
            expect(result.planets.mercury.nakshatraPada).toBe(2);
            expect(result.planets.jupiter.nakshatra).toBe('mrigashira');
            expect(result.planets.jupiter.nakshatraPada).toBe(4); // Different compared to vedic software, need to verify
            expect(result.planets.venus.nakshatra).toBe('swati'); // Different compared to vedic software, need to verify
            expect(result.planets.venus.nakshatraPada).toBe(1);
            expect(result.planets.saturn.nakshatra).toBe('krittika');
            expect(result.planets.saturn.nakshatraPada).toBe(4); // Different compared to vedic software, need to verify
            expect(result.planets.rahu.nakshatra).toBe('uttara_bhadrapada');
            expect(result.planets.rahu.nakshatraPada).toBe(3); // Different compared to vedic software, need to verify
            expect(result.planets.ketu.nakshatra).toBe('uttara_bhadrapada');
            expect(result.planets.ketu.nakshatraPada).toBe(3); // Different compared to vedic software, need to verify
        });

        it('should assign planets to correct houses in ' + D + ' chart', () => {
            const result = chartCalculator.calculateDivisionalChart(rashiChart, D);

            expect(result.planets.sun.house).toBe(12);
            expect(result.planets.moon.house).toBe(2);
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
