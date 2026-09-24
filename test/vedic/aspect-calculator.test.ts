import { AspectCalculator } from '../../src';
import { Planet, PlanetPosition, Nakshatra } from '../../src';

const mockPlanetData = {
    longitude: 0,
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
    aspects: [] as PlanetPosition['aspects']
};

describe(AspectCalculator.name, () => {
    describe('getAspectDescription', () => {
        it('describes special aspects using the resolved absolute house, not the raw offset', () => {
            // Saturn in house 8, casting its special 3rd/7th/10th aspects.
            // 3rd-from-Saturn (offset 3) resolves to house 10, where Ketu sits.
            // 10th-from-Saturn (offset 10) resolves to house 5, where Sun/Moon/Mercury/Jupiter sit.
            const planetPositions: Record<Planet, PlanetPosition> = {
                sun: { name: 'sun', house: 5, sign: 'gemini', ...mockPlanetData },
                moon: { name: 'moon', house: 5, sign: 'gemini', ...mockPlanetData },
                mars: { name: 'mars', house: 1, sign: 'aries', ...mockPlanetData },
                mercury: { name: 'mercury', house: 5, sign: 'gemini', ...mockPlanetData },
                jupiter: { name: 'jupiter', house: 5, sign: 'gemini', ...mockPlanetData },
                venus: { name: 'venus', house: 2, sign: 'taurus', ...mockPlanetData },
                saturn: { name: 'saturn', house: 8, sign: 'sagittarius', ...mockPlanetData },
                rahu: { name: 'rahu', house: 3, sign: 'cancer', ...mockPlanetData },
                ketu: { name: 'ketu', house: 10, sign: 'capricorn', ...mockPlanetData }
            };

            AspectCalculator.calculateVedicAspects(planetPositions);

            const saturnAspects = planetPositions.saturn.aspects;
            const description = AspectCalculator.getAspectDescription('saturn', saturnAspects);

            // The aspect resolved to house 10 (matching Ketu) must be labeled "10th house", not "3th house".
            expect(description).toContain('10th house (affecting Ketu)');
            // The aspect resolved to house 5 (matching Sun/Moon/Mercury/Jupiter) must be labeled "5th house", not "10th house".
            expect(description).toContain('5th house (affecting Sun, Moon, Mercury, Jupiter)');

            expect(description).not.toContain('3th house');
        });
    });
});
