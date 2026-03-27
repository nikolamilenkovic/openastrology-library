import { AspectCalculator } from './aspect-calculator';
import { ZodiacUtils, NakshatraUtils, HouseUtils, FormattingUtils } from './astrological-utils';
import { VedicChartCalculations, Planet, PlanetPosition, ZodiacSign, HouseNumber, HouseInfo } from './types/vedic.types';

export interface DivisionalChartConfig {
    name: string;
    divisor: number;
    formula: (longitude: number, ascendantLongitude: number) => number;
}

export class DivisionalChartCalculator {
    private static readonly DIVISIONAL_CHARTS: Record<string, DivisionalChartConfig> = {
        'D1': {
            name: 'Rashi (Birth Chart)',
            divisor: 1,
            formula: (longitude: number) => longitude
        },
        'D2': {
            name: 'Hora (Wealth)',
            divisor: 2,
            formula: (longitude: number) => {
                const sign = Math.floor(longitude / 30);
                const degreeInSign = longitude % 30;
                const isOddSign = sign % 2 === 0; // 0-based, so even index = odd sign
                
                if (isOddSign) {
                    // Odd signs: 0-15° → Leo, 15-30° → Cancer
                    if (degreeInSign < 15) {
                        // First half goes to Leo (120°) + preserve exact position within the 15° segment
                        return 120 + (degreeInSign * 2); // Map 0-15° to 0-30° in Leo
                    } else {
                        // Second half goes to Cancer (90°) + preserve exact position within the 15° segment
                        return 90 + ((degreeInSign - 15) * 2); // Map 15-30° to 0-30° in Cancer
                    }
                } else {
                    // Even signs: 0-15° → Cancer, 15-30° → Leo
                    if (degreeInSign < 15) {
                        // First half goes to Cancer (90°) + preserve exact position within the 15° segment
                        return 90 + (degreeInSign * 2); // Map 0-15° to 0-30° in Cancer
                    } else {
                        // Second half goes to Leo (120°) + preserve exact position within the 15° segment
                        return 120 + ((degreeInSign - 15) * 2); // Map 15-30° to 0-30° in Leo
                    }
                }
            }
        },
        'D3': {
            name: 'Drekkana (Siblings)',
            divisor: 3,
            formula: (longitude: number) => {
                const sign = Math.floor(longitude / 30);
                const degreeInSign = longitude % 30;
                const drekkana = Math.floor(degreeInSign / 10);
                const degreeInDrekkana = degreeInSign % 10; // Position within the 10° drekkana
                
                // Each drekkana is 10 degrees
                // 1st drekkana (0°-10°): same sign, multiply degree by 3
                // 2nd drekkana (10°-20°): 5th sign from current, multiply degree by 3  
                // 3rd drekkana (20°-30°): 9th sign from current, multiply degree by 3
                switch (drekkana) {
                    case 0: 
                        // First drekkana: same sign but degree is expanded to full sign
                        return sign * 30 + (degreeInDrekkana * 3);
                    case 1: 
                        // Second drekkana: 5th sign from current (4 signs ahead, 0-based)
                        return ((sign + 4) % 12) * 30 + (degreeInDrekkana * 3);
                    case 2: 
                        // Third drekkana: 9th sign from current (8 signs ahead, 0-based)
                        return ((sign + 8) % 12) * 30 + (degreeInDrekkana * 3);
                    default: 
                        return longitude;
                }
            }
        },
        'D4': {
            name: 'Chaturthamsa (Fortune)',
            divisor: 4,
            formula: (longitude: number) => {
                const sign = Math.floor(longitude / 30);
                const degreeInSign = longitude % 30;
                const part = Math.floor(degreeInSign / 7.5);
                const degreeInPart = degreeInSign % 7.5; // Position within the 7.5° part
                
                // Each part is 7.5 degrees (7°30')
                // Uniform rule for all signs:
                // 1st part (0° to 7°30') → same sign
                // 2nd part (7°30' to 15°) → 4th sign from original
                // 3rd part (15° to 22°30') → 7th sign from original  
                // 4th part (22°30' to 30°) → 10th sign from original
                
                let resultSign = sign;
                
                switch (part) {
                    case 0: resultSign = sign; break;                    // Same sign
                    case 1: resultSign = (sign + 3) % 12; break;         // 4th sign from current
                    case 2: resultSign = (sign + 6) % 12; break;         // 7th sign from current
                    case 3: resultSign = (sign + 9) % 12; break;         // 10th sign from current
                }
                
                return resultSign * 30 + (degreeInPart * 4);
            }
        },
        'D5': {
            name: 'Panchamsa (Education)',
            divisor: 5,
            formula: (longitude: number) => {
                const sign = Math.floor(longitude / 30);
                const degreeInSign = longitude % 30;
                const part = Math.floor(degreeInSign / 6);
                const degreeInPart = degreeInSign % 6; // Position within the 6° part

                // Based on book from P.V.R. Narasimha Rao, Vedic Astrology: An Integrated Approach
                // Parts are mapped as follows:
                const oddSignMappings = [
                    0,  // Aries
                    10, // Aquarius
                    8,  // Sagittarius
                    2,  // Gemini
                    6,  // Libra
                ];
                const evenSignMappings = [
                    1,  // Taurus
                    5,  // Virgo
                    11, // Pisces
                    9,  // Capricorn
                    7,  // Scorpio
                ];
                const isOddSign = sign % 2 === 0; // 0-based indexing: 0=Aries(odd), 1=Taurus(even)
                
                let resultSign: number;
                if (isOddSign) {
                    resultSign = oddSignMappings[part];
                } else {
                    resultSign = evenSignMappings[part];
                }

                return resultSign * 30 + (degreeInPart * 5);
            }
        },
        'D6': {
            name: 'Shashtamsa (Health)',
            divisor: 6,
            formula: (longitude: number) => {
                const sign = Math.floor(longitude / 30);
                const degreeInSign = longitude % 30;
                const part = Math.floor(degreeInSign / 5); // Each part is 5 degrees
                const degreeInPart = degreeInSign % 5; // Position within the 5° part
                
                // Check if planet is in odd or even sign (1-based: Aries=1st=odd, Taurus=2nd=even)
                const isOddSign = sign % 2 === 0; // 0-based indexing: 0=Aries(odd), 1=Taurus(even)
                
                let resultSign: number;
                
                if (isOddSign) {
                    // Odd signs: Map from Aries (0-5: Aries, Taurus, Gemini, Cancer, Leo, Virgo)
                    resultSign = part; // 0=Aries, 1=Taurus, 2=Gemini, 3=Cancer, 4=Leo, 5=Virgo
                } else {
                    // Even signs: Map from Libra (0-5: Libra, Scorpio, Sagittarius, Capricorn, Aquarius, Pisces)
                    resultSign = 6 + part; // 6=Libra, 7=Scorpio, 8=Sagittarius, 9=Capricorn, 10=Aquarius, 11=Pisces
                }
                
                return resultSign * 30 + (degreeInPart * 6);
            }
        },
        'D7': {
            name: 'Saptamamsa (Children)',
            divisor: 7,
            formula: (longitude: number) => {
                const sign = Math.floor(longitude / 30);
                const degreeInSign = longitude % 30;
                
                // Each saptamamsa is 30/7 = 4°17'8.57" (approximately 4.2857 degrees)
                const saptamamsaSize = 30 / 7;
                const saptamamsaIndex = Math.floor(degreeInSign / saptamamsaSize); // 0 to 6
                const degreeInSaptamamsa = degreeInSign % saptamamsaSize;
                
                // Traditional D7 formula (Parashara's method):
                // For odd signs (Aries, Gemini, Leo, Libra, Sagittarius, Aquarius):
                //   7 parts go to: same sign, 2nd from same, 3rd from same, 4th from same, 5th from same, 6th from same, 7th from same
                // For even signs (Taurus, Cancer, Virgo, Scorpio, Capricorn, Pisces):
                //   7 parts go to: 7th from same, 8th from same, 9th from same, 10th from same, 11th from same, 12th from same, same sign
                const isOddSign = sign % 2 === 0; // 0-based: Aries=0(odd), Taurus=1(even)
                
                let resultSign: number;
                
                if (isOddSign) {
                    // Odd signs: start from the same sign
                    resultSign = (sign + saptamamsaIndex) % 12;
                } else {
                    // Even signs: start from 7th sign (6 positions ahead, 0-based)
                    resultSign = (sign + 6 + saptamamsaIndex) % 12;
                }
                
                // Convert back to longitude: result sign + proportional degree within the saptamamsa
                return resultSign * 30 + (degreeInSaptamamsa * 7);
            }
        },
        'D8': {
            name: 'Ashtamamsa (Longevity)',
            divisor: 8,
            formula: (longitude: number) => {
                const sign = Math.floor(longitude / 30);
                const degreeInSign = longitude % 30;
                const part = Math.floor(degreeInSign / 3.75); // Each part is 3.75 degrees (3°45')
                const degreeInPart = degreeInSign % 3.75;
                
                // Correct D8 formula based on analysis:
                // - Movable signs: Start from Aries (0)
                // - Fixed signs: Start from Sagittarius (8)  
                // - Dual signs: Start from Leo (4)
                const signType = DivisionalChartCalculator.getSignType(sign);
                let startingSign: number;
                
                switch (signType) {
                    case 'movable':
                        startingSign = 0; // Aries
                        break;
                    case 'fixed':
                        startingSign = 8; // Sagittarius
                        break;
                    case 'dual':
                        startingSign = 4; // Leo
                        break;
                    default:
                        startingSign = 0;
                }
                
                const resultSign = (startingSign + part) % 12;
                
                return resultSign * 30 + (degreeInPart * 8);
            }
        },
        'D9': {
            name: 'Navamsa (Spouse)',
            divisor: 9,
            formula: (longitude: number) => {
                const sign = Math.floor(longitude / 30);
                const degreeInSign = longitude % 30;
                const navamsa = Math.floor(degreeInSign / (30/9));
                
                // Each navamsa is 30/9 = 3.33 degrees
                const signType = DivisionalChartCalculator.getSignType(sign);
                let resultSign = sign;
                
                switch (signType) {
                    case 'movable':
                        resultSign = (sign + navamsa) % 12;
                        break;
                    case 'fixed':
                        resultSign = (sign + 8 + navamsa) % 12;
                        break;
                    case 'dual':
                        resultSign = (sign + 4 + navamsa) % 12;
                        break;
                }
                
                return resultSign * 30 + (degreeInSign % (30/9)) * 9;
            }
        },
        'D10': {
            name: 'Dasamsa (Career)',
            divisor: 10,
            formula: (longitude: number) => {
                const sign = Math.floor(longitude / 30);
                const degreeInSign = longitude % 30;
                const part = Math.floor(degreeInSign / 3);
                
                // Each part is 3 degrees (30° / 10 = 3°)
                // Odd signs (1st, 3rd, 5th, 7th, 9th, 11th): Aries, Gemini, Leo, Libra, Sagittarius, Aquarius
                // Even signs (2nd, 4th, 6th, 8th, 10th, 12th): Taurus, Cancer, Virgo, Scorpio, Capricorn, Pisces
                const isOddSign = sign % 2 === 0; // 0-based indexing: 0=Aries(odd), 1=Taurus(even)
                
                let resultSign: number;
                
                if (isOddSign) {
                    // Odd signs: start from the same sign (Aries=0)
                    resultSign = (sign + part) % 12;
                } else {
                    // Even signs: start from the 9th sign from the current sign
                    resultSign = (sign + 8 + part) % 12;
                }
                
                return resultSign * 30 + (degreeInSign % 3) * 10;
            }
        },
        'D11': {
            name: 'Ekadasamsa (Gains)',
            divisor: 11,
            formula: (longitude: number) => {
                const sign = Math.floor(longitude / 30);
                const degreeInSign = longitude % 30;
                const part = Math.floor(degreeInSign / (30.0 / 11.0));

                // Count the sign's position from Aries forward (1-indexed),
                // then count that many signs anti-zodiacally from Aries to get the starting sign.
                // Anti-zodiacal nth from Aries = (12 - sign) % 12  (since n = sign+1, start = (13-n)%12 = (12-sign)%12)
                // Example: Ge (sign=2) -> 3rd anti-zodiacally from Ar = Aq (10) ✓
                //          Sc (sign=7) -> 8th anti-zodiacally from Ar = Vi (5)  ✓
                const startSign = (12 - sign) % 12;
                const resultSign = (startSign + part) % 12;

                return resultSign * 30 + (degreeInSign % (30 / 11)) * 11;
            }
        },
        'D12': {
            name: 'Dvadasamsa (Parents)',
            divisor: 12,
            formula: (longitude: number) => {
                const sign = Math.floor(longitude / 30);
                const degreeInSign = longitude % 30;
                
                // D12 calculation: each sign is divided into 12 parts of 2.5° each
                // Each part represents one sign in the D12 chart
                const partIndex = Math.floor(degreeInSign / 2.5); // 0 to 11
                const degreeWithinPart = degreeInSign % 2.5; // 0 to 2.5°
                
                // Calculate result sign
                const resultSign = (sign + partIndex) % 12;
                
                // Traditional D12 degree calculation
                // The degree position within the 2.5° part maps to the full 30° of the result sign
                const exactFraction = degreeWithinPart / 2.5;
                const resultDegree = exactFraction * 30;
                
                return resultSign * 30 + resultDegree;
            }
        },
        'D16': {
            name: 'Shodasamsa (Vehicles)',
            divisor: 16,
            formula: (longitude: number) => {
                const sign = Math.floor(longitude / 30);
                const degreeInSign = longitude % 30;
                const part = Math.floor(degreeInSign / 1.875);
                
                // Each part is 1.875 degrees (30° / 16 = 1.875°)
                const signType = DivisionalChartCalculator.getSignType(sign);
                let resultSign = sign;
                
                // Traditional D16 formula:
                // Movable signs: Start from Aries (0)
                // Fixed signs: Start from Leo (4) 
                // Dual signs: Start from Sagittarius (8)
                switch (signType) {
                    case 'movable':
                        resultSign = part % 12; // Start from Aries (0)
                        break;
                    case 'fixed':
                        resultSign = (4 + part) % 12; // Start from Leo (4)
                        break;
                    case 'dual':
                        resultSign = (8 + part) % 12; // Start from Sagittarius (8)
                        break;
                }
                
                return resultSign * 30 + (degreeInSign % 1.875) * 16;
            }
        },
        'D20': {
            name: 'Vimsamsa (Spirituality)',
            divisor: 20,
            formula: (longitude: number) => {
                const sign = Math.floor(longitude / 30);
                const degreeInSign = longitude % 30;
                const part = Math.floor(degreeInSign / 1.5);
                
                // Each part is 1.5 degrees
                const signType = DivisionalChartCalculator.getSignType(sign);
                let resultSign = sign;
                
                // Traditional D16 formula:
                // Movable signs: Start from Aries (0)
                // Fixed signs: Start from Leo (4) 
                // Dual signs: Start from Sagittarius (8)
                switch (signType) {
                    case 'movable':
                        resultSign = part % 12; // Start from Aries (0)
                        break;
                    case 'fixed':
                        resultSign = (8 + part) % 12; // Start from Sagittarius (8)
                        break;
                    case 'dual':
                        resultSign = (4 + part) % 12; // Start from Leo (4)
                        break;
                }
                
                return resultSign * 30 + (degreeInSign % 1.5) * 20;
            }
        },
        'D24': {
            name: 'Chaturvimsamsa (Education)',
            divisor: 24,
            formula: (longitude: number) => {
                const sign = Math.floor(longitude / 30);
                const degreeInSign = longitude % 30;
                const part = Math.floor(degreeInSign / 1.25);
                
                // Each part is 1.25 degrees
                const isOddSign = sign % 2 === 0;
                
                if (isOddSign) {
                    // Odd signs: start from Leo
                    return ((4 + part) % 12) * 30 + (degreeInSign % 1.25) * 24;
                } else {
                    // Even signs: start from Cancer
                    return ((3 + part) % 12) * 30 + (degreeInSign % 1.25) * 24;
                }
            }
        },
        'D27': {
            name: 'Saptavimsamsa (Strength)',
            divisor: 27,
            formula: (longitude: number) => {
                const sign = Math.floor(longitude / 30);
                const degreeInSign = longitude % 30;
                
                // Each rasi is divided into 27 equal parts of 1° 6' 40" each (30°/27 = 1.111... degrees)
                const partSize = 30 / 27; // ~1.111 degrees per part
                const partIndex = Math.floor(degreeInSign / partSize); // 0 to 26
                const degreeInPart = degreeInSign % partSize;
                
                // Get the element of the current sign to determine starting point
                const signNames: ZodiacSign[] = [
                    'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
                    'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
                ];
                const currentSignName = signNames[sign];
                const element = DivisionalChartCalculator.getSignElement(currentSignName);
                
                // Determine starting sign based on element:
                // Fire signs (Aries, Leo, Sagittarius): start from Aries (0)
                // Earth signs (Taurus, Virgo, Capricorn): start from Cancer (3)
                // Air signs (Gemini, Libra, Aquarius): start from Libra (6)
                // Water signs (Cancer, Scorpio, Pisces): start from Capricorn (9)
                let startingSign: number;
                switch (element) {
                    case 'fire':
                        startingSign = 0; // Aries
                        break;
                    case 'earth':
                        startingSign = 3; // Cancer
                        break;
                    case 'air':
                        startingSign = 6; // Libra
                        break;
                    case 'water':
                        startingSign = 9; // Capricorn
                        break;
                    default:
                        startingSign = 0; // Default to Aries
                }
                
                // Calculate which of the 12 signs this part maps to
                // We cycle through 12 signs for 27 parts, so some signs get multiple parts
                const resultSign = (startingSign + (partIndex % 12)) % 12;
                
                // Convert back to longitude with expanded degree within the target sign
                return resultSign * 30 + (degreeInPart * 27);
            }
        },
        'D30': {
            name: 'Trimsamsa (Evils)',
            divisor: 30,
            formula: (longitude: number) => {
                const sign = Math.floor(longitude / 30);
                const degreeInSign = longitude % 30;
                const degreeInPart = degreeInSign % 1.0; // Position within the 1° part

                // Trimsamsa has specific rulership for each degree range
                const isOddSign = sign % 2 === 0; // 0-based indexing: 0=Aries(odd), 1=Taurus(even)
                
                let resultSign: number = 0; // Default to Aries (0)
                
                if (isOddSign) { 
                    // Odd Rasis
                    if (degreeInSign < 5) {
                        resultSign = 0; // Aries (0°-5°)
                    } else if (degreeInSign < 10) {
                        resultSign = 10; // Aquarius (5°-10°)
                    } else if (degreeInSign < 18) {
                        resultSign = 8; // Sagittarius (10°-18°)
                    } else if (degreeInSign < 25) {
                        resultSign = 2; // Gemini (18°-25°)
                    } else if (degreeInSign <= 30) {
                        resultSign = 6; // Libra (25°-30°)
                    }
                } else {
                    // Even Rasis
                    if (degreeInSign < 5) {
                        resultSign = 1; // Taurus (0°-5°)
                    } else if (degreeInSign < 12) {
                        resultSign = 5; // Virgo (5°-12°)
                    } else if (degreeInSign < 20) {
                        resultSign = 11; // Pisces (12°-20°)
                    } else if (degreeInSign < 25) {
                        resultSign = 9; // Capricorn (20°-25°)
                    } else if (degreeInSign <= 30) {
                        resultSign = 7; // Scorpio (25°-30°)
                    }
                }

                return resultSign * 30 + degreeInPart * 30; // Convert to full degree in the result sign
            }
        },
        'D40': {
            name: 'Khavedamsa (Maternal)',
            divisor: 40,
            formula: (longitude: number) => {
                const sign = Math.floor(longitude / 30);
                const degreeInSign = longitude % 30;
                
                // Each rasi is divided into 40 equal parts of 45' each (0.75 degrees)
                const partSize = 0.75; // 45 minutes = 0.75 degrees
                const partIndex = Math.floor(degreeInSign / partSize); // 0 to 39
                const degreeInPart = degreeInSign % partSize;
                
                // Determine starting sign based on whether the rasi is odd or even
                // Odd signs (Aries, Gemini, Leo, Libra, Sagittarius, Aquarius): start from Aries (0)
                // Even signs (Taurus, Cancer, Virgo, Scorpio, Capricorn, Pisces): start from Libra (6)
                const isOddSign = sign % 2 === 0; // 0-based indexing: 0=Aries(odd), 1=Taurus(even)
                
                let startingSign: number;
                if (isOddSign) {
                    startingSign = 0; // Aries
                } else {
                    startingSign = 6; // Libra
                }
                
                // Bodies in the 40 parts go into the 40 rasis (cycling through 12 signs multiple times)
                // Since we have 40 parts but only 12 signs, we cycle: 40 % 12 = 4, so we go through 3 full cycles + 4 more
                const resultSign = (startingSign + (partIndex % 12)) % 12;
                
                // Convert back to longitude with expanded degree within the target sign
                return resultSign * 30 + (degreeInPart * 40);
            }
        },
        'D45': {
            name: 'Akshavedamsa (General)',
            divisor: 45,
            formula: (longitude: number) => {
                const sign = Math.floor(longitude / 30);
                const degreeInSign = longitude % 30;
                
                // Each rasi is divided into 45 equal parts of 40' each (40/60 = 0.667 degrees)
                const partSize = 40 / 60; // 40 minutes = 0.667 degrees
                const partIndex = Math.floor(degreeInSign / partSize); // 0 to 44
                const degreeInPart = degreeInSign % partSize;
                
                // Determine starting sign based on the sign type (movable, fixed, or dual)
                const signType = DivisionalChartCalculator.getSignType(sign);
                let startingSign: number;
                
                switch (signType) {
                    case 'movable':
                        startingSign = 0; // Aries
                        break;
                    case 'fixed':
                        startingSign = 4; // Leo
                        break;
                    case 'dual':
                        startingSign = 8; // Sagittarius
                        break;
                    default:
                        startingSign = 0; // Default to Aries
                }
                
                // Bodies in the 45 parts go into the 45 rasis (cycling through 12 signs multiple times)
                // Since we have 45 parts but only 12 signs, we cycle: 45 % 12 = 9, so we go through 3 full cycles + 9 more
                const resultSign = (startingSign + (partIndex % 12)) % 12;
                
                // Convert back to longitude with expanded degree within the target sign
                return resultSign * 30 + (degreeInPart * 45);
            }
        },
        'D60': {
            name: 'Shashtamsa (General)',
            divisor: 60,
            formula: (longitude: number) => {
                const sign = Math.floor(longitude / 30);
                const degreeInSign = longitude % 30;
                
                // Each rasi is divided into 60 equal parts of 30' each (0.5 degrees)
                // To find the part: multiply longitude from beginning of rasi by 2, 
                // take degrees (ignore minutes), add 1
                const multiplied = degreeInSign * 2; // Multiply by 2
                const partNumber = Math.floor(multiplied) + 1; // Take degrees, ignore minutes, add 1
                
                // Bodies go into rasis starting from the rasi itself
                // Count partNumber rasis from the current sign
                const resultSign = (sign + partNumber - 1) % 12; // -1 because we start from current sign
                
                // Calculate the degree within the result sign
                // Each part is 30' (0.5 degrees), so we need to map the position within the part
                const degreeInPart = degreeInSign % 0.5; // Position within the 0.5° part
                
                return resultSign * 30 + (degreeInPart * 60);
            }
        }
    };

    private static getSignType(signIndex: number): 'movable' | 'fixed' | 'dual' {
        // Movable: Aries(0), Cancer(3), Libra(6), Capricorn(9)
        // Fixed: Taurus(1), Leo(4), Scorpio(7), Aquarius(10)
        // Dual: Gemini(2), Virgo(5), Sagittarius(8), Pisces(11)
        
        const remainder = signIndex % 3;
        switch (remainder) {
            case 0: return 'movable';
            case 1: return 'fixed';
            case 2: return 'dual';
            default: return 'movable';
        }
    }

    private static getSignIndex(sign: ZodiacSign): number {
        const signs: ZodiacSign[] = [
            'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
            'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
        ];
        return signs.indexOf(sign);
    }

    private static getSignElement(sign: ZodiacSign): 'fire' | 'earth' | 'air' | 'water' {
        const signElements: Record<ZodiacSign, 'fire' | 'earth' | 'air' | 'water'> = {
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
        return signElements[sign];
    }

    /**
     * Calculate a specific divisional chart
     */
    static calculateDivisionalChart(
        rashi: VedicChartCalculations,
        divisionalType: string,
    ): VedicChartCalculations {
        const config = this.DIVISIONAL_CHARTS[divisionalType];
        if (!config) {
            throw new Error(`Unsupported divisional chart type: ${divisionalType}`);
        }

        // Calculate new planetary positions
        const divisionalPlanets: Record<Planet, PlanetPosition> = {} as any;
        
        Object.entries(rashi.planets).forEach(([planetName, planetPos]) => {
            const newLongitude = config.formula(planetPos.longitude, rashi.ascendant.longitude);
            const normalizedLongitude = ((newLongitude % 360) + 360) % 360;
            
            const sign = ZodiacUtils.getSignFromLongitude(normalizedLongitude);
            const degree = ZodiacUtils.getDegreeInSign(normalizedLongitude);
            const degreeDMS = FormattingUtils.convertToDMS(degree);
            const degreeDMSFormatted = FormattingUtils.formatDMS(degreeDMS.degrees, degreeDMS.minutes, degreeDMS.seconds);
            const nakshatra = NakshatraUtils.getNakshatraFromLongitude(normalizedLongitude);
            const nakshatraPada = NakshatraUtils.getNakshatraPada(normalizedLongitude);

            divisionalPlanets[planetName as Planet] = {
                ...planetPos,
                longitude: normalizedLongitude,
                sign,
                degree,
                degreeDMS,
                degreeDMSFormatted,
                nakshatra,
                nakshatraPada,
                pada: nakshatraPada,
                house: 1, // Will be recalculated based on new ascendant
                aspects: [] // Initialize empty aspects array
            };
        });

        // Calculate new ascendant
        const originalAscendant = typeof rashi.ascendant === 'object' 
            ? this.getSignIndex(rashi.ascendant.sign) * 30 + rashi.ascendant.degree
            : rashi.ascendant || 0;
        
        const newAscendantLongitude = config.formula(originalAscendant, originalAscendant);
        const normalizedAscendantLongitude = ((newAscendantLongitude % 360) + 360) % 360;
        
        const ascendantSign = ZodiacUtils.getSignFromLongitude(normalizedAscendantLongitude);
        const ascendantDegree = ZodiacUtils.getDegreeInSign(normalizedAscendantLongitude);
        const ascendantNakshatra = NakshatraUtils.getNakshatraFromLongitude(normalizedAscendantLongitude);
        const ascendantNakshatraPada = NakshatraUtils.getNakshatraPada(normalizedAscendantLongitude);

        const ascendantDegreeDMS = FormattingUtils.convertToDMS(ascendantDegree);
        const newAscendant = {
            sign: ascendantSign,
            degree: ascendantDegree,
            degreeDMS: ascendantDegreeDMS,
            degreeDMSFormatted: FormattingUtils.formatDMS(ascendantDegreeDMS.degrees, ascendantDegreeDMS.minutes, ascendantDegreeDMS.seconds),
            nakshatra: ascendantNakshatra,
            nakshatraPada: ascendantNakshatraPada,
            longitude: normalizedAscendantLongitude
        };

        // Create new houses based on new ascendant (using whole sign houses)
        const divisionalHouses: Record<HouseNumber, HouseInfo> = {} as any;
        
        // Get the ascendant sign index (0-11)
        const ascendantSignIndex = Math.floor(normalizedAscendantLongitude / 30);
        
        for (let i = 1; i <= 12; i++) {
            const houseNumber = i as HouseNumber;
            // In whole sign houses, each house corresponds to a complete sign
            // House 1 = ascendant sign, House 2 = next sign, etc.
            const houseSignIndex = (ascendantSignIndex + i - 1) % 12;
            const houseCusp = houseSignIndex * 30; // Start of the sign
            const houseSign = ZodiacUtils.getSignFromLongitude(houseCusp);
            const houseLord = ZodiacUtils.getSignLord(houseSign);
            
            divisionalHouses[houseNumber] = {
                number: houseNumber,
                cusp: houseCusp,
                sign: houseSign,
                lord: houseLord,
                planets: [],
                strength: 50, // Default strength
                significance: HouseUtils.getHouseSignificance(houseNumber)
            };
        }

        // Assign planets to houses
        this.assignPlanetsToHouses(divisionalPlanets, divisionalHouses);

        // Calculate aspects for divisional chart
        AspectCalculator.calculateVedicAspects(divisionalPlanets);

        return {
            ...rashi,
            planets: divisionalPlanets,
            houses: divisionalHouses,
            ascendant: newAscendant,
            // Reset yogas as they would be different in divisional chart
            yogas: []
        };
    }

    /**
     * Calculate multiple divisional charts
     */
    static calculateAllDivisionalCharts(rashi: VedicChartCalculations): Record<string, VedicChartCalculations> {
        const divisionalCharts: Record<string, VedicChartCalculations> = {};
        
        // Calculate commonly used divisional charts
        const commonCharts = ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9', 'D10', 'D11', 'D12', 'D16', 'D20', 'D24', 'D27', 'D30', 'D40', 'D45', 'D60'];
        
        for (const chartType of commonCharts) {
            try {
                if (chartType === 'D1') {
                    // D1 is the original rashi chart
                    divisionalCharts[chartType] = rashi;
                } else {
                    divisionalCharts[chartType] = this.calculateDivisionalChart(rashi, chartType);
                }
            } catch (error) {
                console.warn(`Failed to calculate ${chartType}:`, error);
            }
        }
        
        return divisionalCharts;
    }

    /**
     * Get divisional chart configuration
     */
    static getDivisionalChartConfig(chartType: string): DivisionalChartConfig | null {
        return this.DIVISIONAL_CHARTS[chartType] || null;
    }

    /**
     * Get all available divisional chart types
     */
    static getAvailableChartTypes(): string[] {
        return Object.keys(this.DIVISIONAL_CHARTS);
    }

    /**
     * Assign planets to houses based on their divisional positions
     */
    private static assignPlanetsToHouses(
        planets: Record<Planet, PlanetPosition>, 
        houses: Record<HouseNumber, HouseInfo>
    ): void {
        // Get house cusps for boundary calculations - ensure correct order by house number
        const houseCusps: number[] = [];
        for (let i = 1; i <= 12; i++) {
            houseCusps.push(houses[i as HouseNumber].cusp);
        }

        Object.entries(planets).forEach(([planetName, planetPos]) => {
            const house = this.findHouseForPlanet(planetPos.longitude, houseCusps);
            planetPos.house = house;

            // Add planet to house
            houses[house].planets.push(planetName);
        });
    }

    /**
     * Find which house a planet belongs to based on its longitude (using whole sign houses)
     */
    private static findHouseForPlanet(longitude: number, houseCusps: number[]): HouseNumber {
        // In whole sign houses, find which sign the planet is in
        const planetSignIndex = Math.floor(longitude / 30);
        
        // Find which house corresponds to this sign
        for (let i = 0; i < 12; i++) {
            const houseSignIndex = Math.floor(houseCusps[i] / 30);
            if (planetSignIndex === houseSignIndex) {
                return (i + 1) as HouseNumber;
            }
        }
        
        return 1; // Default to first house
    }
}
