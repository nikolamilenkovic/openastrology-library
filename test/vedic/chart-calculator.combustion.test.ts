import { VedicAstrologyCalculator } from '../../src';

describe('VedicAstrologyCalculator - Combustion Tests', () => {
    let calculator: VedicAstrologyCalculator;

    beforeEach(() => {
        calculator = new VedicAstrologyCalculator();
    });

    afterEach(() => {
        calculator.dispose();
    });

    describe('Planetary Combustion', () => {
        test('should identify Mars as combust when within 17 degrees of Sun', () => {
            const sunLongitude = 100; // 10° Leo
            const marsLongitude = 110; // 20° Leo (10° from Sun)
            
            const combustionInfo = calculator.getCombustionInfo('mars', marsLongitude, sunLongitude);
            
            expect(combustionInfo.isCombust).toBe(true);
            expect(combustionInfo.distance).toBe(10);
            expect(combustionInfo.combustionDistance).toBe(17);
            expect(combustionInfo.severity).toBe('Moderate'); // 10/17 = 58.8% - moderate
        });

        test('should identify Mercury as severely combust when very close to Sun', () => {
            const sunLongitude = 150; // 0° Virgo
            const mercuryLongitude = 152; // 2° Virgo (2° from Sun)
            
            const combustionInfo = calculator.getCombustionInfo('mercury', mercuryLongitude, sunLongitude);
            
            expect(combustionInfo.isCombust).toBe(true);
            expect(combustionInfo.distance).toBe(2);
            expect(combustionInfo.combustionDistance).toBe(14);
            expect(combustionInfo.severity).toBe('Severe');
        });

        test('should not consider Venus combust when beyond 10 degrees from Sun', () => {
            const sunLongitude = 200; // 20° Libra
            const venusLongitude = 215; // 5° Scorpio (15° from Sun)
            
            const combustionInfo = calculator.getCombustionInfo('venus', venusLongitude, sunLongitude);
            
            expect(combustionInfo.isCombust).toBe(false);
            expect(combustionInfo.distance).toBe(15);
            expect(combustionInfo.combustionDistance).toBe(10);
            expect(combustionInfo.severity).toBeUndefined();
        });

        test('should handle distance calculation across 0 degrees', () => {
            const sunLongitude = 350; // 20° Pisces
            const jupiterLongitude = 5; // 5° Aries (15° from Sun)
            
            const combustionInfo = calculator.getCombustionInfo('jupiter', jupiterLongitude, sunLongitude);
            
            expect(combustionInfo.distance).toBe(15);
            expect(combustionInfo.isCombust).toBe(false); // Jupiter combustion distance is 11°
        });

        test('should never consider Sun as combust', () => {
            const sunLongitude = 100;
            
            const combustionInfo = calculator.getCombustionInfo('sun', sunLongitude, sunLongitude);
            
            expect(combustionInfo.isCombust).toBe(false);
            expect(combustionInfo.distance).toBe(0);
            expect(combustionInfo.combustionDistance).toBe(0);
        });

        test('should never consider Rahu and Ketu as combust', () => {
            const sunLongitude = 100;
            const rahuLongitude = 105; // 5° from Sun
            const ketuLongitude = 285; // Opposite to Rahu
            
            const rahuInfo = calculator.getCombustionInfo('rahu', rahuLongitude, sunLongitude);
            const ketuInfo = calculator.getCombustionInfo('ketu', ketuLongitude, sunLongitude);
            
            expect(rahuInfo.isCombust).toBe(false);
            expect(ketuInfo.isCombust).toBe(false);
        });

        test('should categorize combustion severity correctly', () => {
            const sunLongitude = 180; // 0° Libra

            // Severe combustion (within 30% of combustion distance)
            const saturn1 = 182; // 2° from Sun (2/15 = 13.3%)
            const severe = calculator.getCombustionInfo('saturn', saturn1, sunLongitude);
            expect(severe.severity).toBe('Severe');

            // Moderate combustion (within 60% of combustion distance)
            const saturn2 = 187; // 7° from Sun (7/15 = 46.7%)
            const moderate = calculator.getCombustionInfo('saturn', saturn2, sunLongitude);
            expect(moderate.severity).toBe('Moderate');

            // Mild combustion (within combustion distance but > 60%)
            const saturn3 = 192; // 12° from Sun (12/15 = 80%)
            const mild = calculator.getCombustionInfo('saturn', saturn3, sunLongitude);
            expect(mild.severity).toBe('Mild');
        });
    });
});
