import { VedicAstrologyCalculator } from '../../src';
import { BirthInfo } from '../../src';
import { FormattingUtils } from '../../src';

// Mock swisseph module
jest.mock('swisseph', () => ({
    SE_SUN: 0,
    SE_MOON: 1,
    SE_MERCURY: 2,
    SE_VENUS: 3,
    SE_MARS: 4,
    SE_JUPITER: 5,
    SE_SATURN: 6,
    SE_MEAN_NODE: 10,
    SE_TRUE_NODE: 11,
    SE_GREG_CAL: 1,
    SEFLG_SIDEREAL: 64,
    SE_SIDM_LAHIRI: 1,
    SE_SIDM_RAMAN: 2,
    SE_SIDM_KRISHNAMURTI: 3,
    SE_SIDM_YUKTESHWAR: 4,
    SE_SIDM_JN_BHASIN: 5,
    SE_SIDM_BABYL_KUGLER1: 6,
    SE_SIDM_TRUE_CITRA: 7,
    SE_SIDM_TRUE_REVATI: 8,
    SE_SIDM_TRUE_PUSHYA: 9,
    
    swe_set_ephe_path: jest.fn(),
    swe_set_sid_mode: jest.fn(),
    swe_get_ayanamsa: jest.fn().mockReturnValue(23.727222), // 23:43:38 from Parashara's Light
    swe_julday: jest.fn().mockReturnValue(2448059.041667), // Correct Julian day for 1990-06-15 13:00 UTC
    swe_calc: jest.fn().mockImplementation((jd: number, planet: number, flags: number) => {
        // Mock planetary positions based on planet ID - using SIDEREAL positions from Parashara's Light
        switch (planet) {
            case 0: // Sun
                return {
                    longitude: 60.601389, // 60:36:05 in Gemini (sidereal)
                    latitude: 0.0,
                    distance: 1.0,
                    longitudeSpeed: 1.0,
                    speed_longitude: 1.0,
                    latitudeSpeed: 0.0,
                    speed_latitude: 0.0,
                    distanceSpeed: 0.0,
                    speed_distance: 0.0,
                    rflag: 64
                };
            case 1: // Moon
                return {
                    longitude: 324.422222, // 324:25:20 in Aquarius (sidereal)
                    latitude: 0.0,
                    distance: 1.0,
                    longitudeSpeed: 13.2,
                    speed_longitude: 13.2,
                    latitudeSpeed: 0.0,
                    speed_latitude: 0.0,
                    distanceSpeed: 0.0,
                    speed_distance: 0.0,
                    rflag: 64
                };
            case 11: // Rahu (SE_TRUE_NODE)
                return {
                    longitude: 284.396944, // 284:23:49 (sidereal)
                    latitude: 0.0,
                    distance: 1.0,
                    longitudeSpeed: -0.05,
                    speed_longitude: -0.05,
                    latitudeSpeed: 0.0,
                    speed_latitude: 0.0,
                    distanceSpeed: 0.0,
                    speed_distance: 0.0,
                    rflag: 64
                };
            default:
                return {
                    longitude: 100 + planet * 30,
                    latitude: 0.0,
                    distance: 1.0,
                    longitudeSpeed: 1.0,
                    speed_longitude: 1.0,
                    latitudeSpeed: 0.0,
                    speed_latitude: 0.0,
                    distanceSpeed: 0.0,
                    speed_distance: 0.0,
                    rflag: 64
                };
        }
    }),
    swe_houses: jest.fn().mockReturnValue({
        // Equal house cusps starting from Virgo ascendant (150° + 6.15° = 156.15°)
        // In tropical, ascendant would be ~180° (Virgo in sidereal = Libra in tropical + ayanamsa)
        // Tropical ascendant ≈ 156.15 + 23.727 ≈ 179.877° (start of Libra)
        // These are TROPICAL house cusps, will be converted to sidereal by subtracting ayanamsa
        house: [179.877, 209.877, 239.877, 269.877, 299.877, 329.877, 359.877, 29.877, 59.877, 89.877, 119.877, 149.877],
        ascendant: 179.877, // Tropical ascendant (will be converted to sidereal: 179.877 - 23.727 = 156.15° in Virgo)
        mc: 119.877
    }),
    swe_close: jest.fn()
}));

describe(VedicAstrologyCalculator.name, () => {
    let calculator: VedicAstrologyCalculator;
    let mockBirthInfo: BirthInfo;

    const dms2def = FormattingUtils.formattedDMStoDegrees;

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

    afterEach(() => {
        calculator.dispose();
    });

    describe('calculateChart', () => {
        it('should calculate a complete birth chart', async () => {
            const result = await calculator.calculateChart(mockBirthInfo);

            expect(result).toBeDefined();
            expect(result.planets).toBeDefined();
            expect(result.houses).toBeDefined();
            expect(result.yogas).toBeDefined();
            expect(result.dashas).toBeDefined();
            expect(result.ascendant).toBeDefined();
            expect(result.ayanamsa).toBeWithinEpsilon(dms2def('23:43:38'), 0.1);
            
            // Check that planets have aspects calculated
            Object.values(result.planets).forEach(planet => {
                expect(planet.aspects).toBeDefined();
                expect(Array.isArray(planet.aspects)).toBe(true);
            });
        });

        it('should calculate planetary positions correctly', async () => {
            const result = await calculator.calculateChart(mockBirthInfo);

            // Check Sun position
            expect(result.planets.sun).toBeDefined();
            expect(result.planets.sun.name).toBe('sun');
            expect(result.planets.sun.longitude).toBeWithinEpsilon(dms2def('60:36:05'), 0.1);
            expect(result.planets.sun.sign).toBe('gemini');
            expect(result.planets.sun.degree).toBeWithinEpsilon(dms2def('00:36:05'), 0.1);
            expect(result.planets.sun.isRetrograde).toBe(false);

            // Check Moon position
            expect(result.planets.moon).toBeDefined();
            expect(result.planets.moon.name).toBe('moon');
            expect(result.planets.moon.longitude).toBeWithinEpsilon(dms2def('324:25:20'), 0.1);
            expect(result.planets.moon.sign).toBe('aquarius');
            expect(result.planets.moon.isRetrograde).toBe(false);

            // Check Rahu position
            // Note: Astronomy-engine (VSOP87) has slightly different lunar node precision than Swiss Ephemeris (JPL)
            // Tolerance increased to 0.15° to account for this difference
            expect(result.planets.rahu).toBeDefined();
            expect(result.planets.rahu.longitude).toBeWithinEpsilon(dms2def('284:23:49'), 0.15);
            expect(result.planets.rahu.isRetrograde).toBe(true); // Rahu is always retrograde

            // Check Ketu position (180 degrees from Rahu)
            expect(result.planets.ketu).toBeDefined();
            expect(result.planets.ketu.longitude).toBeWithinEpsilon(dms2def('104:23:49'), 0.15);
        });

        it('should calculate houses correctly', async () => {
            const result = await calculator.calculateChart(mockBirthInfo);

            // Check first house (should match ascendant for equal house system)
            expect(result.houses['1']).toBeDefined();
            expect(result.houses['1'].number).toBe(1);
            expect(result.houses['1'].cusp).toBeCloseTo(result.ascendant.longitude, 0.1);
            expect(result.houses['1'].sign).toBe('virgo');

            // Check all 12 houses are present
            for (let i = 1; i <= 12; i++) {
                expect(result.houses[i as keyof typeof result.houses]).toBeDefined();
            }
        });

        it('should calculate ascendant correctly', async () => {
            const result = await calculator.calculateChart(mockBirthInfo);

            expect(result.ascendant.sign).toBe('virgo');
            expect(result.ascendant.degree).toBeWithinEpsilon(dms2def('06:09:00'), 0.1); // 6°09' in Virgo
            expect(result.ascendant.nakshatra).toBeDefined();
        });

        it('should assign planets to houses correctly', async () => {
            const result = await calculator.calculateChart(mockBirthInfo);

            // Verify planets are assigned to houses
            Object.values(result.planets).forEach(planet => {
                expect(planet.house).toBeGreaterThanOrEqual(1);
                expect(planet.house).toBeLessThanOrEqual(12);
            });

            // Check that houses contain the assigned planets
            Object.values(result.houses).forEach(house => {
                house.planets.forEach(planetName => {
                    const planet = result.planets[planetName as keyof typeof result.planets];
                    expect(planet.house).toBe(house.number);
                });
            });
        });

        it('should handle different ayanamsa settings', async () => {
            calculator.dispose();
            const calculatorLahiri = new VedicAstrologyCalculator({ ayanamsa: 'lahiri' });
            const resultLahiri = await calculatorLahiri.calculateChart(mockBirthInfo);
            calculatorLahiri.dispose();

            const calculatorRaman = new VedicAstrologyCalculator({ ayanamsa: 'raman' });
            const resultRaman = await calculatorRaman.calculateChart(mockBirthInfo);
            calculatorRaman.dispose();

            expect(resultLahiri).toBeDefined();
            expect(resultRaman).toBeDefined();
            // Both should return valid results (actual differences would depend on real ephemeris)
        });

        it('should handle different house systems', async () => {
            calculator.dispose();
            const calculatorPlacidus = new VedicAstrologyCalculator({ ayanamsa: 'lahiri', houseSystem: 'placidus' });
            const resultPlacidus = await calculatorPlacidus.calculateChart(mockBirthInfo);
            calculatorPlacidus.dispose();

            const calculatorKoch = new VedicAstrologyCalculator({ ayanamsa: 'lahiri', houseSystem: 'koch' });
            const resultKoch = await calculatorKoch.calculateChart(mockBirthInfo);
            calculatorKoch.dispose();

            expect(resultPlacidus).toBeDefined();
            expect(resultKoch).toBeDefined();
            // Both should return valid results
        });

        it('should calculate planetary dignities correctly', async () => {
            const result = await calculator.calculateChart(mockBirthInfo);

            // Check that all planets have dignity assigned
            Object.values(result.planets).forEach(planet => {
                expect(planet.dignity).toBeDefined();
                expect(['Exalted', 'Debilitated', 'Own Sign', 'Neutral']).toContain(planet.dignity);
            });
        });

        it('should calculate nakshatras correctly', async () => {
            const result = await calculator.calculateChart(mockBirthInfo);

            Object.values(result.planets).forEach(planet => {
                expect(planet.nakshatra).toBeDefined();
                expect(planet.nakshatraPada).toBeGreaterThanOrEqual(1);
                expect(planet.nakshatraPada).toBeLessThanOrEqual(4);
                expect(planet.pada).toBe(planet.nakshatraPada);
            });
        });

        it('should calculate dashas', async () => {
            const result = await calculator.calculateChart(mockBirthInfo);

            expect(result.dashas).toBeDefined();
            expect(result.dashas.vimshottari).toBeDefined();
            expect(result.dashas.vimshottari.dashaPeriods).toHaveLength(9);
        });
    });

    describe('error handling', () => {
        it('should handle invalid birth date', async () => {
            const invalidBirthInfo = {
                ...mockBirthInfo,
                dateOfBirth: 'invalid-date'
            };

            await expect(calculator.calculateChart(invalidBirthInfo)).rejects.toThrow();
        });

        it('should handle missing time of birth', async () => {
            const noTimeBirthInfo = {
                ...mockBirthInfo,
                timeOfBirth: ''
            };

            const result = await calculator.calculateChart(noTimeBirthInfo);
            expect(result).toBeDefined();
        });

        it('should handle invalid coordinates', async () => {
            const invalidCoordsBirthInfo = {
                ...mockBirthInfo,
                latitude: 200, // Invalid latitude
                longitude: 400 // Invalid longitude
            };

            // Should reject invalid coordinates with proper validation
            await expect(calculator.calculateChart(invalidCoordsBirthInfo)).rejects.toThrow('Latitude must be a number between -90 and 90');
        });
    });

    describe('utility methods', () => {
        it('should calculate Julian Day correctly', async () => {
            // Access private method through any casting for testing
            const { julianDay } = (calculator as any).calculateJulianDay(mockBirthInfo);
            
            // Julian Day for 1990-06-15 13:00 UTC
            expect(julianDay).toBeCloseTo(2448059.041667, 1);
        });

        it('should find correct house for planet', async () => {
            const houseCusps = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
            
            // Test planet at 45 degrees (should be in house 2)
            const house = (calculator as any).findHouseForPlanet(45, houseCusps);
            expect(house).toBe(2);
            
            // Test planet at 195 degrees (should be in house 7)
            const house2 = (calculator as any).findHouseForPlanet(195, houseCusps);
            expect(house2).toBe(7);
        });

        it('should calculate planetary dignity correctly', async () => {
            // Sun in Aries (exalted)
            const dignity1 = (calculator as any).calculatePlanetaryDignity('sun', 'aries');
            expect(dignity1).toBe('Exalted');
            
            // Sun in Libra (debilitated)
            const dignity2 = (calculator as any).calculatePlanetaryDignity('sun', 'libra');
            expect(dignity2).toBe('Debilitated');
            
            // Sun in Leo (own sign)
            const dignity3 = (calculator as any).calculatePlanetaryDignity('sun', 'leo');
            expect(dignity3).toBe('Own Sign');
            
            // Sun in Gemini (neutral)
            const dignity4 = (calculator as any).calculatePlanetaryDignity('sun', 'gemini');
            expect(dignity4).toBe('Neutral');
        });
    });
});
