import { Planet, ZodiacSign, HouseNumber, PlanetPosition, PlanetAspect } from './types/vedic.types';
import { PlanetUtils, ZodiacUtils } from './astrological-utils';

/**
 * Helper function to capitalize first letter
 */
function titleCase(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export class AspectCalculator {
    private static readonly VEDIC_ASPECTS: Record<Planet, number[]> = {
        sun: [7],
        moon: [7],
        mars: [4, 7, 8],
        mercury: [7],
        jupiter: [5, 7, 9],
        venus: [7],
        saturn: [3, 7, 10],
        rahu: [5, 7, 9],
        ketu: [5, 7, 9]
    };

    /**
     * Calculate Vedic aspects for all planets and add them to planet positions
     */
    static calculateVedicAspects(planetPositions: Record<Planet, PlanetPosition>): void {
        const planets = Object.keys(planetPositions) as Planet[];

        // Initialize aspects array for all planets
        for (const planet of planets) {
            planetPositions[planet].aspects = [];
        }

        // Calculate aspects for each planet
        for (const planet of planets) {
            const aspectHouses = this.VEDIC_ASPECTS[planet] || [7];
            const planetPosition = planetPositions[planet];

            for (const aspectNumber of aspectHouses) {
                const aspectedHouse = (((planetPosition.house + aspectNumber - 2) % 12) + 1) as HouseNumber;

                // Find planets in the aspected house
                const planetsInAspectedHouse = planets.filter(p => 
                    p !== planet && planetPositions[p].house === aspectedHouse
                );

                // Add aspect to the planet's aspects array
                planetPositions[planet].aspects.push({
                    house: aspectedHouse,
                    aspect: aspectNumber,
                    planets: planetsInAspectedHouse
                });
            }
        }
    }

    /**
     * Get mutual reception between planets
     */
    static getMutualReception(planetPositions: Record<Planet, PlanetPosition>): Array<{ planet1: Planet; planet2: Planet }> {
        const mutualReceptions: Array<{ planet1: Planet; planet2: Planet }> = [];
        const planets = Object.keys(planetPositions) as Planet[];

        for (let i = 0; i < planets.length; i++) {
            for (let j = i + 1; j < planets.length; j++) {
                const planet1 = planets[i];
                const planet2 = planets[j];
                const pos1 = planetPositions[planet1];
                const pos2 = planetPositions[planet2];

                const lord1 = ZodiacUtils.getSignLord(pos1.sign);
                const lord2 = ZodiacUtils.getSignLord(pos2.sign);

                if (lord1 === planet2 && lord2 === planet1) {
                    mutualReceptions.push({ planet1, planet2 });
                }
            }
        }

        return mutualReceptions;
    }

    /**
     * Get aspects cast by a specific planet
     */
    static getPlanetAspects(planet: Planet): number[] {
        return this.VEDIC_ASPECTS[planet] || [7];
    }

    /**
     * Get description of aspects for a planet
     */
    static getAspectDescription(planet: Planet, aspects: PlanetAspect[]): string {
        const aspectList = aspects.map(aspect => {
            const planetsStr = aspect.planets.length > 0 ? 
                ` (affecting ${aspect.planets.map(titleCase).join(', ')})` : 
                ' (empty house)';
            return `${aspect.aspect}th house${planetsStr}`;
        }).join(', ');

        return `${titleCase(planet)} aspects: ${aspectList}`;
    }
}
