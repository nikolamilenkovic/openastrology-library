import { VedicChartCalculations, ZodiacSign } from '../../src';
import { AshtakavargaCalculations, DivisionalChartCalculator } from '../../src';

describe(DivisionalChartCalculator.name, () => {
    let mockRashi: VedicChartCalculations;

    beforeEach(() => {
        mockRashi = {
            birthDateUtc: new Date('1990-05-15T14:30:00Z'),
            ashtakavarga: {} as AshtakavargaCalculations,
            planets: {
                sun: {
                    name: 'sun',
                    longitude: 54.5, // Taurus 24.5°
                    latitude: 0,
                    speed: 0.98,
                    house: 1,
                    sign: 'taurus',
                    degree: 24.5,
                    degreeDMS: { degrees: 24, minutes: 30, seconds: 0 },
                    degreeDMSFormatted: '24°30\'00"',
                    nakshatra: 'rohini',
                    nakshatraPada: 2,
                    pada: 2,
                    isRetrograde: false,
                    isCombust: false,
                    dignity: 'own_sign',
                    aspects: []
                },
                moon: {
                    name: 'moon',
                    longitude: 125.75, // Leo 5.75°
                    latitude: 0,
                    speed: 13.2,
                    house: 5,
                    sign: 'leo',
                    degree: 5.75,
                    degreeDMS: { degrees: 5, minutes: 45, seconds: 0 },
                    degreeDMSFormatted: '5°45\'00"',
                    nakshatra: 'magha',
                    nakshatraPada: 1,
                    pada: 1,
                    isRetrograde: false,
                    isCombust: false,
                    dignity: 'neutral',
                    aspects: []
                },
                mars: {
                    name: 'mars',
                    longitude: 30.0, // Taurus 0°
                    latitude: 0,
                    speed: 0.5,
                    house: 1,
                    sign: 'taurus',
                    degree: 0,
                    degreeDMS: { degrees: 0, minutes: 0, seconds: 0 },
                    degreeDMSFormatted: '0°00\'00"',
                    nakshatra: 'krittika',
                    nakshatraPada: 2,
                    pada: 2,
                    isRetrograde: false,
                    isCombust: false,
                    dignity: 'neutral',
                    aspects: []
                },
                mercury: {
                    name: 'mercury',
                    longitude: 72.25, // Gemini 12.25°
                    latitude: 0,
                    speed: 1.1,
                    house: 3,
                    sign: 'gemini',
                    degree: 12.25,
                    degreeDMS: { degrees: 12, minutes: 15, seconds: 0 },
                    degreeDMSFormatted: '12°15\'00"',
                    nakshatra: 'ardra',
                    nakshatraPada: 3,
                    pada: 3,
                    isRetrograde: false,
                    isCombust: true, // Mercury close to Sun
                    dignity: 'own_sign',
                    aspects: []
                },
                jupiter: {
                    name: 'jupiter',
                    longitude: 95.5, // Cancer 5.5°
                    latitude: 0,
                    speed: 0.2,
                    house: 4,
                    sign: 'cancer',
                    degree: 5.5,
                    degreeDMS: { degrees: 5, minutes: 30, seconds: 0 },
                    degreeDMSFormatted: '5°30\'00"',
                    nakshatra: 'pushya',
                    nakshatraPada: 1,
                    pada: 1,
                    isRetrograde: false,
                    isCombust: false,
                    dignity: 'exalted',
                    aspects: []
                },
                venus: {
                    name: 'venus',
                    longitude: 45.0, // Taurus 15°
                    latitude: 0,
                    speed: 1.2,
                    house: 1,
                    sign: 'taurus',
                    degree: 15,
                    degreeDMS: { degrees: 15, minutes: 0, seconds: 0 },
                    degreeDMSFormatted: '15°00\'00"',
                    nakshatra: 'rohini',
                    nakshatraPada: 3,
                    pada: 3,
                    isRetrograde: false,
                    isCombust: false,
                    dignity: 'own_sign',
                    aspects: []
                },
                saturn: {
                    name: 'saturn',
                    longitude: 270.0, // Capricorn 0°
                    latitude: 0,
                    speed: 0.03,
                    house: 10,
                    sign: 'capricorn',
                    degree: 0,
                    degreeDMS: { degrees: 0, minutes: 0, seconds: 0 },
                    degreeDMSFormatted: '0°00\'00"',
                    nakshatra: 'uttara_ashadha',
                    nakshatraPada: 2,
                    pada: 2,
                    isRetrograde: false,
                    isCombust: false,
                    dignity: 'own_sign',
                    aspects: []
                },
                rahu: {
                    name: 'rahu',
                    longitude: 315.0, // Aquarius 15°
                    latitude: 0,
                    speed: -0.05,
                    house: 11,
                    sign: 'aquarius',
                    degree: 15,
                    degreeDMS: { degrees: 15, minutes: 0, seconds: 0 },
                    degreeDMSFormatted: '15°00\'00"',
                    nakshatra: 'shatabhisha',
                    nakshatraPada: 2,
                    pada: 2,
                    isRetrograde: true,
                    isCombust: false, // Rahu not traditionally combust
                    dignity: 'neutral',
                    aspects: []
                },
                ketu: {
                    name: 'ketu',
                    longitude: 135.0, // Leo 15°
                    latitude: 0,
                    speed: -0.05,
                    house: 5,
                    sign: 'leo',
                    degree: 15,
                    degreeDMS: { degrees: 15, minutes: 0, seconds: 0 },
                    degreeDMSFormatted: '15°00\'00"',
                    nakshatra: 'purva_phalguni',
                    nakshatraPada: 2,
                    pada: 2,
                    isRetrograde: true,
                    isCombust: false, // Ketu not traditionally combust
                    dignity: 'neutral',
                    aspects: []
                }
            },
            houses: {
                1: { number: 1, cusp: 30, sign: 'taurus', lord: 'venus', planets: ['sun', 'mars', 'venus'], strength: 80, significance: ['Self', 'Personality', 'Physical Appearance'] },
                2: { number: 2, cusp: 60, sign: 'gemini', lord: 'mercury', planets: [], strength: 60, significance: ['Wealth', 'Speech', 'Family'] },
                3: { number: 3, cusp: 90, sign: 'cancer', lord: 'moon', planets: ['mercury'], strength: 70, significance: ['Siblings', 'Courage', 'Short Travels'] },
                4: { number: 4, cusp: 120, sign: 'leo', lord: 'sun', planets: ['jupiter'], strength: 85, significance: ['Mother', 'Home', 'Education'] },
                5: { number: 5, cusp: 150, sign: 'virgo', lord: 'mercury', planets: ['moon', 'ketu'], strength: 75, significance: ['Children', 'Creativity', 'Intelligence'] },
                6: { number: 6, cusp: 180, sign: 'libra', lord: 'venus', planets: [], strength: 50, significance: ['Enemies', 'Disease', 'Service'] },
                7: { number: 7, cusp: 210, sign: 'scorpio', lord: 'mars', planets: [], strength: 55, significance: ['Spouse', 'Partnership', 'Business'] },
                8: { number: 8, cusp: 240, sign: 'sagittarius', lord: 'jupiter', planets: [], strength: 45, significance: ['Longevity', 'Transformation', 'Occult'] },
                9: { number: 9, cusp: 270, sign: 'capricorn', lord: 'saturn', planets: [], strength: 65, significance: ['Father', 'Fortune', 'Dharma'] },
                10: { number: 10, cusp: 300, sign: 'aquarius', lord: 'saturn', planets: ['saturn'], strength: 70, significance: ['Career', 'Reputation', 'Status'] },
                11: { number: 11, cusp: 330, sign: 'pisces', lord: 'jupiter', planets: ['rahu'], strength: 60, significance: ['Gains', 'Friends', 'Aspirations'] },
                12: { number: 12, cusp: 0, sign: 'aries', lord: 'mars', planets: [], strength: 40, significance: ['Loss', 'Expenses', 'Liberation'] }
            },
            yogas: [],
            dashas: {
                vimshottari: {
                    type: 'vimshottari',
                    dashaPeriods: []
                }
            },
            ayanamsa: 24.1,
            ascendant: {
                sign: 'taurus' as ZodiacSign,
                degree: 0,
                degreeDMSFormatted: '0°00\'00"',
                nakshatra: 'krittika',
                nakshatraPada: 1,
                longitude: 30.0
            }
        };
    });

    describe('calculateDivisionalChart', () => {
        it('should calculate D1 (Rashi) chart correctly', () => {
            const result = DivisionalChartCalculator.calculateDivisionalChart(mockRashi, 'D1');
            
            expect(result).toBeDefined();
            expect(result.planets.sun.longitude).toBeCloseTo(54.5, 1);
            expect(result.planets.sun.sign).toBe('taurus');
            expect(result.ascendant.sign).toBe('taurus');
        });

        it('should calculate D2 (Hora) chart correctly', () => {
            const result = DivisionalChartCalculator.calculateDivisionalChart(mockRashi, 'D2');
            
            expect(result).toBeDefined();
            expect(result.planets).toBeDefined();
            expect(result.houses).toBeDefined();
            expect(result.ascendant).toBeDefined();
            
            // D2 should have different planetary positions than D1
            expect(result.planets.sun.longitude).not.toBe(mockRashi.planets.sun.longitude);
        });

        it('should calculate D9 (Navamsa) chart correctly', () => {
            const result = DivisionalChartCalculator.calculateDivisionalChart(mockRashi, 'D9');
            
            expect(result).toBeDefined();
            expect(result.planets).toBeDefined();
            expect(result.houses).toBeDefined();
            expect(result.ascendant).toBeDefined();
            
            // D9 should have different planetary positions than D1
            expect(result.planets.sun.longitude).not.toBe(mockRashi.planets.sun.longitude);
        });

        it('should throw error for unsupported divisional chart type', () => {
            expect(() => {
                DivisionalChartCalculator.calculateDivisionalChart(mockRashi, 'D999');
            }).toThrow('Unsupported divisional chart type: D999');
        });
    });

    describe('calculateAllDivisionalCharts', () => {
        it('should calculate multiple divisional charts', () => {
            const result = DivisionalChartCalculator.calculateAllDivisionalCharts(mockRashi);
            
            expect(result).toBeDefined();
            expect(result.D1).toBeDefined();
            expect(result.D2).toBeDefined();
            expect(result.D9).toBeDefined();
            expect(result.D10).toBeDefined();
            
            // Each chart should have different planetary positions
            expect(result.D1.planets.sun.longitude).toBe(mockRashi.planets.sun.longitude);
            expect(result.D2.planets.sun.longitude).not.toBe(result.D1.planets.sun.longitude);
            expect(result.D9.planets.sun.longitude).not.toBe(result.D1.planets.sun.longitude);
        });
    });

    describe('getSignType', () => {
        it('should correctly identify movable signs', () => {
            // Test with Aries (0), Cancer (3), Libra (6), Capricorn (9)
            expect((DivisionalChartCalculator as any).getSignType(0)).toBe('movable'); // Aries
            expect((DivisionalChartCalculator as any).getSignType(3)).toBe('movable'); // Cancer
            expect((DivisionalChartCalculator as any).getSignType(6)).toBe('movable'); // Libra
            expect((DivisionalChartCalculator as any).getSignType(9)).toBe('movable'); // Capricorn
        });

        it('should correctly identify fixed signs', () => {
            // Test with Taurus (1), Leo (4), Scorpio (7), Aquarius (10)
            expect((DivisionalChartCalculator as any).getSignType(1)).toBe('fixed'); // Taurus
            expect((DivisionalChartCalculator as any).getSignType(4)).toBe('fixed'); // Leo
            expect((DivisionalChartCalculator as any).getSignType(7)).toBe('fixed'); // Scorpio
            expect((DivisionalChartCalculator as any).getSignType(10)).toBe('fixed'); // Aquarius
        });

        it('should correctly identify dual signs', () => {
            // Test with Gemini (2), Virgo (5), Sagittarius (8), Pisces (11)
            expect((DivisionalChartCalculator as any).getSignType(2)).toBe('dual'); // Gemini
            expect((DivisionalChartCalculator as any).getSignType(5)).toBe('dual'); // Virgo
            expect((DivisionalChartCalculator as any).getSignType(8)).toBe('dual'); // Sagittarius
            expect((DivisionalChartCalculator as any).getSignType(11)).toBe('dual'); // Pisces
        });
    });
});
