import { WesternAstrologyCalculator } from '../../src';
import { BirthInfo, FormattingUtils, ZodiacSign, HouseNumber } from '../../src';
import { WesternAspectType } from '../../src';

const dms2deg = FormattingUtils.formattedDMStoDegrees;

const PERSON1: BirthInfo = {
    name: 'Test Person 1',
    dateOfBirth: '1997-01-01',
    timeOfBirth: '18:05', // UTC birth time: 17:05 on 1997-01-01
    latitude: 44.013090634765135,
    longitude: 20.912069659730275,
    timezone: 'Europe/Belgrade'
};

type PlanetExpected = {
    sign: ZodiacSign;
    degree: string;       // DMS format "DD:MM:SS"
    longitude: number;    // absolute tropical longitude 0–360
    house: HouseNumber;
    isRetrograde: boolean;
    dignity: string;      // 'Exalted' | 'Domicile' | 'Detriment' | 'Fall' | 'Neutral'
};

const si: Record<ZodiacSign, number> = { // for quick sign-to-degree
    aries: 0,
    taurus: 1,
    gemini: 2,
    cancer: 3,
    leo: 4,
    virgo: 5,
    libra: 6,
    scorpio: 7,
    sagittarius: 8,
    capricorn: 9,
    aquarius: 10,
    pisces: 11
};

const EXPECTED = {
    ascendant: {
        sign:      'leo',
        degree:    '05:30:00',
        longitude: si.leo * 30 + dms2deg('05:30:00')
    },

    planets: {
        sun: {
            sign:         'capricorn',   degree: '11:19:59',  longitude: si.capricorn * 30 + dms2deg('11:19:59'),
            house:        6,  isRetrograde: false,  dignity: 'Neutral'
        } as PlanetExpected,
        moon: {
            sign:         'libra',   degree: '07:18:28',  longitude: si.libra * 30 + dms2deg('07:18:28'),
            house:        3,  isRetrograde: false,  dignity: 'Neutral'
        } as PlanetExpected,
        mercury: {
            sign:         'capricorn',   degree: '12:09:09',  longitude: si.capricorn * 30 + dms2deg('12:09:09'),
            house:        6,  isRetrograde: true,  dignity: 'Neutral'
        } as PlanetExpected,
        venus: {
            sign:         'sagittarius',   degree: '19:20:13',  longitude: si.sagittarius * 30 + dms2deg('19:20:13'),
            house:        5,  isRetrograde: false,  dignity: 'Neutral'
        } as PlanetExpected,
        mars: {
            sign:         'virgo',   degree: '29:28:22',  longitude: si.virgo * 30 + dms2deg('29:28:22'),
            house:        3,  isRetrograde: false,  dignity: 'Neutral'
        } as PlanetExpected,
        jupiter: {
            sign:         'capricorn',   degree: '25:20:03',  longitude: si.capricorn * 30 + dms2deg('25:20:03'),
            house:        6,  isRetrograde: false,  dignity: 'Fall'
        } as PlanetExpected,
        saturn: {
            sign:         'aries',   degree: '01:22:18',  longitude: si.aries * 30 + dms2deg('01:22:18'),
            house:        9,  isRetrograde: false,  dignity: 'Fall'
        } as PlanetExpected,
        uranus: {
            sign:         'aquarius',   degree: '03:18:32',  longitude: si.aquarius * 30 + dms2deg('03:18:32'),
            house:        6,  isRetrograde: false,  dignity: 'Domicile'
        } as PlanetExpected,
        neptune: {
            sign:         'capricorn',   degree: '26:51:16',  longitude: si.capricorn * 30 + dms2deg('26:51:16'),
            house:        6,  isRetrograde: false,  dignity: 'Neutral'
        } as PlanetExpected,
        pluto: {
            sign:         'sagittarius',   degree: '04:24:36',  longitude: si.sagittarius * 30 + dms2deg('04:24:36'),
            house:        5,  isRetrograde: false,  dignity: 'Neutral'
        } as PlanetExpected,
        true_node: {
            sign:         'libra',   degree: '02:26:17',  longitude: si.libra * 30 + dms2deg('02:26:17'),
            house:        3,  isRetrograde: false,   dignity: 'Neutral'
        } as PlanetExpected,
        chiron: {
            sign:         'scorpio',   degree: '00:16:14',  longitude: si.scorpio * 30 + dms2deg('00:16:14'),
            house:        4,  isRetrograde: false,  dignity: 'Neutral'
        } as PlanetExpected
    },
    houses: {
        1:  { cusp: si.leo * 30 + dms2deg('05:30:02'), sign: 'leo' },
        2:  { cusp: si.leo * 30 + dms2deg('24:59:44'), sign: 'leo' },
        3:  { cusp: si.virgo * 30 + dms2deg('19:04:01'), sign: 'virgo' },
        4:  { cusp: si.libra * 30 + dms2deg('20:05:32'), sign: 'libra' },
        5:  { cusp: si.scorpio * 30 + dms2deg('27:32:14'), sign: 'scorpio' },
        6:  { cusp: si.capricorn * 30 + dms2deg('04:35:04'), sign: 'capricorn' },
        7:  { cusp: si.aquarius * 30 + dms2deg('05:30:02'), sign: 'aquarius' },
        8:  { cusp: si.aquarius * 30 + dms2deg('24:59:44'), sign: 'aquarius' },
        9:  { cusp: si.pisces * 30 + dms2deg('19:04:01'), sign: 'pisces' },
        10: { cusp: si.aries * 30 + dms2deg('20:05:32'), sign: 'aries' },
        11: { cusp: si.taurus * 30 + dms2deg('27:32:14'), sign: 'taurus' },
        12: { cusp: si.cancer * 30 + dms2deg('04:35:04'), sign: 'cancer' }
    } as Record<HouseNumber, { cusp: number; sign: ZodiacSign }>,

    housePlanets: {
        1:  [],
        2:  [],
        3:  ['mars', 'true_node', 'moon'],
        4:  ['chiron'],
        5:  ['pluto', 'venus'],
        6:  ['sun', 'mercury', 'jupiter', 'neptune', 'uranus'],
        7:  [],
        8:  [],
        9:  ['saturn'],
        10: [],
        11: [],
        12: []
    } as Record<HouseNumber, string[]>,

    keyAspects: [
        // Conjunctions
        { planet1: 'sun',       planet2: 'mercury',   type: 'conjunction' as WesternAspectType }, // 0°49'
        { planet1: 'moon',      planet2: 'mars',       type: 'conjunction' as WesternAspectType }, // 7°50'
        { planet1: 'moon',      planet2: 'true_node',  type: 'conjunction' as WesternAspectType }, // 4°52'
        { planet1: 'mars',      planet2: 'true_node',  type: 'conjunction' as WesternAspectType }, // 2°58'
        { planet1: 'jupiter',   planet2: 'neptune',    type: 'conjunction' as WesternAspectType }, // 1°31'
        { planet1: 'jupiter',   planet2: 'uranus',     type: 'conjunction' as WesternAspectType }, // 7°58'
        { planet1: 'uranus',    planet2: 'neptune',    type: 'conjunction' as WesternAspectType }, // 6°27'
        // Squares
        { planet1: 'sun',       planet2: 'moon',       type: 'square' as WesternAspectType },      // 4°02'
        { planet1: 'moon',      planet2: 'mercury',    type: 'square' as WesternAspectType },      // 4°51'
        { planet1: 'jupiter',   planet2: 'chiron',     type: 'square' as WesternAspectType },      // 4°56'
        { planet1: 'uranus',    planet2: 'chiron',     type: 'square' as WesternAspectType },      // 3°02'
        { planet1: 'neptune',   planet2: 'chiron',     type: 'square' as WesternAspectType },      // 3°25'
        // Trines
        { planet1: 'moon',      planet2: 'uranus',     type: 'trine' as WesternAspectType },       // 4°00'
        { planet1: 'mars',      planet2: 'jupiter',    type: 'trine' as WesternAspectType },       // 4°08'
        { planet1: 'mars',      planet2: 'uranus',     type: 'trine' as WesternAspectType },       // 3°50'
        { planet1: 'mars',      planet2: 'neptune',    type: 'trine' as WesternAspectType },       // 2°37'
        { planet1: 'saturn',    planet2: 'pluto',      type: 'trine' as WesternAspectType },       // 3°02'
        { planet1: 'jupiter',   planet2: 'true_node',  type: 'trine' as WesternAspectType },       // 7°06'
        { planet1: 'uranus',    planet2: 'true_node',  type: 'trine' as WesternAspectType },       // 0°52'
        { planet1: 'neptune',   planet2: 'true_node',  type: 'trine' as WesternAspectType },       // 5°35'
        // Sextiles
        { planet1: 'moon',      planet2: 'pluto',      type: 'sextile' as WesternAspectType },     // 2°54'
        { planet1: 'mars',      planet2: 'pluto',      type: 'sextile' as WesternAspectType },     // 4°56'
        { planet1: 'uranus',    planet2: 'pluto',      type: 'sextile' as WesternAspectType },     // 1°06'
        { planet1: 'saturn',    planet2: 'uranus',     type: 'sextile' as WesternAspectType },     // 1°56'
        { planet1: 'saturn',    planet2: 'neptune',    type: 'sextile' as WesternAspectType },     // 4°31'
        { planet1: 'pluto',     planet2: 'true_node',  type: 'sextile' as WesternAspectType },     // 1°58'
        // Oppositions
        { planet1: 'moon',      planet2: 'saturn',     type: 'opposition' as WesternAspectType },  // 5°56'
        { planet1: 'mars',      planet2: 'saturn',     type: 'opposition' as WesternAspectType },  // 1°54'
        { planet1: 'saturn',    planet2: 'true_node',  type: 'opposition' as WesternAspectType },  // 1°06'
        // Minor aspects
        { planet1: 'moon',      planet2: 'venus',      type: 'quintile' as WesternAspectType },    // 0°02' – extremely tight
        { planet1: 'mercury',   planet2: 'chiron',     type: 'quintile' as WesternAspectType },    // 0°07'
        { planet1: 'sun',       planet2: 'chiron',     type: 'quintile' as WesternAspectType },    // 0°56'
        { planet1: 'venus',     planet2: 'uranus',     type: 'semi-square' as WesternAspectType }, // 1°02'
        { planet1: 'mars',      planet2: 'chiron',     type: 'semi-sextile' as WesternAspectType },// 0°48'
        { planet1: 'saturn',    planet2: 'chiron',     type: 'quincunx' as WesternAspectType },    // 1°06'
    ] as Array<{ planet1: string; planet2: string; type: WesternAspectType }>
};

describe('WesternAstrologyCalculator Integration – Test Person 1', () => {
    let calculator: WesternAstrologyCalculator;
    let result: Awaited<ReturnType<WesternAstrologyCalculator['calculateChart']>>;

    beforeAll(async () => {
        calculator = new WesternAstrologyCalculator(); // default: Placidus
        result = await calculator.calculateChart(PERSON1);
    });

    afterAll(() => {
        calculator.dispose();
    });

    describe('birthDateUtc', () => {
        it('should be 1997-01-01 17:05 UTC (18:05 Belgrade = UTC+1)', () => {
            expect(result.birthDateUtc).toBeInstanceOf(Date);
            expect(result.birthDateUtc.getUTCFullYear()).toBe(1997);
            expect(result.birthDateUtc.getUTCMonth()).toBe(0); // January = 0
            expect(result.birthDateUtc.getUTCDate()).toBe(1);
            expect(result.birthDateUtc.getUTCHours()).toBe(17);
            expect(result.birthDateUtc.getUTCMinutes()).toBe(5);
        });
    });

    describe('Ascendant', () => {
        it('should have the correct sign', () => {
            expect(result.ascendant.sign).toBe(EXPECTED.ascendant.sign);
        });

        it('should have the correct degree (within 0.1°)', () => {
            expect(result.ascendant.degree).toBeWithinEpsilon(dms2deg(EXPECTED.ascendant.degree), 0.1);
        });

        it('should have the correct absolute longitude (within 0.1°)', () => {
            expect(result.ascendant.longitude).toBeWithinEpsilon(EXPECTED.ascendant.longitude, 0.1);
        });

        it('should have a formatted DMS string matching "DD:MM:SS" pattern', () => {
            expect(result.ascendant.degreeDMSFormatted).toMatch(/^\d{2}:\d{2}:\d{2}$/);
        });
    });

    describe('Planet Signs', () => {
        const planets = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'chiron', 'true_node'] as const;

        it.each(planets)('%s should be in the correct sign', (planet) => {
            expect(result.planets[planet].sign).toBe(EXPECTED.planets[planet].sign);
        });
    });

    describe('Planet Degrees (degree within sign)', () => {
        const planets = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'chiron', 'true_node'] as const;

        it.each(planets)('%s degree should be within 0.1° of expected', (planet) => {
            expect(result.planets[planet].degree).toBeWithinEpsilon(dms2deg(EXPECTED.planets[planet].degree), 0.1);
        });
    });

    describe('Planet Absolute Longitudes (0 - 360°)', () => {
        const planets = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'chiron', 'true_node'] as const;

        it.each(planets)('%s longitude should be within 0.1° of expected', (planet) => {
            expect(result.planets[planet].longitude).toBeWithinEpsilon(EXPECTED.planets[planet].longitude, 0.1);
        });
    });

    describe('Planet degreeDMSFormatted', () => {
        const planets = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'chiron', 'true_node'] as const;

        it.each(planets)('%s degreeDMSFormatted should match "DD:MM:SS"', (planet) => {
            expect(result.planets[planet].degreeDMSFormatted).toMatch(/^\d{2}:\d{2}:\d{2}$/);
        });
    });

    describe('Retrograde Status', () => {
        it('sun should not be retrograde', () => {
            expect(result.planets.sun.isRetrograde).toBe(EXPECTED.planets.sun.isRetrograde);
        });
        it('moon should not be retrograde', () => {
            expect(result.planets.moon.isRetrograde).toBe(EXPECTED.planets.moon.isRetrograde);
        });
        it('mercury retrograde status', () => {
            expect(result.planets.mercury.isRetrograde).toBe(EXPECTED.planets.mercury.isRetrograde);
        });
        it('venus retrograde status', () => {
            expect(result.planets.venus.isRetrograde).toBe(EXPECTED.planets.venus.isRetrograde);
        });
        it('mars retrograde status', () => {
            expect(result.planets.mars.isRetrograde).toBe(EXPECTED.planets.mars.isRetrograde);
        });
        it('jupiter retrograde status', () => {
            expect(result.planets.jupiter.isRetrograde).toBe(EXPECTED.planets.jupiter.isRetrograde);
        });
        it('saturn retrograde status', () => {
            expect(result.planets.saturn.isRetrograde).toBe(EXPECTED.planets.saturn.isRetrograde);
        });
        it('uranus retrograde status', () => {
            expect(result.planets.uranus.isRetrograde).toBe(EXPECTED.planets.uranus.isRetrograde);
        });
        it('neptune retrograde status', () => {
            expect(result.planets.neptune.isRetrograde).toBe(EXPECTED.planets.neptune.isRetrograde);
        });
        it('pluto retrograde status', () => {
            expect(result.planets.pluto.isRetrograde).toBe(EXPECTED.planets.pluto.isRetrograde);
        });
        it('chiron retrograde status', () => {
            expect(result.planets.chiron.isRetrograde).toBe(EXPECTED.planets.chiron.isRetrograde);
        });
        it('true_node retrograde status', () => {
            expect(result.planets.true_node.isRetrograde).toBe(EXPECTED.planets.true_node.isRetrograde);
        });
    });

    describe('Planet Dignity', () => {
        const planets = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'chiron', 'true_node'] as const;

        it.each(planets)('%s should have correct dignity', (planet) => {
            expect(result.planets[planet].dignity).toBe(EXPECTED.planets[planet].dignity);
        });

        it('dignity values should be valid', () => {
            const valid = ['Exalted', 'Domicile', 'Detriment', 'Fall', 'Neutral'];
            planets.forEach(planet => {
                expect(valid).toContain(result.planets[planet].dignity);
            });
        });
    });

    describe('Planet House Assignments', () => {
        const planets = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'chiron', 'true_node'] as const;

        it.each(planets)('%s should be in the correct house', (planet) => {
            expect(result.planets[planet].house).toBe(EXPECTED.planets[planet].house);
        });

        it('every planet house should be between 1 and 12', () => {
            planets.forEach(planet => {
                expect(result.planets[planet].house).toBeGreaterThanOrEqual(1);
                expect(result.planets[planet].house).toBeLessThanOrEqual(12);
            });
        });
    });

    describe('Planet Speed', () => {
        it('sun speed should be positive (never retrograde)', () => {
            expect(result.planets.sun.speed).toBeGreaterThan(0);
        });
        it('moon speed should be positive (never retrograde)', () => {
            expect(result.planets.moon.speed).toBeGreaterThan(0);
        });
        it('retrograde planets should have negative speed', () => {
            ['mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'chiron', 'true_node'].forEach((p) => {
                const planet = result.planets[p as keyof typeof result.planets];
                if (planet.isRetrograde) {
                    expect(planet.speed).toBeLessThan(0);
                } else {
                    expect(planet.speed).toBeGreaterThan(0);
                }
            });
        });
    });

    describe('House Cusps', () => {
        const houseNums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as HouseNumber[];

        it.each(houseNums)('house %i cusp should be within 0.1° of expected', (h) => {
            expect(result.houses[h].cusp).toBeWithinEpsilon(EXPECTED.houses[h].cusp, 0.1);
        });

        it.each(houseNums)('house %i should be in the correct sign', (h) => {
            expect(result.houses[h].sign).toBe(EXPECTED.houses[h].sign);
        });

        it('all 12 house cusps should be within 0–360°', () => {
            houseNums.forEach(h => {
                expect(result.houses[h].cusp).toBeGreaterThanOrEqual(0);
                expect(result.houses[h].cusp).toBeLessThan(360);
            });
        });

        it('house 7 cusp should be opposite to house 1 cusp (≈180° apart)', () => {
            const diff = Math.abs(result.houses[7].cusp - result.houses[1].cusp);
            const normalised = diff > 180 ? 360 - diff : diff;
            expect(normalised).toBeWithinEpsilon(180, 1);
        });
    });

    // ── House properties ──────────────────────────────────────────────────────

    describe('House Properties', () => {
        const angularHouses  = [1, 4, 7, 10] as HouseNumber[];
        const succedentHouses = [2, 5, 8, 11] as HouseNumber[];
        const cadentHouses   = [3, 6, 9, 12] as HouseNumber[];

        it('angular houses (1,4,7,10) should have strength 70', () => {
            angularHouses.forEach(h => {
                expect(result.houses[h].strength).toBe(70);
            });
        });
        it('succedent houses (2,5,8,11) should have strength 55', () => {
            succedentHouses.forEach(h => {
                expect(result.houses[h].strength).toBe(55);
            });
        });
        it('cadent houses (3,6,9,12) should have strength 40', () => {
            cadentHouses.forEach(h => {
                expect(result.houses[h].strength).toBe(40);
            });
        });
        it('every house should have a lord', () => {
            ([1,2,3,4,5,6,7,8,9,10,11,12] as HouseNumber[]).forEach(h => {
                expect(result.houses[h].lord).toBeDefined();
                expect(typeof result.houses[h].lord).toBe('string');
            });
        });
        it('every house should have a significance array', () => {
            ([1,2,3,4,5,6,7,8,9,10,11,12] as HouseNumber[]).forEach(h => {
                expect(Array.isArray(result.houses[h].significance)).toBe(true);
                expect(result.houses[h].significance.length).toBeGreaterThan(0);
            });
        });
    });

    describe('Planets in Houses', () => {
        const houseNums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as HouseNumber[];

        it('all 11 planets should be distributed across houses (no planet missing)', () => {
            const allAssigned = houseNums.flatMap(h => result.houses[h].planets);
            expect(allAssigned.length).toBe(12);
        });

        it.each(houseNums)('house %i should contain the expected planets', (h) => {
            const expected = EXPECTED.housePlanets[h];
            expect(result.houses[h].planets.length).toBe(expected.length);
            expected.forEach(p => expect(result.houses[h].planets).toContain(p));
        });

        it('the house in planet.house should match the house listing', () => {
            const planets = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'chiron', 'true_node'] as const;
            planets.forEach(planet => {
                const assignedHouse = result.planets[planet].house;
                expect(result.houses[assignedHouse].planets).toContain(planet);
            });
        });
    });

    describe('Aspects', () => {
        it('should return an array of aspects', () => {
            expect(Array.isArray(result.aspects)).toBe(true);
        });

        it('each aspect should have required fields', () => {
            result.aspects.forEach(aspect => {
                expect(aspect).toHaveProperty('planet1');
                expect(aspect).toHaveProperty('planet2');
                expect(aspect).toHaveProperty('type');
                expect(aspect).toHaveProperty('angle');
                expect(aspect).toHaveProperty('orb');
                expect(aspect).toHaveProperty('maxOrb');
                expect(aspect).toHaveProperty('isApplying');
            });
        });

        it('each aspect orb should not exceed its maxOrb', () => {
            result.aspects.forEach(aspect => {
                expect(aspect.orb).toBeLessThanOrEqual(aspect.maxOrb + 0.001);
            });
        });

        it('each aspect angle should be between 0 and 180°', () => {
            result.aspects.forEach(aspect => {
                expect(aspect.angle).toBeGreaterThanOrEqual(0);
                expect(aspect.angle).toBeLessThanOrEqual(180);
            });
        });

        it('should not have duplicate aspect pairs', () => {
            const pairs = new Set(result.aspects.map(a => [a.planet1, a.planet2].sort().join('+')));
            // Each unique planet pair appears at most once per aspect type
            const typedPairs = result.aspects.map(a => `${[a.planet1, a.planet2].sort().join('+')}-${a.type}`);
            const uniquePairs = new Set(typedPairs);
            expect(uniquePairs.size).toBe(typedPairs.length);
        });

        it('per-planet aspects should mirror the top-level aspects array', () => {
            result.aspects.forEach(aspect => {
                const p1Aspects = result.planets[aspect.planet1 as keyof typeof result.planets].aspects;
                const p2Aspects = result.planets[aspect.planet2 as keyof typeof result.planets].aspects;
                expect(p1Aspects.some(a => a.planet2 === aspect.planet2 && a.type === aspect.type)).toBe(true);
                expect(p2Aspects.some(a => a.planet1 === aspect.planet1 && a.type === aspect.type)).toBe(true);
            });
        });

        // Specific key aspects – fill EXPECTED.keyAspects from astro.com aspect table
        it('should contain all key aspects from astro.com', () => {
            EXPECTED.keyAspects.forEach(({ planet1, planet2, type }) => {
                const found = result.aspects.some(
                    a => a.type === type &&
                        ((a.planet1 === planet1 && a.planet2 === planet2) ||
                         (a.planet1 === planet2 && a.planet2 === planet1))
                );
                expect(found).toBe(true);
            });
        });
    });

    describe('Chart Patterns', () => {
        it('should return an array of patterns', () => {
            expect(Array.isArray(result.patterns)).toBe(true);
        });

        it('each pattern should have required fields', () => {
            result.patterns.forEach(pattern => {
                expect(pattern).toHaveProperty('type');
                expect(pattern).toHaveProperty('planets');
                expect(pattern).toHaveProperty('description');
                expect(Array.isArray(pattern.planets)).toBe(true);
                expect(pattern.planets.length).toBeGreaterThanOrEqual(2);
            });
        });

        it('valid pattern types should include only known types', () => {
            const validTypes = ['grand-trine', 't-square', 'grand-cross', 'stellium', 'yod'];
            result.patterns.forEach(pattern => {
                expect(validTypes).toContain(pattern.type);
            });
        });
    });

    describe('Structural Validity', () => {
        const validSigns: ZodiacSign[] = [
            'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
            'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
        ];
        const planets = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'chiron', 'true_node'] as const;

        it('all planets should have a valid zodiac sign', () => {
            planets.forEach(planet => {
                expect(validSigns).toContain(result.planets[planet].sign);
            });
        });

        it('ascendant should have a valid zodiac sign', () => {
            expect(validSigns).toContain(result.ascendant.sign);
        });

        it('all house signs should be valid zodiac signs', () => {
            ([1,2,3,4,5,6,7,8,9,10,11,12] as HouseNumber[]).forEach(h => {
                expect(validSigns).toContain(result.houses[h].sign);
            });
        });

        it('all planet degrees should be between 0 and 30', () => {
            planets.forEach(planet => {
                expect(result.planets[planet].degree).toBeGreaterThanOrEqual(0);
                expect(result.planets[planet].degree).toBeLessThan(30);
            });
        });

        it('all planet longitudes should be between 0 and 360', () => {
            planets.forEach(planet => {
                expect(result.planets[planet].longitude).toBeGreaterThanOrEqual(0);
                expect(result.planets[planet].longitude).toBeLessThan(360);
            });
        });

        it('all planets should have the correct name property', () => {
            planets.forEach(planet => {
                expect(result.planets[planet].name).toBe(planet);
            });
        });

        it('result should have all required top-level properties', () => {
            expect(result).toHaveProperty('birthDateUtc');
            expect(result).toHaveProperty('planets');
            expect(result).toHaveProperty('houses');
            expect(result).toHaveProperty('ascendant');
            expect(result).toHaveProperty('aspects');
            expect(result).toHaveProperty('patterns');
        });

        it('result.planets should contain all 12 western planets', () => {
            planets.forEach(planet => {
                expect(result.planets).toHaveProperty(planet);
            });
        });

        it('result.houses should contain all 12 houses', () => {
            ([1,2,3,4,5,6,7,8,9,10,11,12] as HouseNumber[]).forEach(h => {
                expect(result.houses).toHaveProperty(String(h));
            });
        });
    });

    describe('Error Handling', () => {
        it('should reject an invalid date format', async () => {
            const calc = new WesternAstrologyCalculator();
            await expect(calc.calculateChart({ ...PERSON1, dateOfBirth: 'not-a-date' }))
                .rejects.toThrow();
            calc.dispose();
        });

        it('should reject a future birth date', async () => {
            const calc = new WesternAstrologyCalculator();
            await expect(calc.calculateChart({ ...PERSON1, dateOfBirth: '2099-01-01' }))
                .rejects.toThrow();
            calc.dispose();
        });

        it('should reject an out-of-range latitude', async () => {
            const calc = new WesternAstrologyCalculator();
            await expect(calc.calculateChart({ ...PERSON1, latitude: 999 }))
                .rejects.toThrow();
            calc.dispose();
        });

        it('should work with an empty time (defaults to midnight)', async () => {
            const calc = new WesternAstrologyCalculator();
            const r = await calc.calculateChart({ ...PERSON1, timeOfBirth: '' });
            expect(r).toBeDefined();
            expect(r.planets).toBeDefined();
            calc.dispose();
        });
    });

    describe('Different House Systems', () => {
        const systems = ['placidus', 'koch', 'equal', 'campanus', 'regiomontanus', 'wholehouse'] as const;

        it.each(systems)('%s house system should produce a valid chart', async (houseSystem) => {
            const calc = new WesternAstrologyCalculator({ houseSystem });
            const r = await calc.calculateChart(PERSON1);
            expect(r.houses).toBeDefined();
            expect(r.ascendant).toBeDefined();
            calc.dispose();
        });
    });
});
