import { WesternAstrologyCalculator } from '../../src';
import { BirthInfo } from '../../src';

// Mock sweph module (tropical mode - no sidereal flags needed)
jest.mock('sweph', () => ({
    constants: {
        SE_SUN: 0,
        SE_MOON: 1,
        SE_MERCURY: 2,
        SE_VENUS: 3,
        SE_MARS: 4,
        SE_JUPITER: 5,
        SE_SATURN: 6,
        SE_URANUS: 7,
        SE_NEPTUNE: 8,
        SE_PLUTO: 9,
        SE_CHIRON: 15,
        SE_GREG_CAL: 1,
        SEFLG_SPEED: 256,
    },

    set_ephe_path: jest.fn(),
    julday: jest.fn().mockReturnValue(2448059.041667),
    calc: jest.fn().mockImplementation((_jd: number, planet: number, _flags: number) => {
        // Tropical positions (slightly higher than sidereal since no ayanamsa removed)
        const positions: Record<number, number> = {
            0: 84.33,    // Sun ~24° Gemini tropical
            1: 348.15,   // Moon ~18° Pisces tropical
            2: 73.50,    // Mercury ~13° Gemini
            3: 61.20,    // Venus ~1° Gemini
            4: 95.80,    // Mars ~5° Cancer
            5: 110.40,   // Jupiter ~20° Cancer
            6: 295.70,   // Saturn ~25° Capricorn
            7: 280.10,   // Uranus ~10° Capricorn
            8: 283.40,   // Neptune ~13° Capricorn
            9: 224.90,   // Pluto ~14° Scorpio
            11: 285.00,  // North Node
            12: 100.00,  // Lilith
            15: 90.55    // Chiron ~0° Cancer
        };
        const lon = positions[planet] ?? 0;
        return {
            flag: 0,
            error: '',
            data: [lon, 0.0, 1.0, planet === 7 ? -0.01 : 1.0, 0.0, 0.0]
        };
    }),
    houses: jest.fn().mockReturnValue({
        flag: 0,
        data: {
            houses: [
                45.0,  // H1
                75.0,  // H2
                105.0, // H3
                135.0, // H4
                165.0, // H5
                195.0, // H6
                225.0, // H7
                255.0, // H8
                285.0, // H9
                315.0, // H10
                345.0, // H11
                15.0   // H12
            ],
            points: [45.0, 315.0, 0, 0, 0, 0, 0, 0]
        }
    }),
    close: jest.fn()
}));

const birthInfo: BirthInfo = {
    name: 'Test Person',
    dateOfBirth: '1990-06-15',
    timeOfBirth: '13:00',
    latitude: 51.5074,
    longitude: -0.1278,
    timezone: 'Europe/London'
};

describe('WesternAstrologyCalculator', () => {
    let calculator: WesternAstrologyCalculator;

    beforeEach(() => {
        calculator = new WesternAstrologyCalculator({ houseSystem: 'placidus' });
    });

    afterEach(() => {
        calculator.dispose();
    });

    describe('calculateChart', () => {
        it('returns a chart with all 14 Western planets/points', async () => {
            const chart = await calculator.calculateChart(birthInfo);
            const planetNames = Object.keys(chart.planets);
            expect(planetNames).toContain('sun');
            expect(planetNames).toContain('moon');
            expect(planetNames).toContain('uranus');
            expect(planetNames).toContain('neptune');
            expect(planetNames).toContain('pluto');
            expect(planetNames).toContain('chiron');
            expect(planetNames).toContain('north_node');
            expect(planetNames).toContain('south_node');
            expect(planetNames).toContain('lilith');
            expect(planetNames).toHaveLength(14);
        });

        it('does not include rahu or ketu', async () => {
            const chart = await calculator.calculateChart(birthInfo);
            expect(chart.planets).not.toHaveProperty('rahu');
            expect(chart.planets).not.toHaveProperty('ketu');
        });

        it('does not include ayanamsa (tropical chart)', async () => {
            const chart = await calculator.calculateChart(birthInfo);
            expect(chart).not.toHaveProperty('ayanamsa');
        });

        it('does not include dashas or nakshatras', async () => {
            const chart = await calculator.calculateChart(birthInfo);
            expect(chart).not.toHaveProperty('dashas');
            const sunPos = chart.planets.sun;
            expect(sunPos).not.toHaveProperty('nakshatra');
        });

        it('includes aspects in the result', async () => {
            const chart = await calculator.calculateChart(birthInfo);
            expect(Array.isArray(chart.aspects)).toBe(true);
        });

        it('includes patterns in the result', async () => {
            const chart = await calculator.calculateChart(birthInfo);
            expect(Array.isArray(chart.patterns)).toBe(true);
        });

        it('assigns planets to houses', async () => {
            const chart = await calculator.calculateChart(birthInfo);
            for (const planet of Object.values(chart.planets)) {
                expect(planet.house).toBeGreaterThanOrEqual(1);
                expect(planet.house).toBeLessThanOrEqual(12);
            }
        });

        it('marks retrograde planets correctly', async () => {
            const chart = await calculator.calculateChart(birthInfo);
            // Uranus is mocked with negative speed
            expect(chart.planets.uranus.isRetrograde).toBe(true);
            expect(chart.planets.sun.isRetrograde).toBe(false);
        });

        it('calculates Western dignities', async () => {
            const chart = await calculator.calculateChart(birthInfo);
            // All dignity values should be one of the expected strings
            const validDignities = ['Exalted', 'Fall', 'Domicile', 'Detriment', 'Neutral'];
            for (const planet of Object.values(chart.planets)) {
                expect(validDignities).toContain(planet.dignity);
            }
        });

        it('ascendant has no nakshatra property', async () => {
            const chart = await calculator.calculateChart(birthInfo);
            expect(chart.ascendant).not.toHaveProperty('nakshatra');
        });

        it('throws on invalid birth info', async () => {
            await expect(
                calculator.calculateChart({ ...birthInfo, dateOfBirth: 'not-a-date' })
            ).rejects.toThrow();
        });
    });

    describe('getAspectOrbs', () => {
        it('returns default orbs', () => {
            const orbs = calculator.getAspectOrbs();
            expect(orbs.conjunction).toBe(8);
            expect(orbs.trine).toBe(8);
            expect(orbs.quincunx).toBe(3);
        });

        it('merges custom orbs passed in constructor', () => {
            const calc = new WesternAstrologyCalculator({ orbs: { conjunction: 10 } });
            const orbs = calc.getAspectOrbs();
            expect(orbs.conjunction).toBe(10);
            expect(orbs.sextile).toBe(6); // default unchanged
            calc.dispose();
        });
    });
});
