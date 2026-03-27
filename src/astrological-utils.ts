import { Planet, ZodiacSign, Nakshatra, HouseNumber, DegreeDMS } from './types/vedic.types';

// Zodiac Sign Utilities
export class ZodiacUtils {
    static readonly SIGNS: ZodiacSign[] = [
        'aries', //
        'taurus',
        'gemini',
        'cancer',
        'leo',
        'virgo',
        'libra',
        'scorpio',
        'sagittarius',
        'capricorn',
        'aquarius',
        'pisces'
    ];

    static readonly SIGN_LORDS: Record<ZodiacSign, Planet> = {
        aries: 'mars',
        taurus: 'venus',
        gemini: 'mercury',
        cancer: 'moon',
        leo: 'sun',
        virgo: 'mercury',
        libra: 'venus',
        scorpio: 'mars',
        sagittarius: 'jupiter',
        capricorn: 'saturn',
        aquarius: 'saturn',
        pisces: 'jupiter'
    };

    static readonly SIGN_ELEMENTS: Record<ZodiacSign, 'fire' | 'earth' | 'air' | 'water'> = {
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

    static readonly SIGN_QUALITIES: Record<ZodiacSign, 'cardinal' | 'fixed' | 'mutable'> = {
        aries: 'cardinal',
        cancer: 'cardinal',
        libra: 'cardinal',
        capricorn: 'cardinal',
        taurus: 'fixed',
        leo: 'fixed',
        scorpio: 'fixed',
        aquarius: 'fixed',
        gemini: 'mutable',
        virgo: 'mutable',
        sagittarius: 'mutable',
        pisces: 'mutable'
    };

    static getSignFromLongitude(longitude: number): ZodiacSign {
        const signIndex = Math.floor(longitude / 30);
        return this.SIGNS[signIndex] || 'aries';
    }

    static getDegreeInSign(longitude: number): number {
        return longitude % 30;
    }

    static getSignLord(sign: ZodiacSign): Planet {
        return this.SIGN_LORDS[sign];
    }

    static getElement(sign: ZodiacSign): 'fire' | 'earth' | 'air' | 'water' {
        return this.SIGN_ELEMENTS[sign];
    }

    static getQuality(sign: ZodiacSign): 'cardinal' | 'fixed' | 'mutable' {
        return this.SIGN_QUALITIES[sign];
    }

    static isEnemySign(sign1: ZodiacSign, sign2: ZodiacSign): boolean {
        const index1 = this.SIGNS.indexOf(sign1);
        const index2 = this.SIGNS.indexOf(sign2);
        const distance = Math.abs(index1 - index2);

        // Enemy signs are typically 2nd, 5th, 6th, 8th, 9th, 12th from each other
        return [2, 5, 6, 8, 9, 0].includes(distance) || [2, 5, 6, 8, 9, 0].includes(12 - distance);
    }

    static isFriendlySign(sign1: ZodiacSign, sign2: ZodiacSign): boolean {
        const index1 = this.SIGNS.indexOf(sign1);
        const index2 = this.SIGNS.indexOf(sign2);
        const distance = Math.abs(index1 - index2);

        // Friendly signs are typically 3rd, 4th, 10th, 11th from each other
        return [3, 4, 10, 11].includes(distance) || [3, 4, 10, 11].includes(12 - distance);
    }

    static getOppositeSign(sign: ZodiacSign): ZodiacSign {
        const index = this.SIGNS.indexOf(sign);
        const oppositeIndex = (index + 6) % 12;
        return this.SIGNS[oppositeIndex];
    }
}

// Nakshatra Utilities
export class NakshatraUtils {
    static readonly NAKSHATRAS: Nakshatra[] = [
        'ashwini', //
        'bharani',
        'krittika',
        'rohini',
        'mrigashira',
        'ardra',
        'punarvasu',
        'pushya',
        'ashlesha',
        'magha',
        'purva_phalguni',
        'uttara_phalguni',
        'hasta',
        'chitra',
        'swati',
        'vishakha',
        'anuradha',
        'jyeshtha',
        'moola',
        'purva_ashadha',
        'uttara_ashadha',
        'shravana',
        'dhanishta',
        'shatabhisha',
        'purva_bhadrapada',
        'uttara_bhadrapada',
        'revati'
    ];

    static readonly NAKSHATRA_LORDS: Record<Nakshatra, Planet> = {
        ashwini: 'ketu',
        bharani: 'venus',
        krittika: 'sun',
        rohini: 'moon',
        mrigashira: 'mars',
        ardra: 'rahu',
        punarvasu: 'jupiter',
        pushya: 'saturn',
        ashlesha: 'mercury',
        magha: 'ketu',
        purva_phalguni: 'venus',
        uttara_phalguni: 'sun',
        hasta: 'moon',
        chitra: 'mars',
        swati: 'rahu',
        vishakha: 'jupiter',
        anuradha: 'saturn',
        jyeshtha: 'mercury',
        moola: 'ketu',
        purva_ashadha: 'venus',
        uttara_ashadha: 'sun',
        shravana: 'moon',
        dhanishta: 'mars',
        shatabhisha: 'rahu',
        purva_bhadrapada: 'jupiter',
        uttara_bhadrapada: 'saturn',
        revati: 'mercury'
    };

    static getNakshatraFromLongitude(longitude: number): Nakshatra {
        const nakshatraIndex = Math.floor(longitude / (360 / 27));
        return this.NAKSHATRAS[nakshatraIndex] || 'ashwini';
    }

    static getNakshatraPada(longitude: number): number {
        const degreeInNakshatra = longitude % (360 / 27);
        const pada = Math.floor(degreeInNakshatra / (360 / 27 / 4)) + 1;
        return pada > 4 ? 4 : pada;
    }

    static getNakshatraIndex(nakshatra: Nakshatra): number {
        return this.NAKSHATRAS.indexOf(nakshatra);
    }

    static getNakshatraLord(nakshatra: Nakshatra): Planet {
        return this.NAKSHATRA_LORDS[nakshatra];
    }

    static getNakshatraDegree(longitude: number): number {
        return longitude % (360 / 27);
    }
}

// Planet Utilities
export class PlanetUtils {
    static readonly PLANETS: Planet[] = [
        'sun', //
        'moon',
        'mars',
        'mercury',
        'jupiter',
        'venus',
        'saturn',
        'rahu',
        'ketu'
    ];

    static readonly PLANET_EXALTATION: Record<Planet, { sign: ZodiacSign; degree: number }> = {
        sun: { sign: 'aries', degree: 10 },
        moon: { sign: 'taurus', degree: 3 },
        mars: { sign: 'capricorn', degree: 28 },
        mercury: { sign: 'virgo', degree: 15 },
        jupiter: { sign: 'cancer', degree: 5 },
        venus: { sign: 'pisces', degree: 27 },
        saturn: { sign: 'libra', degree: 20 },
        rahu: { sign: 'gemini', degree: 15 },
        ketu: { sign: 'sagittarius', degree: 15 }
    };

    static readonly PLANET_DEBILITATION: Record<Planet, { sign: ZodiacSign; degree: number }> = {
        sun: { sign: 'libra', degree: 10 },
        moon: { sign: 'scorpio', degree: 3 },
        mars: { sign: 'cancer', degree: 28 },
        mercury: { sign: 'pisces', degree: 15 },
        jupiter: { sign: 'capricorn', degree: 5 },
        venus: { sign: 'virgo', degree: 27 },
        saturn: { sign: 'aries', degree: 20 },
        rahu: { sign: 'sagittarius', degree: 15 },
        ketu: { sign: 'gemini', degree: 15 }
    };

    static readonly PLANET_FRIENDS: Record<Planet, Planet[]> = {
        sun: ['moon', 'mars', 'jupiter'],
        moon: ['sun', 'mercury'],
        mars: ['sun', 'moon', 'jupiter'],
        mercury: ['sun', 'venus'],
        jupiter: ['sun', 'moon', 'mars'],
        venus: ['mercury', 'saturn'],
        saturn: ['mercury', 'venus'],
        rahu: ['venus', 'saturn'],
        ketu: ['mars', 'jupiter']
    };

    static readonly PLANET_ENEMIES: Record<Planet, Planet[]> = {
        sun: ['venus', 'saturn'],
        moon: [],
        mars: ['mercury'],
        mercury: ['moon'],
        jupiter: ['mercury', 'venus'],
        venus: ['sun', 'moon'],
        saturn: ['sun', 'moon', 'mars'],
        rahu: ['sun', 'moon', 'mars'],
        ketu: ['sun', 'moon', 'venus']
    };

    static isExalted(planet: Planet, sign: ZodiacSign, degree: number): boolean {
        const exaltation = this.PLANET_EXALTATION[planet];
        return exaltation.sign === sign && Math.abs(degree - exaltation.degree) <= 2;
    }

    static isDebilitated(planet: Planet, sign: ZodiacSign, degree: number): boolean {
        const debilitation = this.PLANET_DEBILITATION[planet];
        return debilitation.sign === sign && Math.abs(degree - debilitation.degree) <= 2;
    }

    static isMoolatrikona(planet: Planet, sign: ZodiacSign): boolean {
        const moolatrikona: Record<Planet, ZodiacSign> = {
            sun: 'leo',
            moon: 'taurus',
            mars: 'aries',
            mercury: 'virgo',
            jupiter: 'sagittarius',
            venus: 'libra',
            saturn: 'aquarius',
            rahu: 'aquarius',
            ketu: 'scorpio'
        };
        return moolatrikona[planet] === sign;
    }

    static isOwnSign(planet: Planet, sign: ZodiacSign): boolean {
        return ZodiacUtils.getSignLord(sign) === planet;
    }

    static isFriend(planet1: Planet, planet2: Planet): boolean {
        return this.PLANET_FRIENDS[planet1]?.includes(planet2) || false;
    }

    static isEnemy(planet1: Planet, planet2: Planet): boolean {
        return this.PLANET_ENEMIES[planet1]?.includes(planet2) || false;
    }

    static getPlanetStrength(planet: Planet, sign: ZodiacSign, degree: number): number {
        let strength = 0;

        if (this.isExalted(planet, sign, degree)) strength += 100;
        else if (this.isDebilitated(planet, sign, degree)) strength -= 100;
        else if (this.isMoolatrikona(planet, sign)) strength += 75;
        else if (this.isOwnSign(planet, sign)) strength += 50;
        else if (ZodiacUtils.isFriendlySign(sign, ZodiacUtils.getSignFromLongitude(0))) strength += 25;
        else if (ZodiacUtils.isEnemySign(sign, ZodiacUtils.getSignFromLongitude(0))) strength -= 25;

        return strength;
    }
}

// Formatting Utilities
export class FormattingUtils {
    static formatDMS(degrees: number, minutes: number, seconds: number): string {
        return `${degrees.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    static unformatDMS(dms: string): DegreeDMS {
        const parts = dms.split(':').map(Number);
        if (parts.length !== 3) {
            throw new Error('Invalid DMS format. Expected format is "degrees:minutes:seconds".');
        }
        return {
            degrees: parts[0],
            minutes: parts[1],
            seconds: parts[2]
        };
    }

    static formattedDMStoDegrees(dms: string): number {
        const { degrees, minutes, seconds } = FormattingUtils.unformatDMS(dms);
        return degrees + (minutes / 60) + (seconds / 3600);
    }

    // Function to convert decimal degrees to DMS format
    static convertToDMS(decimalDegrees: number): DegreeDMS {
        // Ensure the number is positive (handle normalization separately if needed)
        const absValue = Math.abs(decimalDegrees);

        // Extract degrees (whole number part)
        const degrees = Math.floor(absValue);

        // Calculate minutes
        const minutesDecimal = (absValue - degrees) * 60;
        const minutes = Math.floor(minutesDecimal);

        // Calculate seconds
        const secondsDecimal = (minutesDecimal - minutes) * 60;
        const seconds = Math.round(secondsDecimal);

        // Handle case where seconds rounds to 60
        if (seconds === 60) {
            return { degrees, minutes: minutes + 1, seconds: 0 };
        }

        return { degrees, minutes, seconds };
    }
}

// House Utilities
export class HouseUtils {
    static readonly HOUSE_MEANINGS: Record<HouseNumber, string> = {
        1: 'Self, Personality, Health, Appearance',
        2: 'Wealth, Family, Speech, Food',
        3: 'Courage, Siblings, Communication, Short Journeys',
        4: 'Home, Mother, Education, Land, Vehicles',
        5: 'Children, Intelligence, Creativity, Romance',
        6: 'Enemies, Disease, Service, Obstacles',
        7: 'Marriage, Partnership, Business, Travel',
        8: 'Longevity, Transformation, Occult, Inheritance',
        9: 'Dharma, Father, Guru, Fortune, Spirituality',
        10: 'Career, Reputation, Authority, Government',
        11: 'Gains, Friends, Elder Siblings, Aspirations',
        12: 'Loss, Expenses, Foreign Travel, Spirituality'
    };

    static readonly HOUSE_TYPES: Record<HouseNumber, 'Trikona' | 'Kendra' | 'Upachaya' | 'Dusthana' | 'Maraka' | 'Regular'> = {
        1: 'Kendra',
        2: 'Maraka',
        3: 'Upachaya',
        4: 'Kendra',
        5: 'Trikona',
        6: 'Dusthana',
        7: 'Kendra',
        8: 'Dusthana',
        9: 'Trikona',
        10: 'Kendra',
        11: 'Upachaya',
        12: 'Dusthana'
    };

    static isKendra(house: HouseNumber): boolean {
        return [1, 4, 7, 10].includes(house);
    }

    static isTrikona(house: HouseNumber): boolean {
        return [1, 5, 9].includes(house);
    }

    static isUpachaya(house: HouseNumber): boolean {
        return [3, 6, 10, 11].includes(house);
    }

    static isDusthana(house: HouseNumber): boolean {
        return [6, 8, 12].includes(house);
    }

    static isMaraka(house: HouseNumber): boolean {
        return [2, 7].includes(house);
    }

    static getHouseMeaning(house: HouseNumber): string {
        return this.HOUSE_MEANINGS[house];
    }

    static getHouseSignificance(house: HouseNumber): string[] {
        return this.HOUSE_MEANINGS[house].split(', ');
    }

    static getHouseType(house: HouseNumber): string {
        return this.HOUSE_TYPES[house];
    }

    static getOppositeHouse(house: HouseNumber): HouseNumber {
        return (((house + 5) % 12) + 1) as HouseNumber;
    }
}
