import { 
    Planet, 
    PlanetPosition, 
    AshtakavargaCalculations, 
    BhinnaAshtakavarga, 
    SarvaAshtakavarga,
    HouseNumber,
    ZodiacSign
} from './types/vedic.types';

export class AshtakavargaCalculator {
    
    // Ashtakavarga rules: Binary format where each array represents the 12 houses (1-12)
    // 1 = planet contributes a point to that house, 0 = no contribution
    // Format: [House1, House2, House3, House4, House5, House6, House7, House8, House9, House10, House11, House12]
    private static readonly ASHTAKAVARGA_RULES: Record<Planet | 'lagna', Partial<Record<Planet | 'lagna', number[]>>> = {
        sun: {
            sun:     [1, 1, 0, 1, 0, 0, 1, 1, 1, 1, 1, 0], // Sun gives points to houses 1,2,4,7,8,9,10,11 from Sun
            moon:    [0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 1, 0], // Houses 3,6,10,11
            mars:    [1, 1, 0, 1, 0, 0, 1, 1, 1, 1, 1, 0], // Houses 1,2,4,7,8,9,10,11
            mercury: [0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 1, 1], // Houses 3,5,6,9,10,11,12
            jupiter: [0, 0, 0, 0, 1, 1, 0, 0, 1, 0, 1, 0], // Houses 5,6,9,11
            venus:   [0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1], // Houses 6,7,12
            saturn:  [1, 1, 0, 1, 0, 0, 1, 1, 1, 1, 1, 0], // Houses 1,2,4,7,8,9,10,11
            lagna:   [0, 0, 1, 1, 0, 1, 0, 0, 0, 1, 1, 1]  // Houses 3,4,6,10,11,12
        },
        moon: {
            sun:     [0, 0, 1, 0, 0, 1, 1, 1, 0, 1, 1, 0], // Houses 3,6,7,8,10,11
            moon:    [1, 0, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0], // Houses 1,3,6,7,10,11
            mars:    [0, 1, 1, 0, 1, 1, 0, 0, 1, 1, 1, 0], // Houses 2,3,5,6,10,11
            mercury: [1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0], // Houses 1,3,4,5,7,8,10,11
            jupiter: [1, 0, 0, 1, 0, 0, 1, 1, 0, 1, 1, 1], // Houses 1,4,7,8,10,11,12
            venus:   [0, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0], // Houses 3,4,5,7,9,10,11
            saturn:  [0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 1, 0], // Houses 3,5,6,11
            lagna:   [0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 1, 0]  // Houses 3,6,10,11 
        },
        mars: {
            sun:     [0, 0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 0], // Houses 3,5,6,10,11
            moon:    [0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0], // Houses 3,6,11
            mars:    [1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 1, 0], // Houses 1,2,4,7,8,10,11
            mercury: [0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 1, 0], // Houses 3,5,6,11
            jupiter: [0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1], // Houses 6,10,11,12
            venus:   [0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 1], // Houses 6,8,11,12
            saturn:  [1, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 0], // Houses 1,4,7,8,9,10,11
            lagna:   [1, 0, 1, 0, 0, 1, 0, 0, 0, 1, 1, 0]  // Houses 1,3,6,10,11,12
        },
        mercury: {
            sun:     [0, 0, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1], // Houses 5,6,9,11,12
            moon:    [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0], // Houses 2,4,6,8,10,11
            mars:    [1, 1, 0, 1, 0, 0, 1, 1, 1, 1, 1, 0], // Houses 1,2,4,7,8,9,10,11
            mercury: [1, 0, 1, 0, 1, 1, 0, 0, 1, 1, 1, 1], // Houses 1,3,5,6,9,10,11,12
            jupiter: [0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 1], // Houses 6,8,11,12
            venus:   [1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 0], // Houses 1,2,3,4,5,8,9,11
            saturn:  [1, 1, 0, 1, 0, 0, 1, 1, 1, 1, 1, 0], // Houses 1,2,4,7,8,9,10,11
            lagna:   [1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0]  // Houses 1,2,4,6,7,8,10,11
        },
        jupiter: {
            sun:     [1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0], // Houses 1,2,3,4,7,8,9,10,11
            moon:    [0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0], // Houses 2,5,7,9,11
            mars:    [1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 1, 0], // Houses 1,2,4,7,8,10,11
            mercury: [1, 1, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0], // Houses 1,2,4,5,6,9,10,11
            jupiter: [1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 1, 0], // Houses 1,2,3,4,7,8,10,11
            venus:   [0, 1, 0, 0, 1, 1, 0, 0, 1, 1, 1, 0], // Houses 2,5,6,9,10,11
            saturn:  [0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 1], // Houses 3,5,6,12
            lagna:   [1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 0]  // Houses 1,2,4,5,6,7,8,10,11
        },
        venus: {
            sun:     [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1], // Houses 8,11,12
            moon:    [1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 1], // Houses 1,2,3,4,5,8,9,11,12
            mars:    [0, 0, 1, 0, 1, 1, 0, 0, 1, 0, 1, 1], // Houses 3,4,6,9,11,12
            mercury: [0, 0, 1, 0, 1, 1, 0, 0, 1, 0, 1, 0], // Houses 3,5,6,9,11
            jupiter: [0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 0], // Houses 5,8,9,10,11
            venus:   [1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0], // Houses 1,2,3,4,5,8,9,10,11
            saturn:  [0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0], // Houses 3,4,5,8,9,10,11
            lagna:   [1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 0]  // Houses 1,2,3,4,5,8,9,10,11
        },
        saturn: {
            sun:     [1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 1, 0], // Houses 1,2,4,7,8,10,11
            moon:    [0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0], // Houses 3,6,11
            mars:    [0, 0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1], // Houses 3,5,6,10,11,12
            mercury: [0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1], // Houses 6,8,9,10,11,12
            jupiter: [0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1], // Houses 5,6,11,12
            venus:   [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1], // Houses 6,11,12
            saturn:  [0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 1, 0], // Houses 3,5,6,11
            lagna:   [1, 0, 1, 1, 0, 1, 0, 0, 0, 1, 1, 0]  // Houses 1,3,4,6,10,11
        },
        rahu: { // Ignores Rahu and Ketu for Ashtakavarga calculations
            sun:     [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            moon:    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            mars:    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            mercury: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            jupiter: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            venus:   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            saturn:  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            lagna:   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        },
        ketu: {
            sun:     [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            moon:    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            mars:    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            mercury: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            jupiter: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            venus:   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            saturn:  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            lagna:   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        },
        lagna: {
            sun:     [0, 0, 1, 1, 0, 1, 0, 0, 0, 1, 1, 1], // Houses 3,4,6,10,11,12
            moon:    [0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 1, 1], // Houses 3,6,10,11,12
            mars:    [1, 0, 1, 0, 0, 1, 0, 0, 0, 1, 1, 0], // Houses 1,3,6,10,11
            mercury: [1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0], // Houses 1,2,4,6,8,10,11
            jupiter: [1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 0], // Houses 1,2,4,5,6,7,9,10,11
            venus:   [1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0], // Houses 1,2,3,4,5,8,9,11
            saturn:  [1, 0, 1, 1, 0, 1, 0, 0, 0, 1, 1, 0], // Houses 1,3,4,6,10,11
            lagna:   [0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 1, 0], // Houses 3,6,10,11
        }
    };

    /**
     * Calculate contribution matrix for a specific target planet from all contributors
     * Returns a Record where each contributor maps to their 12-house contribution array for the target
     */
    private static calculateContributionMatrix(
        targetPlanet: Planet | 'lagna',
        planets: Record<Planet, PlanetPosition>
    ): Record<Planet | 'lagna', number[]> {
        
        const contributors: (Planet | 'lagna')[] = [...Object.keys(planets) as Planet[], 'lagna'];
        const contributionMatrix: Partial<Record<Planet | 'lagna', number[]>> = {};
        
        // Get target planet's house position
        const targetHouse = targetPlanet === 'lagna' 
            ? 1 // Lagna is always 1st house
            : planets[targetPlanet as Planet].house;
        
        // For each contributing planet/lagna
        for (const contributor of contributors) {
            const housePoints: number[] = new Array(12).fill(0);
            
            // Get the rules for this contributor -> target combination
            const rules = contributor === 'lagna' 
                ? this.ASHTAKAVARGA_RULES.lagna 
                : this.ASHTAKAVARGA_RULES[contributor];
            
            if (rules && rules[targetPlanet]) {
                const binaryArray = rules[targetPlanet];
                
                // If contributor and target are the same, no rotation needed
                if (contributor === targetPlanet) {
                    for (let i = 0; i < 12; i++) {
                        housePoints[i] = binaryArray[i];
                    }
                } else {
                    // Get contributing planet's house position
                    const contributorHouse = contributor === 'lagna' 
                        ? 1 // Lagna is always 1st house
                        : planets[contributor].house;
                    
                    // Calculate rotation based on target planet's position relative to contributor
                    const rotationOffset = (contributorHouse - targetHouse + 12) % 12;
                    
                    // Rotate the array
                    for (let i = 0; i < 12; i++) {
                        const originalIndex = (i + rotationOffset) % 12;
                        housePoints[i] = binaryArray[originalIndex];
                    }
                }
            }
            
            contributionMatrix[contributor] = housePoints;
        }
        
        return contributionMatrix as Record<Planet | 'lagna', number[]>;
    }

    /**
     * Calculate complete Ashtakavarga for all planets
     */
    public static calculateAshtakavarga(
        planets: Record<Planet, PlanetPosition>,
        lagnaSign: ZodiacSign
    ): AshtakavargaCalculations {
        
        // Calculate Bhinna Ashtakavarga for each planet
        const bhinna = this.calculateBhinnaAshtakavarga(planets);
        
        // Calculate Sarva Ashtakavarga (summary by houses)
        const sarva = this.calculateSarvaAshtakavarga(bhinna, planets, lagnaSign);
        
        return {
            bhinna,
            sarva
        };
    }

    /**
     * Calculate Bhinna Ashtakavarga - nested structure showing points assigned from each contributor to each target planet
     */
    private static calculateBhinnaAshtakavarga(
        planets: Record<Planet, PlanetPosition>
    ): BhinnaAshtakavarga {
        
        const bhinna: Partial<BhinnaAshtakavarga> = {};
        const targetPlanets: (Planet | 'lagna')[] = [...Object.keys(planets) as Planet[], 'lagna'];
        
        // For each target planet/lagna, get the contribution matrix
        for (const targetPlanet of targetPlanets) {
            const contributionMatrix = this.calculateContributionMatrix(targetPlanet, planets);
            
            // Add each contributor's contributions to the bhinna structure
            for (const [contributor, contributions] of Object.entries(contributionMatrix)) {
                if (!bhinna[contributor as Planet | 'lagna']) {
                    bhinna[contributor as Planet | 'lagna'] = {} as Record<Planet | 'lagna', number[]>;
                }
                bhinna[contributor as Planet | 'lagna']![targetPlanet] = contributions;
            }
        }
        
        return bhinna as BhinnaAshtakavarga;
    }

    /**
     * Calculate Sarva Ashtakavarga - total points for each target planet in each absolute house (Aries to Pisces)
     * Sums up all contributions TO each target planet from all contributors
     */
    private static calculateSarvaAshtakavarga(
        bhinna: BhinnaAshtakavarga,
        planets: Record<Planet, PlanetPosition>,
        lagnaSign: ZodiacSign
    ): SarvaAshtakavarga {
        
        const sarva: Partial<SarvaAshtakavarga> = {};
        const relevantPlanets: (Planet | 'lagna')[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'lagna'];
        
        // Sign names in order from Aries (1) to Pisces (12)
        const signNames = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 
                          'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];
        
        // For each target planet/lagna, sum up all contributions from all contributors
        for (const targetPlanet of relevantPlanets) {            
            // Get the contribution matrix for this target planet
            const contributionMatrix = bhinna[targetPlanet];
            const totalHousePoints: number[] = new Array(24).fill(0);

            // Sum contributions from all contributors
            for (const [_, contributions] of Object.entries(contributionMatrix)) {
                // For each house, add the points from this contributor
                for (let houseIndex = 0; houseIndex < 12; houseIndex++) {
                    totalHousePoints[houseIndex] += contributions[houseIndex];
                    totalHousePoints[houseIndex + 12] = totalHousePoints[houseIndex]; // So that we can rotate from aries to pisces
                }
            }

            // Determine the sign of the target planet
            const planetSignIndex = targetPlanet === 'lagna'
                ? signNames.indexOf(lagnaSign)
                : signNames.indexOf(planets[targetPlanet].sign);

            // See from where do we start getting points (where Aries is)
            // If taurus, aries is at index 11 [tau, gem, can, leo, vir, lib, sco, sag, cap, aqu, pis, ari, ...]
            // If gemini, aries is at index 10 [gem, can, leo, vir, lib, sco, sag, cap, aqu, pis, ari, tau, ...]
            // ...
            // If pisces, aries is at index 1 [pis, ari, tau, gem, can, leo, vir, lib, sco, sag, cap, aqu, ...]
            const ariesIndex = planetSignIndex !== 0 ? 12 - planetSignIndex : 0;

            sarva[targetPlanet] = totalHousePoints.slice(ariesIndex, ariesIndex + 12);
        }
        
        return sarva as SarvaAshtakavarga;
    }

    /**
     * Get summary statistics for Ashtakavarga
     */
    public static getAshtakavargaSummary(ashtakavarga: AshtakavargaCalculations): {
        totalPoints: number;
        strongestPlanet: { planet: Planet | 'lagna'; points: number };
        weakestPlanet: { planet: Planet | 'lagna'; points: number };
        strongestHouse: { house: HouseNumber; points: number };
        weakestHouse: { house: HouseNumber; points: number };
        averagePoints: number;
    } {
        // Calculate total points and find strongest/weakest contributors
        let totalPoints = 0;
        let strongestPlanet = { planet: 'sun' as Planet | 'lagna', points: 0 };
        let weakestPlanet = { planet: 'sun' as Planet | 'lagna', points: 999 };
        
        // Analyze Bhinna Ashtakavarga - sum up all points assigned by each contributor
        for (const [contributor, targetData] of Object.entries(ashtakavarga.bhinna) as [Planet | 'lagna', Record<Planet, number[]>][]) {
            let contributorTotal = 0;
            
            // Sum up all points this contributor gives to all target planets
            for (const targetPlanet of Object.keys(targetData) as Planet[]) {
                const housePoints = targetData[targetPlanet];
                contributorTotal += housePoints.reduce((sum, points) => sum + points, 0);
            }
            
            totalPoints += contributorTotal;
            
            if (contributorTotal > strongestPlanet.points) {
                strongestPlanet = { planet: contributor, points: contributorTotal };
            }
            
            if (contributorTotal < weakestPlanet.points) {
                weakestPlanet = { planet: contributor, points: contributorTotal };
            }
        }
        
        // Analyze houses - find strongest/weakest houses by total points received
        let strongestHouse = { house: 1 as HouseNumber, points: 0 };
        let weakestHouse = { house: 1 as HouseNumber, points: 999 };
        
        // Calculate house totals using the new Sarva structure
        for (let houseIndex = 0; houseIndex < 12; houseIndex++) {
            const house = (houseIndex + 1) as HouseNumber;
            let houseTotal = 0;
            
            // Sum points for all target planets in this house
            for (const [targetPlanet, housePoints] of Object.entries(ashtakavarga.sarva) as [Planet | 'lagna', number[]][]) {
                houseTotal += housePoints[houseIndex];
            }
            
            if (houseTotal > strongestHouse.points) {
                strongestHouse = { house, points: houseTotal };
            }
            
            if (houseTotal < weakestHouse.points) {
                weakestHouse = { house, points: houseTotal };
            }
        }
        
        const averagePoints = totalPoints / Object.keys(ashtakavarga.bhinna).length;
        
        return {
            totalPoints,
            strongestPlanet,
            weakestPlanet,
            strongestHouse,
            weakestHouse,
            averagePoints
        };
    }
}
