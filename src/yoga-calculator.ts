import { PlanetUtils, ZodiacUtils, HouseUtils } from './astrological-utils';
import { Planet, PlanetPosition, HouseNumber, Yoga, ZodiacSign } from './types/vedic.types';

export class YogaCalculator {
    static calculateYogas(planetPositions: Record<Planet, PlanetPosition>): Yoga[] {
        const yogas: Yoga[] = [];

        // Calculate Raja Yogas
        yogas.push(...this.calculateRajaYogas(planetPositions));

        // Calculate Dhana Yogas
        yogas.push(...this.calculateDhanaYogas(planetPositions));

        // Calculate Neecha Bhanga Yogas
        yogas.push(...this.calculateNeechaBhangaYogas(planetPositions));

        // Calculate Panch Mahapurusha Yogas
        yogas.push(...this.calculatePanchMahapurushaYogas(planetPositions));

        // Calculate Arishta Yogas (negative yogas)
        yogas.push(...this.calculateArishtaYogas(planetPositions));

        return yogas.sort((a, b) => {
            const strengthOrder = { Strong: 3, Moderate: 2, Weak: 1 };
            return strengthOrder[b.strength] - strengthOrder[a.strength];
        });
    }

    private static calculateRajaYogas(planetPositions: Record<Planet, PlanetPosition>): Yoga[] {
        const yogas: Yoga[] = [];
        const planets = Object.keys(planetPositions) as Planet[];

        // Kendra-Trikona Raja Yoga
        for (const planet of planets) {
            const position = planetPositions[planet];
            if (HouseUtils.isKendra(position.house) || HouseUtils.isTrikona(position.house)) {
                const lordSign = ZodiacUtils.getSignLord(position.sign);
                const lordPosition = planetPositions[lordSign];

                if (lordPosition && (HouseUtils.isKendra(lordPosition.house) || HouseUtils.isTrikona(lordPosition.house))) {
                    yogas.push({
                        name: 'Kendra-Trikona Raja Yoga',
                        type: 'Raja',
                        description: `${planet} in ${position.house}th house forms Raja Yoga with its dispositor ${lordSign}`,
                        planets: [planet, lordSign],
                        houses: [position.house, lordPosition.house],
                        strength: this.calculateYogaStrength([planet, lordSign], planetPositions)
                    });
                }
            }
        }

        // Neecha Bhanga Raja Yoga
        for (const planet of planets) {
            const position = planetPositions[planet];
            if (PlanetUtils.isDebilitated(planet, position.sign, position.degree)) {
                // Check for cancellation conditions
                const lordSign = ZodiacUtils.getSignLord(position.sign);
                const lordPosition = planetPositions[lordSign];

                if (lordPosition && HouseUtils.isKendra(lordPosition.house)) {
                    yogas.push({
                        name: 'Neecha Bhanga Raja Yoga',
                        type: 'Raja',
                        description: `Debilitated ${planet} gets cancellation forming Raja Yoga`,
                        planets: [planet, lordSign],
                        houses: [position.house, lordPosition.house],
                        strength: 'Moderate'
                    });
                }
            }
        }

        return yogas;
    }

    private static calculateDhanaYogas(planetPositions: Record<Planet, PlanetPosition>): Yoga[] {
        const yogas: Yoga[] = [];

        // 2nd and 11th house lord connection
        const secondHouseLord = this.getHouseLord(2, planetPositions);
        const eleventhHouseLord = this.getHouseLord(11, planetPositions);

        if (secondHouseLord && eleventhHouseLord) {
            const pos2 = planetPositions[secondHouseLord];
            const pos11 = planetPositions[eleventhHouseLord];

            if (this.arePlanetsConnected(pos2, pos11, planetPositions)) {
                yogas.push({
                    name: 'Dhana Yoga',
                    type: 'Dhana',
                    description: '2nd and 11th house lords are connected, indicating wealth',
                    planets: [secondHouseLord, eleventhHouseLord],
                    houses: [pos2.house, pos11.house],
                    strength: this.calculateYogaStrength([secondHouseLord, eleventhHouseLord], planetPositions)
                });
            }
        }

        // Jupiter-Venus conjunction in beneficial houses
        const jupiterPos = planetPositions.jupiter;
        const venusPos = planetPositions.venus;

        if (jupiterPos && venusPos && Math.abs(jupiterPos.longitude - venusPos.longitude) <= 10 && (HouseUtils.isKendra(jupiterPos.house) || HouseUtils.isTrikona(jupiterPos.house))) {
            yogas.push({
                name: 'Guru-Shukra Dhana Yoga',
                type: 'Dhana',
                description: 'Jupiter and Venus conjunction in beneficial house creates wealth',
                planets: ['jupiter', 'venus'],
                houses: [jupiterPos.house],
                strength: 'Strong'
            });
        }

        return yogas;
    }

    private static calculateNeechaBhangaYogas(planetPositions: Record<Planet, PlanetPosition>): Yoga[] {
        const yogas: Yoga[] = [];
        const planets = Object.keys(planetPositions) as Planet[];

        for (const planet of planets) {
            const position = planetPositions[planet];

            if (PlanetUtils.isDebilitated(planet, position.sign, position.degree)) {
                let cancellationFound = false;
                let description = '';
                const involvedPlanets: Planet[] = [planet];

                // Condition 1: Lord of debilitation sign in kendra from lagna or moon
                const debilLord = ZodiacUtils.getSignLord(position.sign);
                const debilLordPos = planetPositions[debilLord];

                if (debilLordPos && HouseUtils.isKendra(debilLordPos.house)) {
                    cancellationFound = true;
                    description = `Lord of debilitation sign ${debilLord} in kendra`;
                    involvedPlanets.push(debilLord);
                }

                // Condition 2: Lord of exaltation sign of debilitated planet in kendra
                const exaltSign = Object.entries(PlanetUtils.PLANET_EXALTATION).find(([p, _]) => p === planet)?.[1].sign;

                if (exaltSign) {
                    const exaltLord = ZodiacUtils.getSignLord(exaltSign);
                    const exaltLordPos = planetPositions[exaltLord];

                    if (exaltLordPos && HouseUtils.isKendra(exaltLordPos.house)) {
                        cancellationFound = true;
                        description += ` Exaltation lord ${exaltLord} in kendra`;
                        involvedPlanets.push(exaltLord);
                    }
                }

                if (cancellationFound) {
                    yogas.push({
                        name: 'Neecha Bhanga Yoga',
                        type: 'Neechabhanga',
                        description: `Debilitation of ${planet} cancelled: ${description}`,
                        planets: involvedPlanets,
                        houses: [position.house],
                        strength: 'Moderate'
                    });
                }
            }
        }

        return yogas;
    }

    private static calculatePanchMahapurushaYogas(planetPositions: Record<Planet, PlanetPosition>): Yoga[] {
        const yogas: Yoga[] = [];

        const mahapurushaConfigs = [
            { planet: 'mars' as Planet, yoga: 'Ruchaka Yoga', signs: ['aries', 'scorpio'] },
            { planet: 'mercury' as Planet, yoga: 'Bhadra Yoga', signs: ['gemini', 'virgo'] },
            { planet: 'jupiter' as Planet, yoga: 'Hamsa Yoga', signs: ['sagittarius', 'pisces'] },
            { planet: 'venus' as Planet, yoga: 'Malavya Yoga', signs: ['taurus', 'libra'] },
            { planet: 'saturn' as Planet, yoga: 'Sasha Yoga', signs: ['capricorn', 'aquarius'] }
        ];

        for (const config of mahapurushaConfigs) {
            const position = planetPositions[config.planet];

            if (position && config.signs.includes(position.sign) && HouseUtils.isKendra(position.house)) {
                yogas.push({
                    name: config.yoga,
                    type: 'Raja',
                    description: `${config.planet} in own sign in kendra forms ${config.yoga}`,
                    planets: [config.planet],
                    houses: [position.house],
                    strength: 'Strong'
                });
            }
        }

        return yogas;
    }

    private static calculateArishtaYogas(planetPositions: Record<Planet, PlanetPosition>): Yoga[] {
        const yogas: Yoga[] = [];

        // Kendradhipati Dosha
        const beneficPlanets: Planet[] = ['jupiter', 'venus', 'mercury'];

        for (const planet of beneficPlanets) {
            const position = planetPositions[planet];
            if (position && this.isKendraLord(planet, planetPositions) && !HouseUtils.isTrikona(position.house)) {
                yogas.push({
                    name: 'Kendradhipati Dosha',
                    type: 'Arishtabhanga',
                    description: `Benefic ${planet} as kendra lord creates mild negative effects`,
                    planets: [planet],
                    houses: [position.house],
                    strength: 'Weak'
                });
            }
        }

        return yogas;
    }

    private static getHouseLord(house: HouseNumber, planetPositions: Record<Planet, PlanetPosition>): Planet | null {
        // This is a simplified version - in reality, you'd need the full chart to determine house lords
        // For now, we'll use a basic mapping
        const houseToSign: Record<HouseNumber, ZodiacSign> = {
            1: 'aries',
            2: 'taurus',
            3: 'gemini',
            4: 'cancer',
            5: 'leo',
            6: 'virgo',
            7: 'libra',
            8: 'scorpio',
            9: 'sagittarius',
            10: 'capricorn',
            11: 'aquarius',
            12: 'pisces'
        };

        const sign = houseToSign[house];
        return ZodiacUtils.getSignLord(sign);
    }

    private static arePlanetsConnected(pos1: PlanetPosition, pos2: PlanetPosition, allPositions: Record<Planet, PlanetPosition>): boolean {
        // Check for conjunction (same house or within 10 degrees)
        if (pos1.house === pos2.house || Math.abs(pos1.longitude - pos2.longitude) <= 10) {
            return true;
        }

        // Check for aspect (7th house from each other)
        const houseDiff = Math.abs(pos1.house - pos2.house);
        return houseDiff === 6; // 7th house relationship
    }

    private static isKendraLord(planet: Planet, planetPositions: Record<Planet, PlanetPosition>): boolean {
        // Simplified check - in reality, this depends on the ascendant
        const kendraHouses: HouseNumber[] = [1, 4, 7, 10];
        return kendraHouses.some(house => this.getHouseLord(house, planetPositions) === planet);
    }

    private static calculateYogaStrength(planets: Planet[], planetPositions: Record<Planet, PlanetPosition>): 'Weak' | 'Moderate' | 'Strong' {
        let totalStrength = 0;

        for (const planet of planets) {
            const position = planetPositions[planet];
            if (position) {
                totalStrength += PlanetUtils.getPlanetStrength(planet, position.sign, position.degree);
            }
        }

        const avgStrength = totalStrength / planets.length;

        if (avgStrength >= 50) return 'Strong';
        if (avgStrength >= 0) return 'Moderate';
        return 'Weak';
    }
}
