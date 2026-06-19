import { WesternAspectCalculator } from '../../src/western-aspect-calculator';
import { WesternPlanetPosition, WesternPlanet } from '../../src/types/western.types';
import { DegreeDMS } from '../../src/types/common.types';
import { ZodiacUtils } from '../../src/astrological-utils';

function makePlanet(name: WesternPlanet, longitude: number, speed = 1): WesternPlanetPosition {
    const sign = ZodiacUtils.getSignFromLongitude(longitude);
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

function makePlanets(entries: [WesternPlanet, number, number?][]): Record<WesternPlanet, WesternPlanetPosition> {
    const result: Partial<Record<WesternPlanet, WesternPlanetPosition>> = {};
    for (const [name, lon, speed] of entries) {
        result[name] = makePlanet(name, lon, speed);
    }
    return result as Record<WesternPlanet, WesternPlanetPosition>;
}

describe('WesternAspectCalculator', () => {
    describe('calculateAspects', () => {
        it('detects a conjunction at 0° separation', () => {
            const planets = makePlanets([['sun', 10], ['moon', 14]]); // 4° apart
            const aspects = WesternAspectCalculator.calculateAspects(planets);
            expect(aspects.length).toBe(1);
            expect(aspects[0].type).toBe('conjunction');
            expect(aspects[0].orb).toBeCloseTo(4, 1);
        });

        it('detects a sextile at 60°', () => {
            const planets = makePlanets([['sun', 0], ['moon', 60]]);
            const aspects = WesternAspectCalculator.calculateAspects(planets);
            expect(aspects.length).toBe(1);
            expect(aspects[0].type).toBe('sextile');
            expect(aspects[0].orb).toBeCloseTo(0, 1);
        });

        it('detects a square at 90°', () => {
            const planets = makePlanets([['sun', 0], ['mars', 92]]); // 2° orb
            const aspects = WesternAspectCalculator.calculateAspects(planets);
            expect(aspects.length).toBe(1);
            expect(aspects[0].type).toBe('square');
            expect(aspects[0].orb).toBeCloseTo(2, 1);
        });

        it('detects a trine at 120°', () => {
            const planets = makePlanets([['sun', 0], ['jupiter', 120]]);
            const aspects = WesternAspectCalculator.calculateAspects(planets);
            expect(aspects.length).toBe(1);
            expect(aspects[0].type).toBe('trine');
        });

        it('detects an opposition at 180°', () => {
            const planets = makePlanets([['sun', 0], ['saturn', 180]]);
            const aspects = WesternAspectCalculator.calculateAspects(planets);
            expect(aspects.length).toBe(1);
            expect(aspects[0].type).toBe('opposition');
        });

        it('detects a quincunx at 150°', () => {
            const planets = makePlanets([['venus', 0], ['mars', 150]]);
            const aspects = WesternAspectCalculator.calculateAspects(planets);
            expect(aspects.length).toBe(1);
            expect(aspects[0].type).toBe('quincunx');
        });

        it('detects a semi-sextile at 30°', () => {
            const planets = makePlanets([['sun', 0], ['mercury', 30]]);
            const aspects = WesternAspectCalculator.calculateAspects(planets);
            expect(aspects.length).toBe(1);
            expect(aspects[0].type).toBe('semi-sextile');
        });

        it('does not detect an aspect when separation exceeds orb', () => {
            const planets = makePlanets([['sun', 0], ['moon', 20]]); // 20° - no standard aspect
            const aspects = WesternAspectCalculator.calculateAspects(planets);
            expect(aspects.length).toBe(0);
        });

        it('respects custom orb overrides', () => {
            const planets = makePlanets([['sun', 0], ['moon', 10]]); // 10° - outside default conjunction orb of 8°
            const aspects = WesternAspectCalculator.calculateAspects(planets, { conjunction: 12 });
            expect(aspects.length).toBe(1);
            expect(aspects[0].type).toBe('conjunction');
        });

        it('populates planet.aspects arrays', () => {
            const planets = makePlanets([['sun', 0], ['moon', 120]]);
            WesternAspectCalculator.calculateAspects(planets);
            expect(planets.sun.aspects.length).toBe(1);
            expect(planets.moon.aspects.length).toBe(1);
        });

        it('handles longitude wrap-around (e.g. 350° and 10°)', () => {
            const planets = makePlanets([['sun', 350], ['moon', 10]]); // 20° separation via 0°
            const aspects = WesternAspectCalculator.calculateAspects(planets);
            // 20° - no aspect at default orbs
            expect(aspects.length).toBe(0);

            const planets2 = makePlanets([['sun', 356], ['moon', 4]]); // 8° separation via 0° - conjunction
            const aspects2 = WesternAspectCalculator.calculateAspects(planets2);
            expect(aspects2.length).toBe(1);
            expect(aspects2[0].type).toBe('conjunction');
        });
    });

    describe('getAspectOrbs', () => {
        it('returns default orbs when no custom orbs provided', () => {
            const orbs = WesternAspectCalculator.getAspectOrbs();
            expect(orbs.conjunction).toBe(8);
            expect(orbs.trine).toBe(8);
            expect(orbs.quincunx).toBe(3);
        });

        it('merges custom orbs over defaults', () => {
            const orbs = WesternAspectCalculator.getAspectOrbs({ conjunction: 12, trine: 5 });
            expect(orbs.conjunction).toBe(12);
            expect(orbs.trine).toBe(5);
            expect(orbs.sextile).toBe(6); // unchanged default
        });
    });
});
