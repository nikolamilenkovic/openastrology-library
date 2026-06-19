import { AspectCalculator } from '../../src';
import { Planet, PlanetPosition, PlanetAspect, HouseNumber } from '../../src';

describe('AspectCalculator', () => {
    describe('calculateVedicAspects', () => {
        it('should initialize empty aspects array for all planets', () => {
            // Arrange
            const planetPositions: Record<Planet, PlanetPosition> = {
                sun: createMockPlanetPosition('sun', 1),
                moon: createMockPlanetPosition('moon', 2),
                mars: createMockPlanetPosition('mars', 3),
                mercury: createMockPlanetPosition('mercury', 4),
                jupiter: createMockPlanetPosition('jupiter', 5),
                venus: createMockPlanetPosition('venus', 6),
                saturn: createMockPlanetPosition('saturn', 7),
                rahu: createMockPlanetPosition('rahu', 8),
                ketu: createMockPlanetPosition('ketu', 9)
            };

            // Act
            AspectCalculator.calculateVedicAspects(planetPositions);

            // Assert
            Object.values(planetPositions).forEach(planet => {
                expect(planet.aspects).toBeDefined();
                expect(Array.isArray(planet.aspects)).toBe(true);
            });
        });

        it('should calculate correct aspects for Sun (7th house aspect)', () => {
            // Arrange
            const planetPositions: Record<Planet, PlanetPosition> = {
                sun: createMockPlanetPosition('sun', 1), // Sun in house 1
                moon: createMockPlanetPosition('moon', 7), // Moon in house 7 (opposite to Sun)
                mars: createMockPlanetPosition('mars', 3),
                mercury: createMockPlanetPosition('mercury', 4),
                jupiter: createMockPlanetPosition('jupiter', 5),
                venus: createMockPlanetPosition('venus', 6),
                saturn: createMockPlanetPosition('saturn', 8),
                rahu: createMockPlanetPosition('rahu', 9),
                ketu: createMockPlanetPosition('ketu', 10)
            };

            // Act
            AspectCalculator.calculateVedicAspects(planetPositions);

            // Assert
            expect(planetPositions.sun.aspects).toHaveLength(1);
            expect(planetPositions.sun.aspects[0]).toEqual({
                house: 7,
                aspect: 7,
                planets: ['moon']
            });
        });

        it('should calculate correct aspects for Mars (4th, 7th, 8th house aspects)', () => {
            // Arrange
            const planetPositions: Record<Planet, PlanetPosition> = {
                sun: createMockPlanetPosition('sun', 1),
                moon: createMockPlanetPosition('moon', 2),
                mars: createMockPlanetPosition('mars', 3), // Mars in house 3
                mercury: createMockPlanetPosition('mercury', 6), // Mercury in house 6 (4th from Mars)
                jupiter: createMockPlanetPosition('jupiter', 9), // Jupiter in house 9 (7th from Mars)
                venus: createMockPlanetPosition('venus', 10), // Venus in house 10 (8th from Mars)
                saturn: createMockPlanetPosition('saturn', 7),
                rahu: createMockPlanetPosition('rahu', 8),
                ketu: createMockPlanetPosition('ketu', 11)
            };

            // Act
            AspectCalculator.calculateVedicAspects(planetPositions);

            // Assert
            expect(planetPositions.mars.aspects).toHaveLength(3);
            
            const aspect4th = planetPositions.mars.aspects.find(a => a.aspect === 4);
            const aspect7th = planetPositions.mars.aspects.find(a => a.aspect === 7);
            const aspect8th = planetPositions.mars.aspects.find(a => a.aspect === 8);
            
            expect(aspect4th).toEqual({
                house: 6,
                aspect: 4,
                planets: ['mercury']
            });
            
            expect(aspect7th).toEqual({
                house: 9,
                aspect: 7,
                planets: ['jupiter']
            });
            
            expect(aspect8th).toEqual({
                house: 10,
                aspect: 8,
                planets: ['venus']
            });
        });

        it('should calculate correct aspects for Jupiter (5th, 7th, 9th house aspects)', () => {
            // Arrange
            const planetPositions: Record<Planet, PlanetPosition> = {
                sun: createMockPlanetPosition('sun', 1), // Sun in house 1 (9th from Jupiter)
                moon: createMockPlanetPosition('moon', 2),
                mars: createMockPlanetPosition('mars', 3),
                mercury: createMockPlanetPosition('mercury', 4),
                jupiter: createMockPlanetPosition('jupiter', 5), // Jupiter in house 5
                venus: createMockPlanetPosition('venus', 9), // Venus in house 9 (5th from Jupiter)
                saturn: createMockPlanetPosition('saturn', 11), // Saturn in house 11 (7th from Jupiter)
                rahu: createMockPlanetPosition('rahu', 8), // Rahu in house 8
                ketu: createMockPlanetPosition('ketu', 7) // Ketu in house 7
            };

            // Act
            AspectCalculator.calculateVedicAspects(planetPositions);

            // Assert
            expect(planetPositions.jupiter.aspects).toHaveLength(3);
            
            const aspect5th = planetPositions.jupiter.aspects.find(a => a.aspect === 5);
            const aspect7th = planetPositions.jupiter.aspects.find(a => a.aspect === 7);
            const aspect9th = planetPositions.jupiter.aspects.find(a => a.aspect === 9);
            
            expect(aspect5th).toEqual({
                house: 9,
                aspect: 5,
                planets: ['venus']
            });
            
            expect(aspect7th).toEqual({
                house: 11,
                aspect: 7,
                planets: ['saturn']
            });
            
            expect(aspect9th).toEqual({
                house: 1,
                aspect: 9,
                planets: ['sun']
            });
        });

        it('should calculate correct aspects for Saturn (3rd, 7th, 10th house aspects)', () => {
            // Arrange
            const planetPositions: Record<Planet, PlanetPosition> = {
                sun: createMockPlanetPosition('sun', 1),
                moon: createMockPlanetPosition('moon', 2),
                mars: createMockPlanetPosition('mars', 3), // Mars in house 3 (3rd from Saturn)
                mercury: createMockPlanetPosition('mercury', 4),
                jupiter: createMockPlanetPosition('jupiter', 5),
                venus: createMockPlanetPosition('venus', 6),
                saturn: createMockPlanetPosition('saturn', 1), // Saturn in house 1
                rahu: createMockPlanetPosition('rahu', 7), // Rahu in house 7 (7th from Saturn)
                ketu: createMockPlanetPosition('ketu', 10) // Ketu in house 10 (10th from Saturn)
            };

            // Act
            AspectCalculator.calculateVedicAspects(planetPositions);

            // Assert
            expect(planetPositions.saturn.aspects).toHaveLength(3);
            
            const aspect3rd = planetPositions.saturn.aspects.find(a => a.aspect === 3);
            const aspect7th = planetPositions.saturn.aspects.find(a => a.aspect === 7);
            const aspect10th = planetPositions.saturn.aspects.find(a => a.aspect === 10);
            
            expect(aspect3rd).toEqual({
                house: 3,
                aspect: 3,
                planets: ['mars']
            });
            
            expect(aspect7th).toEqual({
                house: 7,
                aspect: 7,
                planets: ['rahu']
            });
            
            expect(aspect10th).toEqual({
                house: 10,
                aspect: 10,
                planets: ['ketu']
            });
        });

        it('should calculate correct aspects for Rahu/Ketu (5th, 7th, 9th house aspects)', () => {
            // Arrange
            const planetPositions: Record<Planet, PlanetPosition> = {
                sun: createMockPlanetPosition('sun', 1),
                moon: createMockPlanetPosition('moon', 2),
                mars: createMockPlanetPosition('mars', 3),
                mercury: createMockPlanetPosition('mercury', 4),
                jupiter: createMockPlanetPosition('jupiter', 5),
                venus: createMockPlanetPosition('venus', 8), // Venus in house 8 (5th from Rahu)
                saturn: createMockPlanetPosition('saturn', 10), // Saturn in house 10 (7th from Rahu)
                rahu: createMockPlanetPosition('rahu', 4), // Rahu in house 4
                ketu: createMockPlanetPosition('ketu', 12) // Ketu in house 12 (9th from Rahu)
            };

            // Act
            AspectCalculator.calculateVedicAspects(planetPositions);

            // Assert
            expect(planetPositions.rahu.aspects).toHaveLength(3);
            
            const aspect5th = planetPositions.rahu.aspects.find(a => a.aspect === 5);
            const aspect7th = planetPositions.rahu.aspects.find(a => a.aspect === 7);
            const aspect9th = planetPositions.rahu.aspects.find(a => a.aspect === 9);
            
            expect(aspect5th).toEqual({
                house: 8,
                aspect: 5,
                planets: ['venus']
            });
            
            expect(aspect7th).toEqual({
                house: 10,
                aspect: 7,
                planets: ['saturn']
            });
            
            expect(aspect9th).toEqual({
                house: 12,
                aspect: 9,
                planets: ['ketu']
            });
        });

        it('should handle empty aspected houses correctly', () => {
            // Arrange
            const planetPositions: Record<Planet, PlanetPosition> = {
                sun: createMockPlanetPosition('sun', 1), // Sun in house 1
                moon: createMockPlanetPosition('moon', 2), // Moon in house 2
                mars: createMockPlanetPosition('mars', 3), // Mars in house 3
                mercury: createMockPlanetPosition('mercury', 4), // Mercury in house 4
                jupiter: createMockPlanetPosition('jupiter', 5), // Jupiter in house 5
                venus: createMockPlanetPosition('venus', 6), // Venus in house 6
                saturn: createMockPlanetPosition('saturn', 8), // Saturn in house 8
                rahu: createMockPlanetPosition('rahu', 9), // Rahu in house 9
                ketu: createMockPlanetPosition('ketu', 10) // Ketu in house 10
            };
            // Note: House 7 is empty, so Sun's 7th house aspect will have no planets

            // Act
            AspectCalculator.calculateVedicAspects(planetPositions);

            // Assert
            expect(planetPositions.sun.aspects).toHaveLength(1);
            expect(planetPositions.sun.aspects[0]).toEqual({
                house: 7,
                aspect: 7,
                planets: [] // Empty because no planets in house 7
            });
        });

        it('should handle house wrapping correctly (12th house to 1st house)', () => {
            // Arrange
            const planetPositions: Record<Planet, PlanetPosition> = {
                sun: createMockPlanetPosition('sun', 1),
                moon: createMockPlanetPosition('moon', 2),
                mars: createMockPlanetPosition('mars', 3),
                mercury: createMockPlanetPosition('mercury', 4),
                jupiter: createMockPlanetPosition('jupiter', 5),
                venus: createMockPlanetPosition('venus', 6),
                saturn: createMockPlanetPosition('saturn', 7), // Saturn in house 7
                rahu: createMockPlanetPosition('rahu', 8),
                ketu: createMockPlanetPosition('ketu', 1) // Ketu in house 1 (7th from Saturn)
            };

            // Act
            AspectCalculator.calculateVedicAspects(planetPositions);

            // Assert
            const saturnAspect = planetPositions.saturn.aspects.find(a => a.aspect === 7);
            expect(saturnAspect).toEqual({
                house: 1,
                aspect: 7,
                planets: ['sun', 'ketu']
            });
        });

        it('should handle multiple planets in same aspected house', () => {
            // Arrange
            const planetPositions: Record<Planet, PlanetPosition> = {
                sun: createMockPlanetPosition('sun', 7), // Sun in house 7
                moon: createMockPlanetPosition('moon', 7), // Moon in house 7
                mars: createMockPlanetPosition('mars', 1), // Mars in house 1
                mercury: createMockPlanetPosition('mercury', 2),
                jupiter: createMockPlanetPosition('jupiter', 3),
                venus: createMockPlanetPosition('venus', 4),
                saturn: createMockPlanetPosition('saturn', 5),
                rahu: createMockPlanetPosition('rahu', 6),
                ketu: createMockPlanetPosition('ketu', 8)
            };

            // Act
            AspectCalculator.calculateVedicAspects(planetPositions);

            // Assert
            // Mars in house 1 aspects house 7 (7th aspect) where Sun and Moon are present
            const marsAspect = planetPositions.mars.aspects.find(a => a.aspect === 7);
            expect(marsAspect).toEqual({
                house: 7,
                aspect: 7,
                planets: ['sun', 'moon']
            });
        });
    });

    describe('getMutualReception', () => {
        it('should identify mutual reception between planets', () => {
            // Arrange
            const planetPositions: Record<Planet, PlanetPosition> = {
                sun: createMockPlanetPosition('sun', 1, 'leo'), // Sun in Leo (Sun's own sign)
                moon: createMockPlanetPosition('moon', 2, 'cancer'), // Moon in Cancer (Moon's own sign)
                mars: createMockPlanetPosition('mars', 3, 'scorpio'), // Mars in Scorpio (Mars' own sign)
                mercury: createMockPlanetPosition('mercury', 4, 'gemini'), // Mercury in Gemini (Mercury's own sign)
                jupiter: createMockPlanetPosition('jupiter', 5, 'sagittarius'), // Jupiter in Sagittarius (Jupiter's own sign)
                venus: createMockPlanetPosition('venus', 6, 'taurus'), // Venus in Taurus (Venus' own sign)
                saturn: createMockPlanetPosition('saturn', 7, 'aquarius'), // Saturn in Aquarius (Saturn's own sign)
                rahu: createMockPlanetPosition('rahu', 8, 'pisces'),
                ketu: createMockPlanetPosition('ketu', 9, 'virgo')
            };

            // Act
            const mutualReceptions = AspectCalculator.getMutualReception(planetPositions);

            // Assert
            expect(mutualReceptions).toHaveLength(0); // No mutual reception as planets are in their own signs
        });

        it('should return empty array when no mutual reception exists', () => {
            // Arrange
            const planetPositions: Record<Planet, PlanetPosition> = {
                sun: createMockPlanetPosition('sun', 1, 'aries'),
                moon: createMockPlanetPosition('moon', 2, 'taurus'),
                mars: createMockPlanetPosition('mars', 3, 'gemini'),
                mercury: createMockPlanetPosition('mercury', 4, 'cancer'),
                jupiter: createMockPlanetPosition('jupiter', 5, 'leo'),
                venus: createMockPlanetPosition('venus', 6, 'virgo'),
                saturn: createMockPlanetPosition('saturn', 7, 'libra'),
                rahu: createMockPlanetPosition('rahu', 8, 'scorpio'),
                ketu: createMockPlanetPosition('ketu', 9, 'sagittarius')
            };

            // Act
            const mutualReceptions = AspectCalculator.getMutualReception(planetPositions);

            // Assert
            expect(mutualReceptions).toHaveLength(0);
        });
    });

    describe('getPlanetAspects', () => {
        it('should return correct aspects for Sun', () => {
            // Arrange & Act
            const aspects = AspectCalculator.getPlanetAspects('sun');

            // Assert
            expect(aspects).toEqual([7]);
        });

        it('should return correct aspects for Mars', () => {
            // Arrange & Act
            const aspects = AspectCalculator.getPlanetAspects('mars');

            // Assert
            expect(aspects).toEqual([4, 7, 8]);
        });

        it('should return correct aspects for Jupiter', () => {
            // Arrange & Act
            const aspects = AspectCalculator.getPlanetAspects('jupiter');

            // Assert
            expect(aspects).toEqual([5, 7, 9]);
        });

        it('should return correct aspects for Saturn', () => {
            // Arrange & Act
            const aspects = AspectCalculator.getPlanetAspects('saturn');

            // Assert
            expect(aspects).toEqual([3, 7, 10]);
        });

        it('should return correct aspects for Rahu', () => {
            // Arrange & Act
            const aspects = AspectCalculator.getPlanetAspects('rahu');

            // Assert
            expect(aspects).toEqual([5, 7, 9]);
        });

        it('should return correct aspects for Ketu', () => {
            // Arrange & Act
            const aspects = AspectCalculator.getPlanetAspects('ketu');

            // Assert
            expect(aspects).toEqual([5, 7, 9]);
        });

        it('should return default 7th house aspect for Moon', () => {
            // Arrange & Act
            const aspects = AspectCalculator.getPlanetAspects('moon');

            // Assert
            expect(aspects).toEqual([7]);
        });

        it('should return default 7th house aspect for Mercury', () => {
            // Arrange & Act
            const aspects = AspectCalculator.getPlanetAspects('mercury');

            // Assert
            expect(aspects).toEqual([7]);
        });

        it('should return default 7th house aspect for Venus', () => {
            // Arrange & Act
            const aspects = AspectCalculator.getPlanetAspects('venus');

            // Assert
            expect(aspects).toEqual([7]);
        });
    });

    describe('getAspectDescription', () => {
        it('should return correct description for planet with aspects affecting other planets', () => {
            // Arrange
            const planet: Planet = 'mars';
            const aspects: PlanetAspect[] = [
                { house: 6, aspect: 4, planets: ['mercury'] },
                { house: 9, aspect: 7, planets: ['jupiter'] },
                { house: 10, aspect: 8, planets: ['venus', 'saturn'] }
            ];

            // Act
            const description = AspectCalculator.getAspectDescription(planet, aspects);

            // Assert
            expect(description).toBe('Mars aspects: 4th house (affecting Mercury), 7th house (affecting Jupiter), 8th house (affecting Venus, Saturn)');
        });

        it('should return correct description for planet with aspects to empty houses', () => {
            // Arrange
            const planet: Planet = 'sun';
            const aspects: PlanetAspect[] = [
                { house: 7, aspect: 7, planets: [] }
            ];

            // Act
            const description = AspectCalculator.getAspectDescription(planet, aspects);

            // Assert
            expect(description).toBe('Sun aspects: 7th house (empty house)');
        });

        it('should return correct description for planet with mixed aspects', () => {
            // Arrange
            const planet: Planet = 'jupiter';
            const aspects: PlanetAspect[] = [
                { house: 9, aspect: 5, planets: ['venus'] },
                { house: 11, aspect: 7, planets: [] },
                { house: 1, aspect: 9, planets: ['sun', 'moon'] }
            ];

            // Act
            const description = AspectCalculator.getAspectDescription(planet, aspects);

            // Assert
            expect(description).toBe('Jupiter aspects: 5th house (affecting Venus), 7th house (empty house), 9th house (affecting Sun, Moon)');
        });

        it('should return correct description for planet with no aspects', () => {
            // Arrange
            const planet: Planet = 'mercury';
            const aspects: PlanetAspect[] = [];

            // Act
            const description = AspectCalculator.getAspectDescription(planet, aspects);

            // Assert
            expect(description).toBe('Mercury aspects: ');
        });
    });
});

/**
 * Helper function to create mock planet positions for testing
 */
function createMockPlanetPosition(
    name: string, 
    house: HouseNumber, 
    sign: string = 'aries'
): PlanetPosition {
    return {
        name,
        longitude: (house - 1) * 30 + 15, // Place planet in middle of house
        latitude: 0,
        sign: sign as any,
        degree: 15,
        degreeDMS: { degrees: 15, minutes: 0, seconds: 0 },
        degreeDMSFormatted: '15°00\'00"',
        nakshatra: 'ashwini',
        nakshatraPada: 1,
        pada: 1,
        house,
        isRetrograde: false,
        isCombust: false,
        speed: 1,
        dignity: 'neutral',
        aspects: []
    };
}
