import { ZodiacSign } from './types/common.types';
import { WesternPlanet, WesternPlanetPosition, WesternAspect, ChartPattern } from './types/western.types';

// Sign elements for Grand Trine classification
const SIGN_ELEMENTS: Record<ZodiacSign, 'fire' | 'earth' | 'air' | 'water'> = {
    aries: 'fire',
    leo: 'fire',
    sagittarius: 'fire',
    taurus: 'earth',
    virgo: 'earth',
    capricorn: 'earth',
    gemini: 'air',
    libra: 'air',
    aquarius: 'air',
    cancer: 'water',
    scorpio: 'water',
    pisces: 'water'
};

export class ChartPatternCalculator {
    /**
     * Detect all major chart patterns from the aspects list.
     */
    static detectPatterns(planets: Record<WesternPlanet, WesternPlanetPosition>, aspects: WesternAspect[]): ChartPattern[] {
        const patterns: ChartPattern[] = [];

        patterns.push(...this.detectGrandTrines(aspects, planets));
        patterns.push(...this.detectTSquares(aspects));
        patterns.push(...this.detectGrandCrosses(aspects));
        patterns.push(...this.detectStelliums(planets));
        patterns.push(...this.detectYods(aspects));

        return patterns;
    }

    // ─── Grand Trine ────────────────────────────────────────────────────────────

    private static detectGrandTrines(aspects: WesternAspect[], planets: Record<WesternPlanet, WesternPlanetPosition>): ChartPattern[] {
        const trines = aspects.filter(a => a.type === 'trine');
        const patterns: ChartPattern[] = [];

        // Build adjacency: which planets are trine to each other
        const trineMap = new Map<WesternPlanet, Set<WesternPlanet>>();
        for (const t of trines) {
            if (!trineMap.has(t.planet1)) trineMap.set(t.planet1, new Set());
            if (!trineMap.has(t.planet2)) trineMap.set(t.planet2, new Set());
            trineMap.get(t.planet1)!.add(t.planet2);
            trineMap.get(t.planet2)!.add(t.planet1);
        }

        const planetList = Array.from(trineMap.keys());
        const found = new Set<string>();

        for (let i = 0; i < planetList.length; i++) {
            for (let j = i + 1; j < planetList.length; j++) {
                for (let k = j + 1; k < planetList.length; k++) {
                    const p1 = planetList[i];
                    const p2 = planetList[j];
                    const p3 = planetList[k];

                    if (trineMap.get(p1)?.has(p2) && trineMap.get(p2)?.has(p3) && trineMap.get(p1)?.has(p3)) {
                        const key = [p1, p2, p3].sort().join(',');
                        if (found.has(key)) continue;
                        found.add(key);

                        const element = SIGN_ELEMENTS[planets[p1].sign];
                        patterns.push({
                            type: 'grand-trine',
                            planets: [p1, p2, p3],
                            description: `Grand Trine in ${element} signs (${p1}, ${p2}, ${p3})`,
                            element
                        });
                    }
                }
            }
        }

        return patterns;
    }

    // ─── T-Square ───────────────────────────────────────────────────────────────

    private static detectTSquares(aspects: WesternAspect[]): ChartPattern[] {
        const oppositions = aspects.filter(a => a.type === 'opposition');
        const squares = aspects.filter(a => a.type === 'square');
        const patterns: ChartPattern[] = [];
        const found = new Set<string>();

        for (const opp of oppositions) {
            const { planet1: p1, planet2: p2 } = opp;

            // Find a third planet that squares both p1 and p2
            for (const sq of squares) {
                let apex: WesternPlanet | null = null;

                if (sq.planet1 === p1 || sq.planet2 === p1) {
                    const candidate = sq.planet1 === p1 ? sq.planet2 : sq.planet1;
                    // Check it also squares p2
                    const alsoSquaresP2 = squares.some(s => (s.planet1 === candidate && s.planet2 === p2) || (s.planet2 === candidate && s.planet1 === p2));
                    if (alsoSquaresP2) apex = candidate;
                }

                if (apex && apex !== p1 && apex !== p2) {
                    const key = [p1, p2, apex].sort().join(',');
                    if (!found.has(key)) {
                        found.add(key);
                        patterns.push({
                            type: 't-square',
                            planets: [p1, p2, apex],
                            description: `T-Square: ${p1} opposition ${p2}, both squared by ${apex}`
                        });
                    }
                }
            }
        }

        return patterns;
    }

    // ─── Grand Cross ────────────────────────────────────────────────────────────

    private static detectGrandCrosses(aspects: WesternAspect[]): ChartPattern[] {
        const oppositions = aspects.filter(a => a.type === 'opposition');
        const squares = aspects.filter(a => a.type === 'square');
        const patterns: ChartPattern[] = [];
        const found = new Set<string>();

        // Need two opposition pairs where all four planets square each other
        for (let i = 0; i < oppositions.length; i++) {
            for (let j = i + 1; j < oppositions.length; j++) {
                const opp1 = oppositions[i];
                const opp2 = oppositions[j];
                const fourPlanets = [opp1.planet1, opp1.planet2, opp2.planet1, opp2.planet2];

                // All four must be distinct
                if (new Set(fourPlanets).size !== 4) continue;

                // Check that cross-opposition planets square each other
                const [a, b, c, d] = fourPlanets;
                const squarePairs: [WesternPlanet, WesternPlanet][] = [
                    [a, c],
                    [a, d],
                    [b, c],
                    [b, d]
                ];

                const allSquare = squarePairs.every(([x, y]) => squares.some(sq => (sq.planet1 === x && sq.planet2 === y) || (sq.planet1 === y && sq.planet2 === x)));

                if (allSquare) {
                    const key = [...fourPlanets].sort().join(',');
                    if (!found.has(key)) {
                        found.add(key);
                        patterns.push({
                            type: 'grand-cross',
                            planets: fourPlanets,
                            description: `Grand Cross: ${fourPlanets.join(', ')}`
                        });
                    }
                }
            }
        }

        return patterns;
    }

    // ─── Stellium ───────────────────────────────────────────────────────────────

    private static detectStelliums(planets: Record<WesternPlanet, WesternPlanetPosition>): ChartPattern[] {
        const patterns: ChartPattern[] = [];

        // Group by sign
        const bySign = new Map<ZodiacSign, WesternPlanet[]>();
        for (const [name, pos] of Object.entries(planets) as [WesternPlanet, WesternPlanetPosition][]) {
            const sign = pos.sign;
            if (!bySign.has(sign)) bySign.set(sign, []);
            bySign.get(sign)!.push(name);
        }

        for (const [sign, planetGroup] of bySign.entries()) {
            if (planetGroup.length >= 3) {
                patterns.push({
                    type: 'stellium',
                    planets: planetGroup,
                    description: `Stellium in ${sign}: ${planetGroup.join(', ')}`
                });
            }
        }

        // Also detect by degree proximity (within 10°) across signs
        const planetList = Object.entries(planets) as [WesternPlanet, WesternPlanetPosition][];
        const degreeFound = new Set<string>();

        for (let i = 0; i < planetList.length; i++) {
            const cluster: WesternPlanet[] = [planetList[i][0]];
            const baseLon = planetList[i][1].longitude;

            for (let j = 0; j < planetList.length; j++) {
                if (i === j) continue;
                const diff = Math.abs(planetList[j][1].longitude - baseLon);
                if (diff <= 10 || diff >= 350) cluster.push(planetList[j][0]);
            }

            if (cluster.length >= 3) {
                // Only add if not already covered by a sign-based stellium
                const key = [...cluster].sort().join(',');
                if (!degreeFound.has(key)) {
                    // Check if this cluster is already captured by sign grouping
                    const alreadyCovered = patterns.some(p => p.type === 'stellium' && cluster.every(pl => p.planets.includes(pl)));
                    if (!alreadyCovered) {
                        degreeFound.add(key);
                        patterns.push({
                            type: 'stellium',
                            planets: cluster,
                            description: `Stellium within 10°: ${cluster.join(', ')}`
                        });
                    }
                }
            }
        }

        return patterns;
    }

    // ─── Yod (Finger of God) ────────────────────────────────────────────────────

    private static detectYods(aspects: WesternAspect[]): ChartPattern[] {
        const sextiles = aspects.filter(a => a.type === 'sextile');
        const quincunxes = aspects.filter(a => a.type === 'quincunx');
        const patterns: ChartPattern[] = [];
        const found = new Set<string>();

        for (const sxt of sextiles) {
            const { planet1: p1, planet2: p2 } = sxt;

            // Find an apex planet that is quincunx to both p1 and p2
            for (const q of quincunxes) {
                let apex: WesternPlanet | null = null;

                if (q.planet1 === p1 || q.planet2 === p1) {
                    const candidate = q.planet1 === p1 ? q.planet2 : q.planet1;
                    // Check it also quincunxes p2
                    const alsoQuincunxP2 = quincunxes.some(q2 => (q2.planet1 === candidate && q2.planet2 === p2) || (q2.planet2 === candidate && q2.planet1 === p2));
                    if (alsoQuincunxP2) apex = candidate;
                }

                if (apex && apex !== p1 && apex !== p2) {
                    const key = [p1, p2, apex].sort().join(',');
                    if (!found.has(key)) {
                        found.add(key);
                        patterns.push({
                            type: 'yod',
                            planets: [p1, p2, apex],
                            description: `Yod (Finger of God): ${p1} sextile ${p2}, both quincunx apex ${apex}`
                        });
                    }
                }
            }
        }

        return patterns;
    }
}
