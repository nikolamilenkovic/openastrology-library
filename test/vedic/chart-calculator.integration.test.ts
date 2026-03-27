import { VedicAstrologyCalculator } from '../../src';
import { BirthInfo } from '../../src';
import { FormattingUtils } from '../../src';

describe('VedicAstrologyCalculator Integration', () => {
    let calculator: VedicAstrologyCalculator;
    let mockBirthInfo: BirthInfo;

    const dms2def = FormattingUtils.formattedDMStoDegrees;

    afterEach(() => {
        calculator.dispose();
    });

    describe('Complete Chart Calculation', () => {
        beforeEach(() => {
            calculator = new VedicAstrologyCalculator();
            mockBirthInfo = {
                name: 'Test Person',
                dateOfBirth: '1990-06-15',
                timeOfBirth: '13:00',
                latitude: 40,
                longitude: -74,
                timezone: 'America/New_York'
            };
        });

        it('should calculate planet signs successfully', async () => {
            const result = await calculator.calculateChart(mockBirthInfo);

            expect(result.ascendant.sign).toBe('virgo');
            expect(result.planets.sun.sign).toBe('gemini');
            expect(result.planets.moon.sign).toBe('aquarius');
            expect(result.planets.mars.sign).toBe('pisces');
            expect(result.planets.mercury.sign).toBe('taurus');
            expect(result.planets.jupiter.sign).toBe('gemini');
            expect(result.planets.venus.sign).toBe('aries');
            expect(result.planets.saturn.sign).toBe('capricorn');
            expect(result.planets.rahu.sign).toBe('capricorn');
            expect(result.planets.ketu.sign).toBe('cancer');
        });

        it('should calculate planet degrees correctly', async () => {
            const result = await calculator.calculateChart(mockBirthInfo);

            expect(result.planets.sun.degree).toBeWithinEpsilon(dms2def('00:36:05'), 0.1);
            expect(result.planets.moon.degree).toBeWithinEpsilon(dms2def('24:25:20'), 0.1);
            expect(result.planets.mars.degree).toBeWithinEpsilon(dms2def('17:27:50'), 0.1);
            expect(result.planets.mercury.degree).toBeWithinEpsilon(dms2def('12:19:19'), 0.1);
            expect(result.planets.jupiter.degree).toBeWithinEpsilon(dms2def('22:12:27'), 0.1);
            expect(result.planets.venus.degree).toBeWithinEpsilon(dms2def('25:17:43'), 0.1);
            expect(result.planets.saturn.degree).toBeWithinEpsilon(dms2def('00:17:33'), 0.1);
            expect(result.planets.rahu.degree).toBeWithinEpsilon(dms2def('14:23:49'), 0.1);
            expect(result.planets.ketu.degree).toBeWithinEpsilon(dms2def('14:23:49'), 0.1);
        });

        it('should calculate ascendant degree correctly', async () => {
            const result = await calculator.calculateChart(mockBirthInfo);

            expect(result.ascendant.degree).toBeWithinEpsilon(dms2def('02:03:03'), 0.1);
        });

        it('should calculate retrograde planets correctly', async () => {
            const result = await calculator.calculateChart(mockBirthInfo);
            
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

        it('should calculate nakshatras and padas correctly', async () => {
            const result = await calculator.calculateChart(mockBirthInfo);

            expect(result.planets.sun.nakshatra).toBe('mrigashira');
            expect(result.planets.sun.nakshatraPada).toBe(3);
            expect(result.planets.moon.nakshatra).toBe('purva_bhadrapada');
            expect(result.planets.moon.nakshatraPada).toBe(2);
            expect(result.planets.mars.nakshatra).toBe('revati');
            expect(result.planets.mars.nakshatraPada).toBe(1);
            expect(result.planets.mercury.nakshatra).toBe('rohini');
            expect(result.planets.mercury.nakshatraPada).toBe(1);
            expect(result.planets.jupiter.nakshatra).toBe('punarvasu');
            expect(result.planets.jupiter.nakshatraPada).toBe(1);
            expect(result.planets.venus.nakshatra).toBe('bharani');
            expect(result.planets.venus.nakshatraPada).toBe(4);
            expect(result.planets.saturn.nakshatra).toBe('uttara_ashadha');
            expect(result.planets.saturn.nakshatraPada).toBe(2);
            expect(result.planets.rahu.nakshatra).toBe('shravana');
            expect(result.planets.rahu.nakshatraPada).toBe(2);
            expect(result.planets.ketu.nakshatra).toBe('pushya');
            expect(result.planets.ketu.nakshatraPada).toBe(4);

            // Check ascendant nakshatra
            expect(result.ascendant.nakshatra).toBe('uttara_phalguni');
            expect(result.ascendant.nakshatraPada).toBe(2);
        });

        it('should assign planets to houses correctly', async () => {
            calculator.dispose();
            calculator = new VedicAstrologyCalculator({ ayanamsa: 'lahiri', houseSystem: 'equal' });
            const result = await calculator.calculateChart(mockBirthInfo);

            expect(result.planets.sun.house).toBe(10);
            expect(result.planets.moon.house).toBe(6);
            expect(result.planets.mars.house).toBe(7);
            expect(result.planets.mercury.house).toBe(9);
            expect(result.planets.jupiter.house).toBe(10);
            expect(result.planets.venus.house).toBe(8);
            expect(result.planets.saturn.house).toBe(5);
            expect(result.planets.rahu.house).toBe(5);
            expect(result.planets.ketu.house).toBe(11);
        });

        it('should calculate house planets correctly', async () => {
            const result = await calculator.calculateChart(mockBirthInfo);

            expect(result.houses['1'].planets.length).toBe(0);
            expect(result.houses['2'].planets.length).toBe(0);
            expect(result.houses['3'].planets.length).toBe(0);
            expect(result.houses['4'].planets.length).toBe(0);
            expect(result.houses['5'].planets.length).toBe(2); // Saturn, Rahu
            expect(result.houses['5'].planets).toContain('saturn');
            expect(result.houses['5'].planets).toContain('rahu');
            expect(result.houses['6'].planets.length).toBe(1); // Moon
            expect(result.houses['6'].planets).toContain('moon');
            expect(result.houses['7'].planets.length).toBe(1); // Mars
            expect(result.houses['7'].planets).toContain('mars');
            expect(result.houses['8'].planets.length).toBe(1); // Venus
            expect(result.houses['8'].planets[0]).toBe('venus');
            expect(result.houses['9'].planets.length).toBe(1); // Mercury
            expect(result.houses['9'].planets[0]).toBe('mercury');
            expect(result.houses['10'].planets.length).toBe(2); // Sun, Jupiter
            expect(result.houses['10'].planets).toContain('sun');
            expect(result.houses['10'].planets).toContain('jupiter');
            expect(result.houses['11'].planets.length).toBe(1); // Ketu
            expect(result.houses['11'].planets[0]).toBe('ketu');
            expect(result.houses['12'].planets.length).toBe(0);
        });

        it('should calculate dasha information', async () => {
            const result = await calculator.calculateChart(mockBirthInfo);

            // Check dasha structure
            expect(result.dashas.vimshottari).toBeDefined();
            expect(result.dashas.vimshottari.dashaPeriods).toHaveLength(9);
            for (let i = 0; i < result.dashas.vimshottari.dashaPeriods.length; i++) {
                const period = result.dashas.vimshottari.dashaPeriods[i];
                expect(period).toHaveProperty('planet');
                expect(period).toHaveProperty('startDate');
                expect(period).toHaveProperty('endDate');
            }
        });

        it('should handle different ayanamsa settings', async () => {
            calculator.dispose();
            const lahiriCalculator = new VedicAstrologyCalculator({ ayanamsa: 'lahiri' });
            const lahiriResult = await lahiriCalculator.calculateChart(mockBirthInfo);
            lahiriCalculator.dispose();

            const ramanCalculator = new VedicAstrologyCalculator({ ayanamsa: 'raman' });
            const ramanResult = await ramanCalculator.calculateChart(mockBirthInfo);
            ramanCalculator.dispose();

            expect(lahiriResult).toBeDefined();
            expect(ramanResult).toBeDefined();

            // Both should have the same structure
            expect(lahiriResult).toHaveProperty('planets');
            expect(ramanResult).toHaveProperty('planets');
        });

        it('should handle different house systems', async () => {
            calculator.dispose();
            const placidusCalculator = new VedicAstrologyCalculator({ ayanamsa: 'lahiri', houseSystem: 'placidus' });
            const placidusResult = await placidusCalculator.calculateChart(mockBirthInfo);
            placidusCalculator.dispose();

            const kochCalculator = new VedicAstrologyCalculator({ ayanamsa: 'lahiri', houseSystem: 'koch' });
            const kochResult = await kochCalculator.calculateChart(mockBirthInfo);
            kochCalculator.dispose();

            expect(placidusResult).toBeDefined();
            expect(kochResult).toBeDefined();

            // Both should have house data
            expect(placidusResult.houses).toBeDefined();
            expect(kochResult.houses).toBeDefined();
        });

        it('should calculate combustion correctly', async () => {
            const result = await calculator.calculateChart(mockBirthInfo);

            // No combustion expected for this birth data, but we can check the method directly
            expect(result.planets.jupiter.isCombust).toBe(false);
        });
    });

    describe('Error Handling', () => {
        it('should handle missing time gracefully', async () => {
            const birthInfoNoTime = {
                ...mockBirthInfo,
                timeOfBirth: ''
            };

            const result = await calculator.calculateChart(birthInfoNoTime);
            expect(result).toBeDefined();
            expect(result.planets).toBeDefined();
        });

        it('should validate birth data', async () => {
            const invalidBirthInfo = {
                ...mockBirthInfo,
                dateOfBirth: 'invalid-date'
            };

            await expect(calculator.calculateChart(invalidBirthInfo)).rejects.toThrow();
        });
    });

    describe('Astrological Accuracy', () => {
        it('should calculate retrograde planets correctly', async () => {
            const result = await calculator.calculateChart(mockBirthInfo);

            // Rahu should be retrograde (negative speed)
            expect(result.planets.rahu.isRetrograde).toBe(true);

            // Ketu should also be retrograde
            expect(result.planets.ketu.isRetrograde).toBe(true);
        });

        it('should calculate Ketu as opposite to Rahu', async () => {
            const result = await calculator.calculateChart(mockBirthInfo);

            const rahuLongitude = result.planets.rahu.longitude;
            const ketuLongitude = result.planets.ketu.longitude;

            // Ketu should be 180 degrees from Rahu
            const difference = Math.abs(rahuLongitude - ketuLongitude);
            expect(difference).toBeCloseTo(180, 0);
        });

        it('should assign valid zodiac signs', async () => {
            const result = await calculator.calculateChart(mockBirthInfo);

            const validSigns = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];

            Object.values(result.planets).forEach(planet => {
                expect(validSigns).toContain(planet.sign);
            });
        });

        it('should assign valid nakshatras', async () => {
            const result = await calculator.calculateChart(mockBirthInfo);

            Object.values(result.planets).forEach(planet => {
                expect(planet.nakshatraPada).toBeGreaterThanOrEqual(1);
                expect(planet.nakshatraPada).toBeLessThanOrEqual(4);
                expect(planet.nakshatra).toBeDefined();
                expect(typeof planet.nakshatra).toBe('string');
            });
        });
    });
});
