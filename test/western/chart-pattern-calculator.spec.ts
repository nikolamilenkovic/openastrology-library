import { ChartPatternCalculator } from '../../src/chart-pattern-calculator';
import { WesternAspectCalculator } from '../../src/western-aspect-calculator';
import { WesternPlanetPosition, WesternPlanet, WesternAspect } from '../../src/types/western.types';
import { DegreeDMS } from '../../src/types/common.types';
import { ZodiacSign } from '../../src/types/common.types';
import { ZodiacUtils } from '../../src/astrological-utils';

function makePlanet(
    name: WesternPlanet,
    longitude: number,
    sign: ZodiacSign = 'aries',
    speed = 1
): WesternPlanetPosition {
    return {
        name,
        longitude,
        latitude: 0,
        sign,
        degree: longitude % 30,
        degreeDMS: new DegreeDMS(),
        degreeDMSFormatted: '',
        house: 1,
        isRetrograde: speed < 0,
        speed,
        dignity: 'neutral',
        element: ZodiacUtils.getElement(sign),
        quality: ZodiacUtils.getQuality(sign),
        aspects: []
    };
}

function buildAspects(planets: Partial<Record<WesternPlanet, WesternPlanetPosition>>): WesternAspect[] {
    return WesternAspectCalculator.calculateAspects(
        planets as Record<WesternPlanet, WesternPlanetPosition>
    );
}

describe('ChartPatternCalculator', () => {
    describe('detectPatterns - Grand Trine', () => {
        it('detects a Grand Trine when three planets are all trine to each other', () => {
            // Fire trine: Aries 0°, Leo 0° (120°), Sagittarius 0° (240°)
            const planets: Partial<Record<WesternPlanet, WesternPlanetPosition>> = {
                sun: makePlanet('sun', 0, 'aries'),
                moon: makePlanet('moon', 120, 'leo'),
                jupiter: makePlanet('jupiter', 240, 'sagittarius')
            };
            const aspects = buildAspects(planets);
            const patterns = ChartPatternCalculator.detectPatterns(
                planets as Record<WesternPlanet, WesternPlanetPosition>,
                aspects
            );
            const grandTrines = patterns.filter(p => p.type === 'grand-trine');
            expect(grandTrines.length).toBe(1);
            expect(grandTrines[0].planets).toHaveLength(3);
            expect(grandTrines[0].element).toBe('fire');
        });

        it('does not detect a Grand Trine when one trine is missing', () => {
            const planets: Partial<Record<WesternPlanet, WesternPlanetPosition>> = {
                sun: makePlanet('sun', 0, 'aries'),
                moon: makePlanet('moon', 120, 'leo'),
                jupiter: makePlanet('jupiter', 50, 'taurus') // not trine to sun or moon at correct angle
            };
            const aspects = buildAspects(planets);
            const patterns = ChartPatternCalculator.detectPatterns(
                planets as Record<WesternPlanet, WesternPlanetPosition>,
                aspects
            );
            expect(patterns.filter(p => p.type === 'grand-trine').length).toBe(0);
        });
    });

    describe('detectPatterns - T-Square', () => {
        it('detects a T-Square: two planets in opposition, both squared by a third', () => {
            // sun at 0°, saturn at 180° (opposition), mars at 90° (squares both)
            const planets: Partial<Record<WesternPlanet, WesternPlanetPosition>> = {
                sun: makePlanet('sun', 0, 'aries'),
                saturn: makePlanet('saturn', 180, 'libra'),
                mars: makePlanet('mars', 90, 'cancer')
            };
            const aspects = buildAspects(planets);
            const patterns = ChartPatternCalculator.detectPatterns(
                planets as Record<WesternPlanet, WesternPlanetPosition>,
                aspects
            );
            const tSquares = patterns.filter(p => p.type === 't-square');
            expect(tSquares.length).toBe(1);
            expect(tSquares[0].planets).toContain('mars'); // apex
        });
    });

    describe('detectPatterns - Stellium', () => {
        it('detects a stellium with 3+ planets in the same sign', () => {
            const planets: Partial<Record<WesternPlanet, WesternPlanetPosition>> = {
                sun: makePlanet('sun', 5, 'aries'),
                moon: makePlanet('moon', 12, 'aries'),
                mercury: makePlanet('mercury', 20, 'aries'),
                venus: makePlanet('venus', 150, 'virgo')
            };
            const aspects = buildAspects(planets);
            const patterns = ChartPatternCalculator.detectPatterns(
                planets as Record<WesternPlanet, WesternPlanetPosition>,
                aspects
            );
            const stelliums = patterns.filter(p => p.type === 'stellium');
            expect(stelliums.length).toBeGreaterThanOrEqual(1);
            const ariesStellium = stelliums.find(p => p.planets.includes('sun') && p.planets.includes('moon'));
            expect(ariesStellium).toBeDefined();
            expect(ariesStellium!.planets.length).toBeGreaterThanOrEqual(3);
        });

        it('does not detect a stellium with only 2 planets in a sign', () => {
            const planets: Partial<Record<WesternPlanet, WesternPlanetPosition>> = {
                sun: makePlanet('sun', 5, 'aries'),
                moon: makePlanet('moon', 12, 'aries'),
                mercury: makePlanet('mercury', 60, 'gemini')
            };
            const aspects = buildAspects(planets);
            const patterns = ChartPatternCalculator.detectPatterns(
                planets as Record<WesternPlanet, WesternPlanetPosition>,
                aspects
            );
            expect(patterns.filter(p => p.type === 'stellium').length).toBe(0);
        });
    });

    describe('detectPatterns - Yod', () => {
        it('detects a Yod: two planets sextile, both quincunx an apex', () => {
            // sun at 0°, moon at 60° (sextile), jupiter at 150° from both
            // sun 0° → jupiter 150° = quincunx ✓
            // moon 60° → jupiter 150° = 90° (square, not quincunx) ✗
            // Let's construct properly: sun 0°, moon 60°, jupiter at 210°
            // sun→jupiter: 210° diff → shortest arc = 150° quincunx ✓
            // moon→jupiter: 150° diff = quincunx ✓
            const planets: Partial<Record<WesternPlanet, WesternPlanetPosition>> = {
                sun: makePlanet('sun', 0, 'aries'),
                moon: makePlanet('moon', 60, 'gemini'),
                jupiter: makePlanet('jupiter', 210, 'scorpio')
            };
            const aspects = buildAspects(planets);
            const patterns = ChartPatternCalculator.detectPatterns(
                planets as Record<WesternPlanet, WesternPlanetPosition>,
                aspects
            );
            const yods = patterns.filter(p => p.type === 'yod');
            expect(yods.length).toBe(1);
            expect(yods[0].planets).toContain('jupiter'); // apex
        });
    });
});
