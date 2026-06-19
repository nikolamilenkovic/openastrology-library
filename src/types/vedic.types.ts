// Vedic Astrology specific types
import { ZodiacSign, HouseNumber, BirthInfo, DegreeDMS, HouseInfo, HousePositions } from './common.types';

// Re-export common types so consumers can import everything from this file
export { ZodiacSign, HouseNumber, BirthInfo, DegreeDMS, HouseInfo, HousePositions };

export type Planet =
    | 'sun'
    | 'moon'
    | 'mars'
    | 'mercury'
    | 'jupiter'
    | 'venus'
    | 'saturn'
    | 'rahu'
    | 'ketu';

export type Nakshatra =
    | 'ashwini'
    | 'bharani'
    | 'krittika'
    | 'rohini'
    | 'mrigashira'
    | 'ardra'
    | 'punarvasu'
    | 'pushya'
    | 'ashlesha'
    | 'magha'
    | 'purva_phalguni'
    | 'uttara_phalguni'
    | 'hasta'
    | 'chitra'
    | 'swati'
    | 'vishakha'
    | 'anuradha'
    | 'jyeshtha'
    | 'moola'
    | 'purva_ashadha'
    | 'uttara_ashadha'
    | 'shravana'
    | 'dhanishta'
    | 'shatabhisha'
    | 'purva_bhadrapada'
    | 'uttara_bhadrapada'
    | 'revati';

export type VedicDignity = 'exalted' | 'debilitated' | 'own_sign' | 'neutral';

export type DashaType = 'vimshottari' | 'yogini' | 'char' | 'kalachakra';

export type AspectType = 'conjunction' | 'opposition' | 'trine' | 'square' | 'sextile';

// Vedic aspect cast by a planet (house-based Drishti)
export interface PlanetAspect {
    house: HouseNumber; // house number that is aspected (1-12)
    aspect: number; // which aspect this is (e.g., 4, 7, 8 for Mars)
    planets: Planet[]; // names of planets within aspected house
}

// Planetary Position (Vedic - includes nakshatra, combustion, etc.)
export interface PlanetPosition {
    name: string; // Planet name
    longitude: number; // 0-360 degrees
    latitude: number; // Declination
    sign: ZodiacSign;
    degree: number; // degree within sign (0-30)
    degreeDMS: DegreeDMS; // DMS representation of degree
    degreeDMSFormatted: string; // Formatted DMS string
    nakshatra: Nakshatra;
    nakshatraPada: number; // 1-4
    pada: number; // Alternative name for nakshatraPada
    house: HouseNumber;
    isRetrograde: boolean;
    isCombust: boolean; // Whether the planet is combust (close to Sun)
    speed: number; // degrees per day
    dignity: VedicDignity;
    aspects: PlanetAspect[]; // Vedic aspects cast by this planet
}

export type PlanetaryPositions = {
    [K in Planet]: PlanetPosition;
};

// Aspects
export interface Aspect {
    planet1: Planet;
    planet2: Planet;
    type: AspectType;
    orb: number; // degrees of orb
    isApplying: boolean;
}

// Yogas (astrological combinations)
export interface Yoga {
    name: string;
    type: 'Raja' | 'Dhana' | 'Arishtabhanga' | 'Neechabhanga' | 'Other';
    description: string;
    planets: Planet[];
    houses: HouseNumber[];
    strength: 'Weak' | 'Moderate' | 'Strong';
}

// Dasha Information
export interface VimshottariDasha {
    type: 'vimshottari';
    dashaPeriods: PlanetDasha[];
}

export interface PlanetDasha {
    planet: Planet;
    startDate: Date;
    endDate: Date;
    subPeriods: PlanetDasha[];
}

// Ashtakavarga Types
export type BhinnaAshtakavarga = {
    [K in Planet | 'lagna']: {
        [T in Planet | 'lagna']: number[]; // 12 values - points per house
    };
};

export type SarvaAshtakavarga = {
    [K in Planet | 'lagna']: number[]; // 12 values - total points per house
};

export interface AshtakavargaCalculations {
    bhinna: BhinnaAshtakavarga;
    sarva: SarvaAshtakavarga;
}

// Calculator options
export interface VedicAstrologyCalculatorOptions {
    ayanamsa?: string;
    houseSystem?: string;
    /** Absolute path to the directory containing Swiss Ephemeris `.se1` files. */
    ephePath?: string;
}

/** @deprecated Use VedicChartCalculations */
export type ChartCalculatorOptions = VedicAstrologyCalculatorOptions;

// Vedic Birth Chart result
export interface VedicChartCalculations {
    birthDateUtc: Date;
    planets: PlanetaryPositions;
    houses: HousePositions;
    yogas: Yoga[];
    ayanamsa: number;
    ascendant: {
        sign: ZodiacSign;
        degree: number;
        degreeDMSFormatted: string;
        nakshatra: Nakshatra;
        longitude: number;
        nakshatraPada: number;
    };
    ashtakavarga: AshtakavargaCalculations;
    dashas: {
        vimshottari: VimshottariDasha;
    };
}

// Astrological Analysis
export interface ChartAnalysis {
    personality: {
        summary: string;
        strengths: string[];
        challenges: string[];
        lifeTheme: string;
    };
    career: {
        suitableFields: string[];
        timing: string;
        challenges: string[];
    };
    relationships: {
        compatibility: string;
        timing: string;
        challenges: string[];
    };
    health: {
        vulnerabilities: string[];
        recommendations: string[];
    };
    spirituality: {
        path: string;
        practices: string[];
    };
}
