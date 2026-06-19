import { AshtakavargaCalculator, VedicAstrologyCalculator } from '../../src';
import { Nakshatra, Planet, PlanetPosition, ZodiacSign } from '../../src';

const mockPlanetData = {
    longitude: Math.floor(Math.random() * 360), // Random longitude between 0 and 360
    latitude: 0,
    degree: 0,
    degreeDMS: { degrees: 0, minutes: 0, seconds: 0 },
    degreeDMSFormatted: '00:00:00"',
    nakshatra: 'magha' as Nakshatra,
    nakshatraPada: 1,
    pada: 1,
    isRetrograde: false,
    isCombust: false,
    speed: 1.0,
    dignity: 'own_sign' as const,
    aspects: []
};

describe(AshtakavargaCalculator.name, () => {
    describe('test person 1', () => {
        /* Mock birth info for test person 1
         *  name: 'Test Person',
         *  dateOfBirth: '1990-06-15',
         *  timeOfBirth: '13:00',
         *  latitude: 40,
         *  longitude: -74,
         *  timezone: 'America/New_York'
         */

        // Mock planet positions for testing
        const mockPlanets: Record<Planet | 'lagna', PlanetPosition> = {
            sun: {
                name: 'sun',
                house: 10,
                sign: 'gemini',
                ...mockPlanetData
            },
            moon: {
                name: 'moon',
                house: 6,
                sign: 'aquarius',
                ...mockPlanetData
            },
            mars: {
                name: 'mars',
                house: 7,
                sign: 'pisces',
                ...mockPlanetData
            },
            mercury: {
                name: 'mercury',
                house: 9,
                sign: 'taurus',
                ...mockPlanetData
            },
            jupiter: {
                name: 'jupiter',
                house: 10,
                sign: 'gemini',
                ...mockPlanetData
            },
            venus: {
                name: 'venus',
                house: 8,
                sign: 'aries',
                ...mockPlanetData
            },
            saturn: {
                name: 'saturn',
                house: 5,
                sign: 'capricorn',
                ...mockPlanetData
            },
            rahu: {
                name: 'rahu',
                house: 5,
                sign: 'capricorn',
                ...mockPlanetData
            },
            ketu: {
                name: 'ketu',
                house: 11,
                sign: 'cancer',
                ...mockPlanetData
            },
            lagna: {
                name: 'lagna',
                house: 1,
                sign: 'virgo',
                ...mockPlanetData
            }
        };
        const lagnaSign = 'virgo' as ZodiacSign;
        const chartCalculations = {
            planets: mockPlanets,
            ascendant: {
                sign: lagnaSign,
            }
        };

        it('should calculate binna ashtakavarga correctly', () => {
            const vedicAstrologyCalculator = new VedicAstrologyCalculator();
            const result = vedicAstrologyCalculator.calculateAshtakavarga(chartCalculations as any);

            expect(result.bhinna.sun.sun).toEqual([/*sco*/ 1, /*sag*/ 1, /*cap*/0, /*aqu*/ 1, /*pis*/ 0, /*ari*/ 0, /*tau*/ 1, /*gem*/ 1, /*can*/ 1, /*leo*/ 1, /*vir*/ 1, /*lib*/ 0]);
            expect(result.bhinna.sun.moon).toEqual(   [0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0]);
            expect(result.bhinna.sun.mercury).toEqual([0, 1, 0, 1, 1, 0, 0, 1, 1, 1, 1, 0]);
            expect(result.bhinna.sun.saturn).toEqual( [0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 0]);
            expect(result.bhinna.sun.mars).toEqual(   [1, 0, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0]);
            expect(result.bhinna.sun.jupiter).toEqual([0, 0, 0, 0, 1, 1, 0, 0, 1, 0, 1, 0]);
            expect(result.bhinna.sun.venus).toEqual(  [0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0]);
            expect(result.bhinna.sun.lagna).toEqual(  [1, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 0]);

            expect(result.bhinna.moon.sun).toEqual([0, 1, 1, 0, 0, 0, 1, 0, 0, 1, 1, 1]);
            expect(result.bhinna.moon.moon).toEqual([1, 0, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0]);
            expect(result.bhinna.moon.mercury).toEqual([1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0]);
            expect(result.bhinna.moon.saturn).toEqual([0, 1, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0]);
            expect(result.bhinna.moon.mars).toEqual([0, 0, 1, 1, 0, 1, 1, 0, 0, 1, 1, 1]);
            expect(result.bhinna.moon.jupiter).toEqual([0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 1]);
            expect(result.bhinna.moon.venus).toEqual([1, 0, 0, 0, 1, 1, 1, 0, 1, 0, 1, 1]);
            expect(result.bhinna.moon.lagna).toEqual([1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0]);

            expect(result.bhinna.mars.sun).toEqual([1, 1, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0]);
            expect(result.bhinna.mars.moon).toEqual([0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0]);
            expect(result.bhinna.mars.mercury).toEqual([1, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0]);
            expect(result.bhinna.mars.saturn).toEqual([0, 1, 0, 0, 1, 1, 1, 1, 1, 0, 1, 0]);
            expect(result.bhinna.mars.mars).toEqual([1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 1, 0]);
            expect(result.bhinna.mars.jupiter).toEqual([1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0]);
            expect(result.bhinna.mars.venus).toEqual([1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1]);
            expect(result.bhinna.mars.lagna).toEqual([0, 0, 0, 1, 1, 0, 1, 0, 1, 0, 0, 1]);

            expect(result.bhinna.mercury.sun).toEqual([1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0, 1]);
            expect(result.bhinna.mercury.moon).toEqual([1, 0, 1, 0, 1, 0, 1, 1, 0, 0, 1, 0]);
            expect(result.bhinna.mercury.mercury).toEqual([1, 0, 1, 0, 1, 1, 0, 0, 1, 1, 1, 1]);
            expect(result.bhinna.mercury.saturn).toEqual([0, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1]);
            expect(result.bhinna.mercury.mars).toEqual([0, 1, 0, 0, 1, 1, 1, 1, 1, 0, 1, 1]);
            expect(result.bhinna.mercury.jupiter).toEqual([1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1]);
            expect(result.bhinna.mercury.venus).toEqual([1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 0, 1]);
            expect(result.bhinna.mercury.lagna).toEqual([0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1]);

            expect(result.bhinna.saturn.sun).toEqual([1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 0, 1]);
            expect(result.bhinna.saturn.moon).toEqual([0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1]);
            expect(result.bhinna.saturn.mercury).toEqual([1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 1]);
            expect(result.bhinna.saturn.saturn).toEqual([0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 1, 0]);
            expect(result.bhinna.saturn.mars).toEqual([1, 1, 0, 0, 1, 0, 1, 1, 0, 0, 0, 1]);
            expect(result.bhinna.saturn.jupiter).toEqual([0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0]);
            expect(result.bhinna.saturn.venus).toEqual([0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0]);
            expect(result.bhinna.saturn.lagna).toEqual([0, 1, 0, 0, 0, 1, 1, 0, 1, 0, 1, 1]);

            expect(result.bhinna.jupiter.sun).toEqual([1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0]);
            expect(result.bhinna.jupiter.mercury).toEqual([1, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 1]);
            expect(result.bhinna.jupiter.saturn).toEqual([1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1]);
            expect(result.bhinna.jupiter.mars).toEqual([1, 0, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0]);
            expect(result.bhinna.jupiter.jupiter).toEqual([1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 1, 0]);
            expect(result.bhinna.jupiter.venus).toEqual([0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1]);
            expect(result.bhinna.jupiter.moon).toEqual([1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0]);
            expect(result.bhinna.jupiter.lagna).toEqual([1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1]);

            expect(result.bhinna.venus.sun).toEqual([1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0]);
            expect(result.bhinna.venus.mercury).toEqual([0, 0, 0, 1, 0, 1, 1, 0, 0, 1, 0, 1]);
            expect(result.bhinna.venus.saturn).toEqual([1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1]);
            expect(result.bhinna.venus.mars).toEqual([0, 1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0]);
            expect(result.bhinna.venus.jupiter).toEqual([1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1]);
            expect(result.bhinna.venus.venus).toEqual([1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0]);
            expect(result.bhinna.venus.moon).toEqual([1, 1, 1, 0, 0, 1, 1, 0, 1, 1, 1, 1]);
            expect(result.bhinna.venus.lagna).toEqual([1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 0]);
            
            expect(result.bhinna.lagna.sun).toEqual([1, 0, 1, 0, 0, 0, 1, 1, 1, 0, 0, 1]);
            expect(result.bhinna.lagna.mercury).toEqual([0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1]);
            expect(result.bhinna.lagna.saturn).toEqual([0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0]);
            expect(result.bhinna.lagna.mars).toEqual([0, 0, 0, 1, 1, 0, 1, 0, 1, 0, 0, 1]);
            expect(result.bhinna.lagna.jupiter).toEqual([1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0]);
            expect(result.bhinna.lagna.venus).toEqual([0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1]);
            expect(result.bhinna.lagna.moon).toEqual([0, 0, 1, 1, 1, 0, 0, 1, 0, 0, 1, 0]);
            expect(result.bhinna.lagna.lagna).toEqual([0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 1, 0]);
        });

        it('should calculate sarva ashtakavarga correctly', () => {
            const vedicAstrologyCalculator = new VedicAstrologyCalculator();
            const result = vedicAstrologyCalculator.calculateAshtakavarga(chartCalculations as any);

            expect(result.sarva.sun).toEqual([6, 0, 3, 5, 2, 5, 5, 5, 4, 4, 5, 4]);
            expect(result.sarva.moon).toEqual([4, 4, 4, 5, 5, 2, 1, 6, 6, 4, 4, 4]);
            expect(result.sarva.mercury).toEqual([7, 5, 3, 5, 2, 5, 5, 6, 4, 4, 5, 3]);
            expect(result.sarva.saturn).toEqual([4, 3, 3, 4, 1, 3, 2, 3, 5, 3, 4, 4]);
            expect(result.sarva.mars).toEqual([5, 1, 2, 4, 2, 5, 4, 5, 2, 2, 2, 5]);
            expect(result.sarva.jupiter).toEqual([3, 4, 7, 3, 5, 6, 4, 0, 7, 6, 4, 7]);
            expect(result.sarva.venus).toEqual([6, 6, 2, 4, 3, 4, 5, 4, 3, 7, 4, 4]);
            expect(result.sarva.lagna).toEqual([5, 4, 5, 4, 4, 2, 3, 6, 5, 3, 3, 5]);
        });
    });
});
