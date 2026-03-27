import { WesternPlanet, WesternPlanetPosition, WesternAspect, WesternAspectType, DEFAULT_WESTERN_ORBS, WESTERN_ASPECT_ANGLES } from './types/western.types';

export class WesternAspectCalculator {
    /**
     * Calculate all aspects between all planet pairs.
     * Populates each planet's `aspects` array and returns the full list.
     */
    static calculateAspects(planets: Record<WesternPlanet, WesternPlanetPosition>, customOrbs?: Partial<Record<WesternAspectType, number>>): WesternAspect[] {
        const orbs: Record<WesternAspectType, number> = { ...DEFAULT_WESTERN_ORBS, ...customOrbs };
        const allAspects: WesternAspect[] = [];

        // Clear existing aspects
        for (const planet of Object.keys(planets) as WesternPlanet[]) {
            planets[planet].aspects = [];
        }

        const planetList = Object.keys(planets) as WesternPlanet[];

        for (let i = 0; i < planetList.length; i++) {
            for (let j = i + 1; j < planetList.length; j++) {
                const p1 = planetList[i];
                const p2 = planetList[j];
                const aspect = this.findAspect(planets[p1], planets[p2], orbs);
                if (aspect) {
                    allAspects.push(aspect);
                    planets[p1].aspects.push(aspect);
                    planets[p2].aspects.push(aspect);
                }
            }
        }

        return allAspects;
    }

    /**
     * Get the effective orb map (defaults merged with any custom overrides).
     */
    static getAspectOrbs(customOrbs?: Partial<Record<WesternAspectType, number>>): Record<WesternAspectType, number> {
        return { ...DEFAULT_WESTERN_ORBS, ...customOrbs };
    }

    // ─── Private helpers ────────────────────────────────────────────────────────

    private static findAspect(pos1: WesternPlanetPosition, pos2: WesternPlanetPosition, orbs: Record<WesternAspectType, number>): WesternAspect | null {
        const angle = this.angularSeparation(pos1.longitude, pos2.longitude);

        for (const [aspectType, exactAngle] of Object.entries(WESTERN_ASPECT_ANGLES) as [WesternAspectType, number][]) {
            const maxOrb = orbs[aspectType];
            const deviation = Math.abs(angle - exactAngle);

            if (deviation <= maxOrb) {
                return {
                    planet1: pos1.name,
                    planet2: pos2.name,
                    type: aspectType,
                    angle,
                    orb: Math.round(deviation * 100) / 100,
                    maxOrb,
                    isApplying: this.isApplying(pos1, pos2, exactAngle)
                };
            }
        }

        return null;
    }

    /**
     * Returns the shortest angular separation between two longitudes (0–180°).
     */
    private static angularSeparation(lon1: number, lon2: number): number {
        let diff = Math.abs(lon1 - lon2) % 360;
        if (diff > 180) diff = 360 - diff;
        return diff;
    }

    /**
     * Determines whether the aspect is applying (planets moving toward exact).
     * Uses the difference in speeds: if planet1 is faster and approaching planet2
     * (in the direction that closes the orb), the aspect is applying.
     */
    private static isApplying(pos1: WesternPlanetPosition, pos2: WesternPlanetPosition, exactAngle: number): boolean {
        // Approximate: if the current separation is larger than the exact angle,
        // and the faster planet is moving toward closing the gap, it is applying.
        const lon1 = pos1.longitude;
        const lon2 = pos2.longitude;
        const separation = this.angularSeparation(lon1, lon2);
        const speed1 = pos1.speed;
        const speed2 = pos2.speed;

        // The aspect is applying if |separation - exactAngle| will decrease
        // given the current speeds. A positive speed means direct motion.
        const relativeSpeed = speed1 - speed2;

        // Signed angular difference (lon1 - lon2), wrapped to -180..180
        let signedDiff = (lon1 - lon2 + 360) % 360;
        if (signedDiff > 180) signedDiff -= 360;

        if (exactAngle === 0) {
            // Conjunction: applying if planets moving toward each other (gap shrinking)
            return (signedDiff > 0 && relativeSpeed < 0) || (signedDiff < 0 && relativeSpeed > 0);
        }

        // For other aspects: if separation > exactAngle, applying means gap decreasing
        if (separation > exactAngle) {
            return relativeSpeed < 0;
        } else {
            return relativeSpeed > 0;
        }
    }
}
