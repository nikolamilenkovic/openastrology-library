import { AshtakavargaCalculator } from '../../src';
import { Planet, PlanetPosition, ZodiacSign } from '../../src';

describe(AshtakavargaCalculator.name, () => {
    // Mock planet positions for testing
    const mockPlanets: Record<Planet, PlanetPosition> = {
        sun: {
            name: 'sun',
            longitude: 120, // 0° Leo (5th sign)
            latitude: 0,
            sign: 'leo' as ZodiacSign,
            degree: 0,
            degreeDMS: { degrees: 0, minutes: 0, seconds: 0 },
            degreeDMSFormatted: '0°00\'00"',
            nakshatra: 'magha',
            nakshatraPada: 1,
            pada: 1,
            house: 5,
            isRetrograde: false,
            isCombust: false,
            speed: 1.0,
            dignity: 'Own Sign',
            aspects: []
        },
        moon: {
            name: 'moon',
            longitude: 60, // 0° Gemini (3rd sign)
            latitude: 0,
            sign: 'gemini' as ZodiacSign,
            degree: 0,
            degreeDMS: { degrees: 0, minutes: 0, seconds: 0 },
            degreeDMSFormatted: '0°00\'00"',
            nakshatra: 'mrigashira',
            nakshatraPada: 1,
            pada: 1,
            house: 3,
            isRetrograde: false,
            isCombust: false,
            speed: 13.0,
            dignity: 'Neutral',
            aspects: []
        },
        mars: {
            name: 'mars',
            longitude: 0, // 0° Aries (1st sign)
            latitude: 0,
            sign: 'aries' as ZodiacSign,
            degree: 0,
            degreeDMS: { degrees: 0, minutes: 0, seconds: 0 },
            degreeDMSFormatted: '0°00\'00"',
            nakshatra: 'ashwini',
            nakshatraPada: 1,
            pada: 1,
            house: 1,
            isRetrograde: false,
            isCombust: false,
            speed: 0.5,
            dignity: 'Own Sign',
            aspects: []
        },
        mercury: {
            name: 'mercury',
            longitude: 150, // 0° Virgo (6th sign)
            latitude: 0,
            sign: 'virgo' as ZodiacSign,
            degree: 0,
            degreeDMS: { degrees: 0, minutes: 0, seconds: 0 },
            degreeDMSFormatted: '0°00\'00"',
            nakshatra: 'hasta',
            nakshatraPada: 1,
            pada: 1,
            house: 6,
            isRetrograde: false,
            isCombust: false,
            speed: 1.5,
            dignity: 'Own Sign',
            aspects: []
        },
        jupiter: {
            name: 'jupiter',
            longitude: 90, // 0° Cancer (4th sign)
            latitude: 0,
            sign: 'cancer' as ZodiacSign,
            degree: 0,
            degreeDMS: { degrees: 0, minutes: 0, seconds: 0 },
            degreeDMSFormatted: '0°00\'00"',
            nakshatra: 'pushya',
            nakshatraPada: 1,
            pada: 1,
            house: 4,
            isRetrograde: false,
            isCombust: false,
            speed: 0.08,
            dignity: 'Exalted',
            aspects: []
        },
        venus: {
            name: 'venus',
            longitude: 330, // 0° Pisces (12th sign)
            latitude: 0,
            sign: 'pisces' as ZodiacSign,
            degree: 0,
            degreeDMS: { degrees: 0, minutes: 0, seconds: 0 },
            degreeDMSFormatted: '0°00\'00"',
            nakshatra: 'revati',
            nakshatraPada: 1,
            pada: 1,
            house: 12,
            isRetrograde: false,
            isCombust: false,
            speed: 1.2,
            dignity: 'Exalted',
            aspects: []
        },
        saturn: {
            name: 'saturn',
            longitude: 180, // 0° Libra (7th sign)
            latitude: 0,
            sign: 'libra' as ZodiacSign,
            degree: 0,
            degreeDMS: { degrees: 0, minutes: 0, seconds: 0 },
            degreeDMSFormatted: '0°00\'00"',
            nakshatra: 'chitra',
            nakshatraPada: 1,
            pada: 1,
            house: 7,
            isRetrograde: false,
            isCombust: false,
            speed: 0.03,
            dignity: 'Exalted',
            aspects: []
        },
        rahu: {
            name: 'rahu',
            longitude: 240, // 0° Sagittarius (9th sign)
            latitude: 0,
            sign: 'sagittarius' as ZodiacSign,
            degree: 0,
            degreeDMS: { degrees: 0, minutes: 0, seconds: 0 },
            degreeDMSFormatted: '0°00\'00"',
            nakshatra: 'moola',
            nakshatraPada: 1,
            pada: 1,
            house: 9,
            isRetrograde: true,
            isCombust: false,
            speed: -0.05,
            dignity: 'Neutral',
            aspects: []
        },
        ketu: {
            name: 'ketu',
            longitude: 60, // 0° Gemini (3rd sign) - 180° from Rahu
            latitude: 0,
            sign: 'gemini' as ZodiacSign,
            degree: 0,
            degreeDMS: { degrees: 0, minutes: 0, seconds: 0 },
            degreeDMSFormatted: '0°00\'00"',
            nakshatra: 'mrigashira',
            nakshatraPada: 1,
            pada: 1,
            house: 3,
            isRetrograde: true,
            isCombust: false,
            speed: -0.05,
            dignity: 'Neutral',
            aspects: []
        }
    };

    const ascendantLongitude = 0; // 0° Aries

    test('should calculate Ashtakavarga correctly', () => {
        const result = AshtakavargaCalculator.calculateAshtakavarga(mockPlanets, 'aries');

        expect(result).toBeDefined();
        expect(result.bhinna).toBeDefined();
        expect(result.sarva).toBeDefined();

        // Check that each planet/lagna has Bhinna Ashtakavarga data (nested structure)
        const contributors = [...Object.keys(mockPlanets), 'lagna'] as (Planet | 'lagna')[];
        for (const contributor of contributors) {
            expect(result.bhinna[contributor]).toBeDefined();
            expect(typeof result.bhinna[contributor]).toBe('object');

            // Check each target planet has an array of 12 values
            for (const targetPlanet of Object.keys(mockPlanets) as Planet[]) {
                expect(result.bhinna[contributor][targetPlanet]).toBeDefined();
                expect(Array.isArray(result.bhinna[contributor][targetPlanet])).toBe(true);
                expect(result.bhinna[contributor][targetPlanet]).toHaveLength(12);
                // Each value should be 0 or 1 (points assigned to that house)
                result.bhinna[contributor][targetPlanet].forEach(points => {
                    expect(points).toBeGreaterThanOrEqual(0);
                    expect(points).toBeLessThanOrEqual(1);
                });
            }
        }

        // Check that each planet/lagna has Sarva Ashtakavarga data (nested structure)
        for (const contributor of contributors) {
            if (contributor === 'rahu' || contributor === 'ketu') {
                // Rahu and Ketu are not contributors in Sarva
                expect(result.sarva[contributor]).toBeUndefined();
                continue;
            }

            expect(result.sarva[contributor]).toBeDefined();
            expect(typeof result.sarva[contributor]).toBe('object');

            expect(Array.isArray(result.sarva[contributor])).toBe(true);
            expect(result.sarva[contributor]).toHaveLength(12);
            // Each value should be 0 or 1
            result.sarva[contributor].forEach(points => {
                expect(points).toBeGreaterThanOrEqual(0);
            });
        }
    });

    test('should calculate summary statistics correctly', () => {
        const ashtakavarga = AshtakavargaCalculator.calculateAshtakavarga(mockPlanets, 'aries');
        const summary = AshtakavargaCalculator.getAshtakavargaSummary(ashtakavarga);

        expect(summary).toBeDefined();
        expect(summary.totalPoints).toBeGreaterThan(0);
        expect(summary.strongestPlanet).toBeDefined();
        expect(summary.weakestPlanet).toBeDefined();
        expect(summary.strongestHouse).toBeDefined();
        expect(summary.weakestHouse).toBeDefined();
        expect(summary.averagePoints).toBeGreaterThan(0);

        // Strongest planet should have more points than weakest
        expect(summary.strongestPlanet.points).toBeGreaterThanOrEqual(summary.weakestPlanet.points);
        expect(summary.strongestHouse.points).toBeGreaterThanOrEqual(summary.weakestHouse.points);
    });

    test('should have consistent point distribution', () => {
        const ashtakavarga = AshtakavargaCalculator.calculateAshtakavarga(mockPlanets, 'aries');

        // Calculate total points in Bhinna (sum all points assigned by all contributors)
        const contributors = [...Object.keys(mockPlanets), 'lagna'] as (Planet | 'lagna')[];
        for (const contributor of contributors) {
            if (contributor === 'rahu' || contributor === 'ketu') {
                // Rahu and Ketu are not contributors in Sarva
                continue;
            }
            
            let bhinnaTotal = 0;
            for (const targetPlanet of [...Object.keys(mockPlanets), 'lagna'] as Array<Planet | 'lagna'>) {
                const contributorTotal = ashtakavarga.bhinna[contributor][targetPlanet].reduce((sum, points) => sum + points, 0);
                bhinnaTotal += contributorTotal;
            }

            const sarvaTotal = ashtakavarga.sarva[contributor].reduce((sum, points) => sum + points, 0);
            expect(bhinnaTotal).toEqual(sarvaTotal);
        }
    });
});
